process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const http = require("http");
const path = require("path");
const crypto = require("crypto");
const fsSync = require("fs");
const { promises: fs } = fsSync;

const ROOT_DIR = __dirname;

function loadEnvFile(filePath) {
  if (!fsSync.existsSync(filePath)) return;
  const raw = fsSync.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (!key || process.env[key] !== undefined) continue;
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(path.join(ROOT_DIR, ".env"));

const store = require("./src/mysql-store");

const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT_DIR, "data"));
const GENERATED_DIR = path.join(DATA_DIR, "generated");
const PORT = Number(process.env.PORT || 3000);
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const MAX_BODY_BYTES = 16 * 1024 * 1024;
const DEFAULT_MODEL = "gemini-3.1-flash-image";
const GEMINI_MODEL = "gemini-3.1-flash-image";
const CHECKIN_CREDIT = Number.parseInt(process.env.CHECKIN_CREDIT || "1", 10) || 1;

const generationWindows = new Map();
const loginAttempts = new Map();
const accountLockouts = new Map();

function checkLoginRate(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 10;
  const entry = loginAttempts.get(ip);
  if (entry) {
    if (now - entry.time > windowMs) {
      loginAttempts.set(ip, { count: 1, time: now });
      return;
    }
    if (entry.count >= maxAttempts) {
      throw httpError("Too many login attempts. Try again later.", 429);
    }
    entry.count++;
  } else {
    loginAttempts.set(ip, { count: 1, time: now });
  }
}

function clearLoginRate(ip) {
  loginAttempts.delete(ip);
}

function checkAccountLockout(email) {
  const lockout = accountLockouts.get(email);
  if (lockout && lockout.count >= 5) {
    const elapsed = Date.now() - lockout.time;
    if (elapsed < 15 * 60 * 1000) {
      throw httpError("Account temporarily locked. Try again later.", 429);
    }
    accountLockouts.delete(email);
  }
}

function recordFailedLogin(email) {
  const lockout = accountLockouts.get(email) || { count: 0, time: Date.now() };
  lockout.count++;
  lockout.time = Date.now();
  accountLockouts.set(email, lockout);
}

function clearAccountLockout(email) {
  accountLockouts.delete(email);
}

const API_RATE_WINDOW_MS = 60 * 1000;
const API_RATE_MAX = 30;
const GENERATE_RATE_MAX = 6;

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function makeCsp(nonce) {
  return `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: blob:; connect-src 'self' https://imagens.ru wss://imagens.ru; frame-ancestors 'none'`;
}

function csrfCookie(token) {
  return `csrf=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`;
}

function ensureCsrf(req, res, headers) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.csrf || res._csrfToken || generateToken();
  if (!cookies.csrf) {
    headers["Set-Cookie"] = csrfCookie(token);
  }
  headers["X-CSRF-Token"] = token;
  res._csrfToken = token;
}

const apiRateMap = new Map();
function checkApiRate(ip, maxReqs, windowMs) {
  const now = Date.now();
  const entry = apiRateMap.get(ip);
  if (entry) {
    if (now - entry.time > windowMs) {
      apiRateMap.set(ip, { count: 1, time: now });
      return;
    }
    if (entry.count >= maxReqs) {
      throw httpError("Too many requests. Try again later.", 429);
    }
    entry.count++;
  } else {
    apiRateMap.set(ip, { count: 1, time: now });
  }
}

const baseSecurityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), usb=(), bluetooth=(), serial()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
};

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  ...baseSecurityHeaders
};

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".ico", "image/x-icon"]
]);

function httpError(message, status = 400, details) {
  return Object.assign(new Error(message), { status, details });
}

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix = "") {
  return `${prefix}${crypto.randomBytes(12).toString("hex")}`;
}

function hashSessionToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const index = pair.indexOf("=");
        if (index === -1) return [pair, ""];
        return [decodeURIComponent(pair.slice(0, index)), decodeURIComponent(pair.slice(index + 1))];
      })
  );
}

async function createSession(userId) {
  const token = randomId("sess_");
  await store.createSession(hashSessionToken(token), userId, new Date(Date.now() + SESSION_TTL_MS));
  return token;
}

async function destroySession(token) {
  if (!token) return;
  await store.deleteSession(hashSessionToken(token)).catch(() => null);
}

async function getCurrentUser(req) {
  const token = parseCookies(req.headers.cookie).session;
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const user = await store.getSessionUser(tokenHash);
  if (!user) {
    await store.deleteSession(tokenHash).catch(() => null);
    return null;
  }

  await store.touchSession(tokenHash, new Date(Date.now() + SESSION_TTL_MS));
  if (user) {
    const settings = await store.getSettings();
    user.effectiveConfig = mergeConfig(settings.uiConfig, user.uiConfig);
  }
  return { user };
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const iterations = 210000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");
  return { salt, iterations, hash };
}

function verifyPassword(password, passwordHash) {
  if (!passwordHash?.salt || !passwordHash?.hash || !passwordHash?.iterations) return false;
  const hash = crypto
    .pbkdf2Sync(password, passwordHash.salt, passwordHash.iterations, 32, "sha256")
    .toString("hex");
  return timingSafeEqual(hash, passwordHash.hash);
}

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    credits: user.credits,
    unlimited: Boolean(user.unlimited),
    createdAt: user.createdAt,
    effectiveConfig: user.effectiveConfig || "",
    uiConfig: user.uiConfig || ""
  };
}

function getOpenAIApiKey(settings) {
  return settings.openaiApiKey || process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
}

function getOpenAIBaseUrl(settings = {}) {
  return String(settings.apiBaseUrl || process.env.AI_API_BASE_URL || process.env.OPENAI_BASE_URL || "").trim().replace(/\/+$/, "");
}

function getChatCompletionsEndpoint(settings = {}) {
  const cleanBase = getOpenAIBaseUrl(settings);
  if (!cleanBase) throw httpError("AI API base URL is not configured", 400);
  if (cleanBase.endsWith("/chat/completions")) return cleanBase;
  if (cleanBase.endsWith("/v1")) return `${cleanBase}/chat/completions`;
  return `${cleanBase}/v1/chat/completions`;
}

function publicSettings(settings) {
  return {
    hasApiKey: Boolean(getOpenAIApiKey(settings) && getOpenAIBaseUrl(settings)),
    model: GEMINI_MODEL,
    allowRegistration: Boolean(settings.allowRegistration),
    requireApproval: Boolean(settings.requireApproval),
    defaultCredits: Number(settings.defaultCredits || 0),
    generationCreditCost: Number(settings.generationCreditCost ?? 1),
    checkinCredit: CHECKIN_CREDIT,
    maxImagesPerRequest: Number(settings.maxImagesPerRequest || 1),
    uiConfig: settings.uiConfig || "",
    providers: (settings.providers || []).map(function(p) { return { id: p.id, name: p.name, baseUrl: p.baseUrl, model: p.model, type: p.type || "openai", enabled: p.enabled !== false }; }),
    unlimitedGlobal: Boolean(settings.unlimitedGlobal)
  };
}

function adminSettings(settings) {
  const key = getOpenAIApiKey(settings);
  return {
    ...publicSettings(settings),
    providers: settings.providers || [],
    apiBaseUrl: getOpenAIBaseUrl(settings),
    apiKeyMask: key ? `${key.slice(0, 7)}...${key.slice(-4)}` : "",
    uiConfig: settings.uiConfig || ""
  };
}

function buildHeaders(res, extra = {}) {
  const hdrs = { ...baseSecurityHeaders, ...extra };
  if (res._nonce) hdrs["Content-Security-Policy"] = makeCsp(res._nonce);
  if (res._req) ensureCsrf(res._req, res, hdrs);
  return hdrs;
}

function sendJson(res, status, payload, extraHeaders = {}) {
  const hdrs = buildHeaders(res, { ...jsonHeaders, ...extraHeaders });
  res.writeHead(status, hdrs);
  res.end(JSON.stringify(payload));
}

function sendNoContent(res, extraHeaders = {}) {
  const hdrs = buildHeaders(res, { "Cache-Control": "no-store", ...extraHeaders });
  res.writeHead(204, hdrs);
  res.end();
}

function sendError(res, status, message, details) {
  sendJson(res, status, { error: message, details });
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw httpError("Request body is too large", 413);
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw httpError("Invalid JSON body", 400);
  }
}

function stripHtml(value) {
  return String(value || "").replace(/<[^>]*>/g, "").trim();
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function requireEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw httpError("Please enter a valid email", 400);
  }
}

function requirePassword(password) {
  if (String(password || "").length < 8) {
    throw httpError("Password must be at least 8 characters", 400);
  }
}

function cleanPrompt(prompt) {
  const value = String(prompt || "").trim();
  if (value.length < 3) {
    throw httpError("Prompt is too short", 400);
  }
  if (value.length > 4000) {
    throw httpError("Prompt cannot exceed 4000 characters", 400);
  }
  return value;
}

function choose(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function sanitizePositiveInt(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function mergeConfig(globalConfig, userConfig) {
  const global = (() => { try { return JSON.parse(globalConfig || "{}"); } catch { return {}; } })();
  const user = (() => { try { return JSON.parse(userConfig || "{}"); } catch { return {}; } })();
  const merged = { ...global };
  for (const key of Object.keys(user)) {
    if (Array.isArray(user[key])) {
      merged[key] = user[key];
    } else if (typeof user[key] === "boolean" || typeof user[key] === "number") {
      merged[key] = user[key];
    }
  }
  return JSON.stringify(merged);
}

function normalizeImageSize(value) {
  const raw = String(value || "auto").trim().toLowerCase();
  if (raw === "auto") return "auto";
  return raw; // Trust the frontend inputs or custom values
}

function ensureAdmin(current) {
  if (!current?.user || current.user.role !== "admin") {
    throw httpError("Admin permission required", 403);
  }
}

function ensureAuthenticated(current) {
  if (!current?.user) {
    throw httpError("Please sign in first", 401);
  }
}

function canTouchGeneration(user, generation) {
  return user.role === "admin" || generation.userId === user.id;
}

function getClientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket?.remoteAddress || "";
}

function getUserAgent(req) {
  return String(req.headers["user-agent"] || "").slice(0, 512);
}

function enforceGenerationRate(userId) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxPerWindow = 6;
  const entries = (generationWindows.get(userId) || []).filter((stamp) => now - stamp < windowMs);
  if (entries.length >= maxPerWindow) {
    throw httpError("Too many generation requests. Please try again later", 429);
  }
  entries.push(now);
  generationWindows.set(userId, entries);
}

function extractImageUrl(text) {
  const match = String(text || "").match(/(https?:\/\/[^\s"'\])]+\.(?:jpg|jpeg|png|webp)[^\s"'\])]*)/i);
  return match ? match[1] : null;
}

async function downloadImage(url, timeoutMs = 15000) {
  // Method 1: https.get (native Node.js TLS)
  try {
    return await new Promise((resolve, reject) => {
      const u = new URL(url);
      const mod = u.protocol === "https:" ? require("https") : require("http");
      const req = mod.get(url, { rejectUnauthorized: false, timeout: timeoutMs }, (res) => {
        if (res.statusCode !== 200) { reject(new Error("HTTP " + res.statusCode)); return; }
        const chunks = [];
        res.on("data", c => chunks.push(c));
        res.on("end", () => resolve({ b64: Buffer.concat(chunks).toString("base64") }));
      });
      req.on("error", reject);
      req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    });
  } catch (e) { console.log("[DL 1/3 https.get] " + e.message); }

  // Method 2: curl (system OpenSSL)
  try {
    const { execSync } = require("child_process");
    const buf = execSync(`curl -s -m ${Math.ceil(timeoutMs / 1000)} "${url}"`, { timeout: timeoutMs + 5000, maxBuffer: 50 * 1024 * 1024 });
    if (buf && buf.length > 100) return { b64: Buffer.from(buf).toString("base64") };
    throw new Error("curl returned empty or too small");
  } catch (e) { console.log("[DL 2/3 curl] " + e.message); }

  // Method 3: fetch with custom https.Agent
  try {
    const https = require("https");
    const agent = new https.Agent({ rejectUnauthorized: false, keepAlive: false });
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const resp = await fetch(url, { agent, signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0" } });
    clearTimeout(t);
    if (resp.ok) return { b64: Buffer.from(await resp.arrayBuffer()).toString("base64") };
    throw new Error("HTTP " + resp.status);
  } catch (e) { console.log("[DL 3/3 fetch+agent] " + e.message); }

  throw httpError("Image download failed", 502);
}

async function callGemini(settings, prompt, references, size, n = 1) {
  const fetchWithKey = async (apiKey, base, model, prompt, references, size, providerType) => {
    providerType = providerType || (model.includes("gemini") ? "chat" : "openai");
    const chatEndpoint = base.endsWith("/v1") ? base + "/chat/completions" : base + "/v1/chat/completions";
    let payload, endpoint;
    if (providerType === "chat") {
      const c = [{ type: "text", text: prompt + (size ? " (" + size + ")" : "") }];
      if (references && Array.isArray(references)) {
        for (const ref of references) {
          const s = String(ref || "");
          if (s.startsWith("data:image/") || s.startsWith("http")) {
            c.push({ type: "image_url", image_url: { url: s } });
          }
        }
      }
      endpoint = chatEndpoint;
      payload = { model, messages: [{ role: "user", content: c }], max_tokens: 4096 };
    } else {
      endpoint = (base.endsWith("/v1") ? base : base + "/v1") + "/images/generations";
      payload = { model, prompt, n: 1, size: size || "1024x1024" };
      if (references && Array.isArray(references) && references.length > 0) {
        payload.image_prompts = references;
      }
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    if (!response.ok) {
      let errMsg = "API request failed";
      try { const err = JSON.parse(text); errMsg = err.error?.message || errMsg; } catch(e) {}
      throw httpError(errMsg, response.status);
    }
    let data;
    try { data = JSON.parse(text); } catch(e) { throw httpError("Invalid API response", 502); }
    if (providerType === "chat") {
      const msgContent = data.choices?.[0]?.message?.content || "";
      const imageUrl = extractImageUrl(msgContent);
      if (imageUrl) {
        try {
          return await downloadImage(imageUrl, 15000);
        } catch(e) { console.log("[IMG DL FAIL] " + e.message); }
      }
      const genEndpoint = (base.endsWith("/v1") ? base : base + "/v1") + "/images/generations";
      const genRes = await fetch(genEndpoint, {
        method: "POST",
        headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt: prompt + (size ? " (" + size + ")" : ""), n: 1, size: size || "1024x1024" })
      });
      const genText = await genRes.text();
      if (!genRes.ok) throw httpError("API request failed", genRes.status);
      let genData;
      try { genData = JSON.parse(genText); } catch(e) { throw httpError("Invalid API response", 502); }
      if (genData.data?.[0]?.b64_json) return { b64: genData.data[0].b64_json };
      if (genData.data?.[0]?.url) {
        try {
          return await downloadImage(genData.data[0].url, 30000);
        } catch(e) { console.log("[FALLBACK DL FAIL] " + e.message); }
      }
      throw httpError("No image in fallback response", 502);
    }
    if (data.data?.[0]?.b64_json) return { b64: data.data[0].b64_json };
    if (data.data?.[0]?.url) {
      try {
        return await downloadImage(data.data[0].url, 30000);
      } catch(e) { console.log("[IMG DL FAIL] " + e.message); throw httpError("Image download failed", 502); }
    }
    throw httpError("No image in API response", 502);
  };

  const fetchWithFailover = async () => {
    const providers = (settings.providers || []).filter(p => p && p.apiKey && p.enabled !== false);
    if (providers.length > 0) {
      let lastError;
      for (const p of providers) {
        try {
          console.log("[PROVIDER] trying " + p.name + " (" + p.id + ") type=" + (p.type || "openai"));
          return await fetchWithKey(p.apiKey, p.baseUrl, p.model || GEMINI_MODEL, prompt, references, size, p.type);
        } catch (err) {
          console.log("[PROVIDER FAIL] " + p.name + ": " + err.message);
          lastError = err;
        }
      }
      throw lastError || httpError("All providers failed", 502);
    }
    const apiKey = getOpenAIApiKey(settings);
    if (!apiKey) throw httpError("API key is not configured", 400);
    if (!getOpenAIBaseUrl(settings)) throw httpError("API base URL is not configured", 400);
    return await fetchWithKey(apiKey, getOpenAIBaseUrl(settings), GEMINI_MODEL, prompt, references, size, "chat");
  };

  const requests = Array.from({ length: n }, () => fetchWithFailover());
  const results = await Promise.all(requests);
  const items = [];
  for (const result of results) {
    if (!result || !result.b64) continue;
    items.push({ b64_json: result.b64, revised_prompt: prompt, extension: "png" });
  }
  console.log("[GEMINI DONE] " + items.length + " images");
  return { data: items };
}

async function callOpenAIResponses(settings, payload) {
  const apiKey = getOpenAIApiKey(settings);
  if (!apiKey) {
    throw httpError("OpenAI API key is not configured", 400);
  }
  if (!getOpenAIBaseUrl(settings)) {
    throw httpError("AI API base URL is not configured", 400);
  }

  const response = await fetch(getOpenAIResponsesEndpoint(settings), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const message = data?.error?.message || "OpenAI image edit request failed";
    throw httpError(message, response.status, data);
  }

  return data;
}

function dataUrlToBlob(dataUrl) {
  const match = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw httpError("Invalid image data", 400);
  return new Blob([Buffer.from(match[2], "base64")], { type: match[1] });
}

async function imageSourceToBlob(source) {
  if (String(source).startsWith("data:")) return dataUrlToBlob(source);
  const response = await fetch(source);
  if (!response.ok) throw httpError(`Editable image download failed: ${response.status}`, 400);
  return new Blob([Buffer.from(await response.arrayBuffer())], {
    type: response.headers.get("content-type") || "image/png"
  });
}

async function callOpenAIImageEdits(settings, payload) {
  const apiKey = getOpenAIApiKey(settings);
  if (!apiKey) {
    throw httpError("OpenAI API key is not configured", 400);
  }
  if (!getOpenAIBaseUrl(settings)) {
    throw httpError("AI API base URL is not configured", 400);
  }

  const form = new FormData();
  form.set("model", payload.model);
  form.set("prompt", payload.prompt);
  form.set("n", String(payload.n || 1));
  form.set("size", payload.size || "auto");
  form.set("response_format", "url");
  form.set("image", await imageSourceToBlob(payload.imageData), "image.png");
  if (payload.maskData?.startsWith("data:image/")) {
    form.set("mask", dataUrlToBlob(payload.maskData), "mask.png");
  }

  const response = await fetch(getOpenAIEditEndpoint(settings), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: form
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const message = data?.error?.message || "OpenAI image edit request failed";
    throw httpError(message, response.status, data);
  }

  return data;
}

function extractImageItems(openaiResult) {
  const directItems = Array.isArray(openaiResult.data) ? openaiResult.data : [];
  const items = directItems.filter((item) => item?.b64_json || item?.url);
  const outputs = Array.isArray(openaiResult.output) ? openaiResult.output : [];

  for (const output of outputs) {
    if (output?.type === "image_generation_call" && output.result) {
      const result = String(output.result);
      items.push(result.startsWith("http") ? { url: result } : { b64_json: result.replace(/^data:image\/\w+;base64,/, "") });
    }
    const content = Array.isArray(output?.content) ? output.content : [];
    for (const part of content) {
      if (part?.type === "output_image" && part.image_base64) {
        items.push({ b64_json: String(part.image_base64).replace(/^data:image\/\w+;base64,/, "") });
      }
      if (part?.type === "output_image" && part.image_url) {
        items.push({ url: String(part.image_url) });
      }
    }
  }

  const toolCalls = openaiResult.choices?.[0]?.message?.tool_calls || [];
  for (const call of toolCalls) {
    if (call?.result) items.push({ b64_json: String(call.result).replace(/^data:image\/\w+;base64,/, "") });
    try {
      const args = JSON.parse(call?.function?.arguments || "{}");
      if (args.result || args.image) {
        const result = String(args.result || args.image);
        items.push(result.startsWith("http") ? { url: result } : { b64_json: result.replace(/^data:image\/\w+;base64,/, "") });
      }
    } catch {
      // Ignore unknown proxy formats.
    }
  }

  return items;
}

function extensionFromContentType(contentType, fallback) {
  const normalized = String(contentType || "").toLowerCase();
  if (normalized.includes("image/jpeg") || normalized.includes("image/jpg")) return "jpg";
  if (normalized.includes("image/webp")) return "webp";
  if (normalized.includes("image/png")) return "png";
  return fallback === "jpeg" ? "jpg" : fallback;
}

async function imageItemToBuffer(item, request) {
  const fallbackExtension = request.output_format === "jpeg" ? "jpg" : request.output_format;
  if (item.b64_json) {
    const value = String(item.b64_json);
    const match = value.match(/^data:(image\/[^;]+);base64,(.+)$/);
    return {
      buffer: Buffer.from(match ? match[2] : value, "base64"),
      extension: match ? extensionFromContentType(match[1], fallbackExtension) : fallbackExtension
    };
  }
  if (item.url) {
    const parsedUrl = new URL(item.url);
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" || hostname.startsWith("192.168.") || hostname.startsWith("10.") || hostname.startsWith("172.")) {
      throw httpError("Image URL not allowed", 400);
    }
    const response = await fetch(item.url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      throw httpError(`Image URL download failed: ${response.status}`, 502);
    }
    const contentType = response.headers.get("content-type") || "";
    return {
      buffer: Buffer.from(await response.arrayBuffer()),
      extension: extensionFromContentType(contentType, fallbackExtension)
    };
  }
  return null;
}

async function saveGeneratedImages(user, request, openaiResult) {
  await fs.mkdir(GENERATED_DIR, { recursive: true });
  const items = extractImageItems(openaiResult);
  const saved = [];

  for (const item of items) {
    const imageFile = await imageItemToBuffer(item, request);
    if (!imageFile?.buffer?.length) continue;
    const id = randomId("img_");
    const extension = imageFile.extension;
    const filename = `${id}.${extension}`;
    const userDir = path.join(GENERATED_DIR, user.id);
    await fs.mkdir(userDir, { recursive: true });
    const absolutePath = path.join(userDir, filename);
    await fs.writeFile(absolutePath, imageFile.buffer);

    const storedPath = user.id + "/" + filename;
    const generation = {
      id,
      userId: user.id,
      prompt: request.prompt,
      model: request.model,
      size: request.size,
      quality: request.quality,
      background: request.background,
      outputFormat: request.output_format,
      filename: storedPath,
      isPublic: Boolean(request.isPublic),
      revisedPrompt: item.revised_prompt || "",
      usage: openaiResult.usage || item.usage || null,
      createdAt: nowIso()
    };
    saved.push({
      ...generation,
      imageUrl: `/api/images/${id}/file`
    });
  }

  return saved;
}

async function routeApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    const current = await getCurrentUser(req);
    const firstRun = (await store.countUsers()) === 0;
    if (!current?.user) {
      return sendJson(res, 200, { ok: true, firstRun, settings: { hasApiKey: false, allowRegistration: false, requireApproval: true, defaultCredits: 0, generationCreditCost: 1, checkinCredit: 0, maxImagesPerRequest: 1, uiConfig: "" } });
    }
    const settings = await store.getSettings();
    return sendJson(res, 200, {
      ok: true,
      firstRun: firstRun && current.user.role === "admin",
      settings: publicSettings(settings)
    });
  }

  if (req.method === "GET" && url.pathname === "/api/auth/me") {
    const current = await getCurrentUser(req);
    if (!current?.user) {
      return sendJson(res, 200, { user: null, firstRun: (await store.countUsers()) === 0, settings: { hasApiKey: false, allowRegistration: false, requireApproval: true, defaultCredits: 0, generationCreditCost: 1, checkinCredit: 0, maxImagesPerRequest: 1, uiConfig: "" } });
    }
    const settings = await store.getSettings();
    return sendJson(res, 200, {
      user: serializeUser(current.user),
      firstRun: false,
      checkin: {
        checkedInToday: await store.hasCheckedInToday(current.user.id),
        credit: CHECKIN_CREDIT
      },
      settings: publicSettings(settings)
    });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/register") {
    throw httpError("Registration is closed. Contact administrator.", 403);
  }

  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const ip = getClientIp(req);
    checkLoginRate(ip);
    const body = await readJsonBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const user = await store.getUserByEmail(email);
    checkAccountLockout(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      recordFailedLogin(email);
      throw httpError("Email or password is incorrect", 401);
    }
    clearLoginRate(ip);
    clearAccountLockout(email);
    if (user.status !== "active") {
      throw httpError("Account is disabled", 403);
    }
    const token = await createSession(user.id);
    return sendJson(res, 200, { user: serializeUser(user) }, {
      "Set-Cookie": `session=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
    });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/logout") {
    await destroySession(parseCookies(req.headers.cookie).session);
    return sendNoContent(res, {
      "Set-Cookie": "session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
    });
  }

  if (req.method === "POST" && url.pathname === "/api/checkin") {
    const current = await getCurrentUser(req);
    ensureAuthenticated(current);
    const user = await store.getUserById(current.user.id);
    if (!user || user.status !== "active") {
      throw httpError("Account is not active", 403);
    }
    const result = await store.checkInToday(user.id, CHECKIN_CREDIT);
    const updatedUser = await store.getUserById(user.id);
    return sendJson(res, 200, {
      checkedIn: result.checkedIn,
      awarded: result.checkedIn ? CHECKIN_CREDIT : 0,
      credits: result.credits,
      user: serializeUser(updatedUser),
      checkin: {
        checkedInToday: true,
        credit: CHECKIN_CREDIT
      }
    });
  }

  if (req.method === "GET" && url.pathname === "/api/settings") {
    return sendJson(res, 200, publicSettings(await store.getSettings()));
  }

  if (req.method === "GET" && url.pathname === "/api/stats/today") {
    const offset = Math.max(0, Number.parseInt(process.env.TODAY_GENERATED_OFFSET || "0", 10) || 0);
    const generatedToday = await store.countTodayGenerations();
    return sendJson(res, 200, {
      todayGenerated: offset + generatedToday
    });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/settings") {
    const current = await getCurrentUser(req);
    ensureAuthenticated(current);
    ensureAdmin(current);
    return sendJson(res, 200, adminSettings(await store.getSettings()));
  }

  if (req.method === "PATCH" && url.pathname === "/api/admin/settings") {
    const current = await getCurrentUser(req);
    ensureAuthenticated(current);
    ensureAdmin(current);
    const body = await readJsonBody(req);
    const patch = {};

    if (typeof body.openaiApiKey === "string") {
      const key = body.openaiApiKey.trim();
      if (key) patch.openaiApiKey = key;
    }
    if (body.clearApiKey === true) patch.openaiApiKey = "";
    if (typeof body.apiBaseUrl === "string") {
      const cleanUrl = body.apiBaseUrl.trim().replace(/\/+$/, "").slice(0, 255);
      try {
        const parsed = new URL(cleanUrl);
        const host = parsed.hostname.toLowerCase();
        if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host.startsWith("192.168.") || host.startsWith("10.") || host.startsWith("172.") || host.endsWith(".local") || host.endsWith(".internal")) {
          throw httpError("Invalid API base URL: private IPs not allowed", 400);
        }
      } catch (err) {
        if (err.status) throw err;
        throw httpError("Invalid API base URL format", 400);
      }
      patch.apiBaseUrl = cleanUrl;
    }
    if (typeof body.uiConfig === "string") {
      patch.uiConfig = body.uiConfig.trim();
    }
    if (typeof body.model === "string" && body.model.trim()) {
      patch.model = body.model.trim().slice(0, 80);
    }
    if (body.defaultCredits !== undefined) {
      patch.defaultCredits = Math.max(0, Math.min(10000, Number.parseInt(body.defaultCredits, 10) || 0));
    }
    if (body.generationCreditCost !== undefined) {
      patch.generationCreditCost = Math.max(0, Math.min(10000, Number.parseInt(body.generationCreditCost, 10) || 0));
    }
    if (body.maxImagesPerRequest !== undefined) {
      patch.maxImagesPerRequest = Math.max(1, Math.min(4, Number.parseInt(body.maxImagesPerRequest, 10) || 1));
    }
    if (typeof body.allowRegistration === "boolean") patch.allowRegistration = body.allowRegistration ? 1 : 0;
    if (typeof body.requireApproval === "boolean") patch.requireApproval = body.requireApproval ? 1 : 0;
    if (Array.isArray(body.providers)) {
      const validProviders = body.providers.filter(p => p && typeof p.id === "string" && typeof p.name === "string");
      patch.providers = JSON.stringify(validProviders.map(p => ({
        id: p.id, name: p.name, apiKey: p.apiKey || "", baseUrl: p.baseUrl || "",
        model: p.model || "", type: p.type || "openai", enabled: p.enabled !== false
      })));
    }
    if (typeof body.unlimitedGlobal === "boolean") patch.unlimitedGlobal = body.unlimitedGlobal ? 1 : 0;

    const settings = await store.updateSettings(patch);
    return sendJson(res, 200, adminSettings(settings));
  }

  
    if (req.method === "POST" && url.pathname === "/api/admin/users/create") {
      const current = await getCurrentUser(req);
      ensureAuthenticated(current);
      ensureAdmin(current);
      const body = await readJsonBody(req);
      if (!body.email || !body.password) throw httpError("Email and password required", 400);
      const existing = await store.getUserByEmail(body.email);
      if (existing) throw httpError("Email already exists", 409);
      const hash = hashPassword(body.password);
      await store.createUser({
        id: randomId("usr_"),
        email: body.email,
        passwordHash: hash,
        name: stripHtml(body.name || "").slice(0, 60),
        role: "user",
        status: "active",
        credits: body.credits !== undefined ? Math.max(0, Number(body.credits)) : 10,
        createdAt: nowIso()
      });
      return sendJson(res, 200, { success: true });
    }
    if (req.method === "GET" && url.pathname === "/api/admin/users") {
    const current = await getCurrentUser(req);
    ensureAuthenticated(current);
    ensureAdmin(current);
    return sendJson(res, 200, {
      users: (await store.listUsers()).map(serializeUser)
    });
  }

  if (req.method === "GET" && url.pathname === "/api/admin/generations") {
    const current = await getCurrentUser(req);
    ensureAuthenticated(current);
    ensureAdmin(current);
    const filters = {
      search: url.searchParams.get("search") || "",
      userId: url.searchParams.get("userId") || "",
      ip: url.searchParams.get("ip") || "",
      status: url.searchParams.get("status") || "",
      isPublic: url.searchParams.has("isPublic") ? (url.searchParams.get("isPublic") === "true" ? true : false) : undefined,
      from: url.searchParams.get("from") || "",
      to: url.searchParams.get("to") || "",
      limit: sanitizePositiveInt(url.searchParams.get("limit"), 50, 500),
      offset: sanitizePositiveInt(url.searchParams.get("offset"), 0, 10000)
    };
    const result = await store.listGenerationRequestsFiltered(filters);
    return sendJson(res, 200, result);
  }

  const userMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (userMatch && req.method === "PATCH") {
    const current = await getCurrentUser(req);
    ensureAuthenticated(current);
    ensureAdmin(current);
    const target = await store.getUserById(userMatch[1]);
    if (!target) throw httpError("User not found", 404);
    const body = await readJsonBody(req);
    const patch = {};

    if (typeof body.name === "string") patch.name = stripHtml(body.name).slice(0, 60) || target.name;
    if (typeof body.email === "string" && body.email.includes("@")) patch.email = body.email.trim().toLowerCase().slice(0, 255);
    if (body.password) {
      requirePassword(body.password);
      var pwHash = hashPassword(body.password);
      patch.passwordSalt = pwHash.salt;
      patch.passwordIterations = pwHash.iterations;
      patch.passwordHash = pwHash.hash;
    }
    if (["admin", "user"].includes(body.role)) patch.role = body.role;
    if (["active", "disabled"].includes(body.status)) patch.status = body.status;
    if (body.credits !== undefined) {
      patch.credits = Math.max(0, Math.min(100000, Number.parseInt(body.credits, 10) || 0));
    }
    if (typeof body.unlimited === "boolean") patch.unlimited = body.unlimited ? 1 : 0;
    if (target.id === current.user.id) {
      patch.role = "admin";
      patch.status = "active";
    }

    let user = await store.updateUser(target.id, patch);
    if (body.creditDelta !== undefined) {
      const delta = Math.max(-100000, Math.min(100000, Number.parseInt(body.creditDelta, 10) || 0));
      user = await store.adjustCredits(target.id, delta);
    }
    return sendJson(res, 200, { user: serializeUser(user) });
  }

  const configMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/config$/);
  if (userMatch && req.method === "DELETE") {
    const current = await getCurrentUser(req);
    ensureAuthenticated(current);
    ensureAdmin(current);
    if (userMatch[1] === current.user.id) throw httpError("Cannot delete yourself", 400);
    await store.deleteUser(userMatch[1]);
    return sendNoContent(res);
  }
  if (configMatch && req.method === "GET") {
    const current = await getCurrentUser(req);
    ensureAuthenticated(current);
    ensureAdmin(current);
    const target = await store.getUserById(configMatch[1]);
    if (!target) throw httpError("User not found", 404);
    return sendJson(res, 200, { uiConfig: target.uiConfig || "" });
  }
  if (configMatch && req.method === "PATCH") {
    const current = await getCurrentUser(req);
    ensureAuthenticated(current);
    ensureAdmin(current);
    const target = await store.getUserById(configMatch[1]);
    if (!target) throw httpError("User not found", 404);
    const body = await readJsonBody(req);
    if (typeof body.uiConfig === "string") {
      await store.updateUser(target.id, { uiConfig: body.uiConfig.trim() });
    }
    return sendJson(res, 200, { success: true });
  }

  if (req.method === "GET" && url.pathname === "/api/images/history") {
    const current = await getCurrentUser(req);
    ensureAuthenticated(current);
    const before = String(url.searchParams.get("before") || "").trim();
    const limit = Math.max(1, Math.min(200, Number(url.searchParams.get("limit")) || 20));
    const targetUserId = url.searchParams.get("userId") || "";
    const adminShowAll = targetUserId === "all" && current.user.role === "admin";
    const effectiveUser = adminShowAll
      ? current.user
      : (targetUserId && current.user.role === "admin")
        ? (await store.getUserById(targetUserId)) || current.user
        : current.user;
    const items = await store.listGenerationsForUser(effectiveUser, { before: before || undefined, limit: limit + 1, adminShowAll });
    const hasMore = items.length > limit;
    if (hasMore) items.pop();
    const generations = items.map((generation) => ({
      ...generation,
      imageUrl: `/api/images/${generation.id}/file`
    }));
    return sendJson(res, 200, { generations, hasMore, nextBefore: hasMore ? generations[generations.length - 1]?.id : null });
  }

  if (req.method === "GET" && url.pathname === "/api/images/public") {
    const limit = sanitizePositiveInt(url.searchParams.get("limit"), 60, 120);
    const generations = (await store.listPublicGenerations(limit)).map((generation) => ({
      ...generation,
      imageUrl: `/api/images/${generation.id}/file`
    }));
    return sendJson(res, 200, { generations });
  }

  if (req.method === "POST" && url.pathname === "/api/images/generate") {
    const current = await getCurrentUser(req);
    ensureAuthenticated(current);
    enforceGenerationRate(current.user.id);

    const body = await readJsonBody(req);
    const prompt = cleanPrompt(body.prompt);
    const settings = await store.getSettings();

    if (body.references && Array.isArray(body.references)) {
      for (const ref of body.references) {
        if (typeof ref !== "string" || ref.length > 16000000) throw httpError("Invalid reference", 400);
        if (!ref.startsWith("data:image/") && !ref.startsWith("http://") && !ref.startsWith("https://")) {
          throw httpError("Invalid reference format", 400);
        }
        if (ref.startsWith("http")) {
          try {
            const hostname = new URL(ref).hostname.toLowerCase();
            if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" || hostname.startsWith("192.168.") || hostname.startsWith("10.") || hostname.startsWith("172.") || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
              throw httpError("Reference URL not allowed", 400);
            }
          } catch { throw httpError("Invalid reference URL", 400); }
        }
      }
    }
    console.log(`[GENERATE] prompt="${prompt.slice(0, 80)}" size=${body.size} model=${settings.model}`);

    const user = await store.getUserById(current.user.id);
    if (!user || user.status !== "active") {
      throw httpError("Account is not active", 403);
    }

    const hasProviders = (settings.providers || []).some(p => p && p.apiKey && p.enabled !== false);
    if (!hasProviders && (!getOpenAIApiKey(settings) || !getOpenAIBaseUrl(settings))) {
      throw httpError("AI API is not configured", 400);
    }

    const maxImages = Number(settings.maxImagesPerRequest || 1);
    const n = sanitizePositiveInt(body.n, 1, maxImages);
    const costPerImage = Math.max(0, Number(settings.generationCreditCost ?? 1) || 0);
    const totalCost = costPerImage * n;
    const request = {
      model: GEMINI_MODEL,
      prompt,
      n,
      size: normalizeImageSize(body.size),
      quality: "auto",
      background: "auto",
      output_format: "png",
      isPublic: false
    };
    const auditId = randomId("req_");
    await store.insertGenerationRequest({
      id: auditId,
      userId: user.id,
      prompt,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
      isPublic: request.isPublic,
      status: "pending",
      references: body.references || []
    });

    const isUnlimited = settings.unlimitedGlobal || user.unlimited;
    let reservedCredits = false;
    if (totalCost > 0 && !isUnlimited) {
      reservedCredits = await store.reserveCredits(user.id, totalCost);
      if (!reservedCredits) {
        await store.updateGenerationRequest(auditId, {
          status: "failed",
          errorMessage: "Not enough credits"
        });
        throw httpError("Not enough credits", 402);
      }
    }

    try {
      const references = body.references || [];
      const geminiResult = await callGemini(settings, prompt, references, request.size, n);
      const saved = await saveGeneratedImages(user, request, geminiResult);
      if (!saved.length) {
        throw httpError("API did not return a savable image", 502);
      }
      await store.insertGenerations(saved);
      await store.updateGenerationRequest(auditId, {
        status: "success",
        firstGenerationId: saved[0]?.id || "",
        generationIds: saved.map((generation) => generation.id)
      });
      reservedCredits = false;
      if (costPerImage > 0 && saved.length < n) {
        await store.addCredits(user.id, costPerImage * (n - saved.length)).catch((error) => console.error(error));
      }

      return sendJson(res, 200, {
        generations: saved,
        credits: await store.getUserCredits(user.id),
        generationCost: costPerImage
      });
    } catch (error) {
      if (reservedCredits) await store.addCredits(user.id, totalCost).catch((refundError) => console.error(refundError));
      await store.updateGenerationRequest(auditId, {
        status: "failed",
        errorMessage: String(error.message || error).slice(0, 2000)
      }).catch((auditError) => console.error(auditError));
      // Filter out non-actionable errors
      if (error.message && (
        error.message.indexOf("Cannot read") >= 0 ||
        error.message.indexOf("quota") >= 0 ||
        error.message.indexOf("generation failed") >= 0 ||
        error.message.indexOf("does not support") >= 0
      )) {
        return sendJson(res, 200, { generations: [], credits: 0 });
      }
      throw error;
    }
  }

  if (req.method === "POST" && url.pathname === "/api/images/edit") {
    throw httpError("Image editor is not available with Gemini model. Use generate with references instead.", 400);
  }

  const fileMatch = url.pathname.match(/^\/api\/images\/([^/]+)\/file$/);
  if (fileMatch && req.method === "GET") {
    const current = await getCurrentUser(req);
    const generation = await store.getGenerationById(fileMatch[1]);
    if (!generation) {
      throw httpError("Image not found", 404);
    }
    if (!generation.isPublic) {
      ensureAuthenticated(current);
      if (!canTouchGeneration(current.user, generation)) {
        throw httpError("Image not found", 404);
      }
    }
    let absolutePath = path.join(GENERATED_DIR, generation.filename);
    if (!fsSync.existsSync(absolutePath)) {
      absolutePath = path.join(GENERATED_DIR, path.basename(generation.filename));
    }
    const extension = path.extname(absolutePath).toLowerCase();
    const bytes = await fs.readFile(absolutePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes.get(extension) || "application/octet-stream",
      "Cache-Control": "private, max-age=86400"
    });
    res.end(bytes);
    return;
  }

  sendError(res, 404, "API route not found");
}

async function serveStatic(req, res, url) {
  const pathname = decodeURIComponent(url.pathname);
  // Serve index.html for /admin if not authenticated (client-side shows login)
  if (pathname === "/admin" || pathname === "/admin.html") {
    const current = await getCurrentUser(req).catch(() => null);
    if (!current?.user) {
      // Redirect to main page — admin.js will handle auth check
      const mainHtml = await fs.readFile(path.join(PUBLIC_DIR, "index.html"), "utf8");
      const injectHtml = mainHtml.replace(/<script(?=[\s>])/g, '<script nonce="' + res._nonce + '"').replace('<meta charset="utf-8">', '<meta charset="utf-8"><meta name="csrf-token" content="' + (res._csrfToken || "") + '">');
      const hdrs = buildHeaders(res, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      res.writeHead(200, hdrs);
      res.end(Buffer.from(injectHtml, "utf8"));
      return;
    }
    if (current.user.role !== "admin") {
      return sendError(res, 404, "Not found");
    }
  }
  const requestedPath = pathname === "/" ? "/index.html" : pathname === "/admin" ? "/admin.html" : pathname;
  const absolutePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));
  if (absolutePath !== PUBLIC_DIR && !absolutePath.startsWith(PUBLIC_DIR + path.sep)) {
    return sendError(res, 403, "Forbidden");
  }

  try {
    const stat = await fs.stat(absolutePath);
    if (!stat.isFile()) throw new Error("not a file");
    const extension = path.extname(absolutePath).toLowerCase();
    let bytes = await fs.readFile(absolutePath);
    let contentType = mimeTypes.get(extension) || "application/octet-stream";
    // Inject nonce and CSRF token into HTML files
    if (extension === ".html" || extension === ".htm") {
      let html = bytes.toString("utf8");
      html = html.replace(/<script(?=[\s>])/g, '<script nonce="' + res._nonce + '"');
      html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8"><meta name="csrf-token" content="' + (res._csrfToken || "") + '">');
      bytes = Buffer.from(html, "utf8");
      contentType = "text/html; charset=utf-8";
    }
    const hdrs = buildHeaders(res, {
      "Content-Type": contentType,
      "Cache-Control": extension === ".html" ? "no-store" : "public, max-age=3600"
    });
    if (extension === ".json") hdrs["Content-Disposition"] = "attachment; filename=\"prompts.json\"";
    res.writeHead(200, hdrs);
    res.end(bytes);
  } catch {
    const html = (await fs.readFile(path.join(PUBLIC_DIR, "index.html"), "utf8"))
      .replace(/<script(?=[\s>])/g, '<script nonce="' + res._nonce + '"')
      .replace('<meta charset="utf-8">', '<meta charset="utf-8"><meta name="csrf-token" content="' + (res._csrfToken || "") + '">');
    const hdrs = buildHeaders(res, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    });
    res.writeHead(200, hdrs);
    res.end(Buffer.from(html, "utf8"));
  }
}

async function handleRequest(req, res) {
  res._req = req;
  res._nonce = generateToken();
  const cookies = parseCookies(req.headers.cookie);
  res._csrfToken = cookies.csrf || generateToken();
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const ip = getClientIp(req);

  // Block dotfiles
  const pathParts = url.pathname.split("/").filter(Boolean);
  if (pathParts.some(function(p) { return p.startsWith("."); })) {
    return sendError(res, 404, "Not found");
  }

  // CSRF check for state-changing requests
  if (["POST","PATCH","DELETE"].includes(req.method) && url.pathname.startsWith("/api/")) {
    const csrfCookie = cookies.csrf || "";
    const csrfHeader = req.headers["x-csrf-token"] || "";
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return sendError(res, 403, "Invalid CSRF token");
    }
  }

  try {
    // Rate limit state-changing API calls
    if (["POST","PATCH","DELETE"].includes(req.method) && url.pathname.startsWith("/api/")) {
      const maxReqs = url.pathname === "/api/images/generate" ? GENERATE_RATE_MAX : API_RATE_MAX;
      checkApiRate(ip, maxReqs, API_RATE_WINDOW_MS);
    }
    if (url.pathname.startsWith("/api/")) {
      await routeApi(req, res, url);
      return;
    }
    await serveStatic(req, res, url);
  } catch (error) {
    const status = error.status || 500;
    const message = status >= 500 ? "Internal server error" : error.message;
    if (status >= 500) console.error(error);
    sendError(res, status, message, error.details);
  }
}

async function bootstrapAdminAccount() {
  const rawEmail = String(process.env.ADMIN_EMAIL || "").trim();
  const rawPassword = String(process.env.ADMIN_PASSWORD || "");
  if (!rawEmail && !rawPassword) {
    if ((await store.countAdmins()) === 0) {
      console.warn("No admin account found. Set ADMIN_EMAIL and ADMIN_PASSWORD, then restart to create one.");
    }
    return;
  }
  if (!rawEmail || !rawPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set together.");
  }

  const email = normalizeEmail(rawEmail);
  requireEmail(email);
  requirePassword(rawPassword);

  const existing = await store.getUserByEmail(email);
  if (existing) {
    if (existing.role !== "admin" || existing.status !== "active") {
      await store.updateUser(existing.id, { role: "admin", status: "active" });
      console.log(`Admin account activated for ${email}`);
    }
    return;
  }

  const settings = await store.getSettings();
  await store.createUser({
    id: randomId("usr_"),
    name: String(process.env.ADMIN_NAME || "Admin").trim().slice(0, 60) || "Admin",
    email,
    passwordHash: hashPassword(rawPassword),
    role: "admin",
    status: "active",
    credits: Math.max(0, Number(settings.defaultCredits ?? 10) || 0)
  });
  console.log(`Admin account created for ${email}`);
}

async function start() {
  // Periodic cleanup of rate maps
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of apiRateMap) { if (now - entry.time > 60000) apiRateMap.delete(ip); }
    for (const [ip, entry] of loginAttempts) { if (now - entry.time > 900000) loginAttempts.delete(ip); }
  }, 300000);
  await fs.mkdir(GENERATED_DIR, { recursive: true });
  await store.initializeDatabase({ defaultModel: DEFAULT_MODEL });
  await bootstrapAdminAccount();
  const server = http.createServer((req, res) => {
    handleRequest(req, res);
  });
  server.listen(PORT, () => {
    console.log(`Imagens running at http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
