const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const state = {
  user: null,
  firstRun: false,
  view: "dashboard",
  settings: null,
  users: [],
  records: [],
  providers: [],
  logsTotal: 0
};

let csrfToken = (() => { let m = document.querySelector('meta[name="csrf-token"]'); return m ? m.getAttribute("content") : ""; })();

async function api(path, opts = {}) {
  let h = { "Content-Type": "application/json" };
  if (csrfToken) h["X-CSRF-Token"] = csrfToken;
  if (opts.headers) Object.assign(h, opts.headers);
  const r = await fetch(path, { credentials: "same-origin", headers: h, ...opts });
  let ct = r.headers.get("X-CSRF-Token");
  if (ct) csrfToken = ct;
  if (r.status === 204) return null;
  let d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Request failed");
  return d;
}

function esc(v = "") { return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }

function fmt(v) { if (!v) return ""; return new Intl.DateTimeFormat("en-US", { hour12: false, month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(v)); }

function fmtFull(v) { if (!v) return ""; return new Intl.DateTimeFormat("en-US", { hour12: false, month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(v)); }

function toast(m) { let n = document.createElement("div"); n.className = "toast"; n.textContent = m; $("#toastLayer").appendChild(n); setTimeout(() => n.remove(), 2600); }

function modal(html) { let l = $("#modalLayer"); l.classList.remove("hidden"); l.innerHTML = `<div class="modal">${html}</div>`; l.onclick = function(e) { if (e.target === l) closeModal(); }; }

function closeModal() { let l = $("#modalLayer"); l.classList.add("hidden"); l.innerHTML = ""; }

function renderLogin() {
  $("#logoutBtn").classList.add("hidden");
  $("#sidebarNav").innerHTML = "";
  $("#adminApp").innerHTML = `
    <div style="max-width:420px;margin:60px auto">
      <div style="text-align:center;margin-bottom:32px">
        <div style="width:56px;height:56px;border-radius:50%;background:var(--accent);display:grid;place-items:center;margin:0 auto 16px;color:#fff;font-size:28px"><i class="ri-sparkling-2-fill"></i></div>
        <h1 style="margin:0;font-size:22px">Admin Panel</h1>
        <p style="color:var(--ink-dim);margin:8px 0 0;font-size:14px">Log in with an administrator account</p>
      </div>
      <div class="card">
        <form id="loginForm" class="form">
          <label>Email<input id="emailInput" type="email" autocomplete="email" required></label>
          <label>Password<input id="passwordInput" type="password" autocomplete="current-password" required></label>
          <button class="btn btn-primary" type="submit">Login</button>
          <a href="/" class="btn" style="display:flex;text-align:center">Back to Home</a>
        </form>
      </div>
    </div>`;
  $("#loginForm").addEventListener("submit", login);
  $("#sidebar").classList.remove("open");
}

function renderDenied() {
  $("#logoutBtn").classList.remove("hidden");
  $("#adminApp").innerHTML = `
    <div class="hero">
      <h1>Access Denied</h1>
      <p>Account ${esc(state.user?.email || "")} is not an administrator.</p>
    </div>
    <div class="card" style="max-width:480px">
      <button class="btn" onclick="window.location.href='/'" type="button">Back to Home</button>
    </div>`;
}

function renderAdmin() {
  $("#logoutBtn").classList.remove("hidden");
  $$(".nav-item[data-view]").forEach(b => {
    b.classList.toggle("active", b.dataset.view === state.view);
  });
  $("#topbarTitle").textContent = state.view.charAt(0).toUpperCase() + state.view.slice(1);
  if (state.view === "dashboard") renderDashboard();
  else if (state.view === "logs") renderLogs();
  else if (state.view === "users") renderUsers();
  else if (state.view === "permissions") renderPermissions();
  else if (state.view === "providers") renderProviders();
}

async function loadPanel() {
  if (state.view === "dashboard") {
    let [settings, users, records] = await Promise.all([
      api("/api/admin/settings").catch(() => null),
      api("/api/admin/users").catch(() => ({ users: [] })),
      api("/api/admin/generations?limit=20").catch(() => ({ records: [] }))
    ]);
    state.settings = settings;
    state.users = users.users || [];
    state.records = records.records || [];
  } else if (state.view === "logs") {
    let params = new URLSearchParams({ limit: LOGS_PER_PAGE, offset: logsPage * LOGS_PER_PAGE });
    if (logsFilters.search) params.set("search", logsFilters.search);
    if (logsFilters.userId) params.set("userId", logsFilters.userId);
    if (logsFilters.ip) params.set("ip", logsFilters.ip);
    if (logsFilters.status) params.set("status", logsFilters.status);
    if (logsFilters.provider) params.set("provider", logsFilters.provider);
    if (logsFilters.isPublic === "1" || logsFilters.isPublic === "0") params.set("isPublic", logsFilters.isPublic === "1" ? "true" : "false");
    if (logsFilters.from) params.set("from", logsFilters.from);
    if (logsFilters.to) params.set("to", logsFilters.to);
    let data = await api("/api/admin/generations?" + params.toString()).catch(() => ({ records: [], total: 0 }));
    state.records = data.records || [];
    state.logsTotal = data.total || 0;
  } else if (state.view === "users") {
    let data = await api("/api/admin/users").catch(() => ({ users: [] }));
    state.users = data.users || [];
  } else if (state.view === "permissions") {
    state.settings = await api("/api/admin/settings").catch(() => null);
  } else if (state.view === "providers") {
    state.settings = await api("/api/admin/settings").catch(() => null);
    state.providers = (state.settings && state.settings.providers) || [];
  }
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function renderDashboard() {
  let s = state.settings || {};
  let records = Array.isArray(state.records) ? state.records : [];
  let totalGen = records.length;
  let totalUsers = (state.users || []).length;
  let failedGen = records.filter(r => r.status === "failed").length;
  let activeUsers = new Set(records.filter(r => r.userId).map(r => r.userId)).size;
  let recent = records.slice(0, 20);

  $("#adminApp").innerHTML = `
    <div class="hero">
      <h1>Dashboard</h1>
      <p>Overview of your Imagens instance.</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Users</div><div class="stat-value">${totalUsers}</div></div>
      <div class="stat-card"><div class="stat-label">Generations Today</div><div class="stat-value">${totalGen}</div></div>
      <div class="stat-card"><div class="stat-label">Active Users Today</div><div class="stat-value">${activeUsers}</div></div>
      <div class="stat-card"><div class="stat-label">Failed Today</div><div class="stat-value" style="color:var(--red)">${failedGen}</div></div>
      <div class="stat-card"><div class="stat-label">Providers</div><div class="stat-value">${(s.providers || []).length}</div></div>
    </div>
    <div class="card">
      <h2>Recent Activity</h2>
      ${recent.length ? `<div class="table-wrap"><table><thead><tr><th>Time</th><th>User</th><th>Prompt</th><th>Status</th></tr></thead><tbody>${
        recent.map(r => `<tr><td>${fmt(r.createdAt)}</td><td><strong>${esc(r.userName || r.userEmail || "?")}</strong></td><td class="prompt-cell">${esc(r.prompt).slice(0, 80)}</td><td><span class="badge ${r.status === "success" ? "badge-success" : r.status === "failed" ? "badge-failed" : "badge-pending"}">${esc(r.status)}</span></td></tr>`).join("")
      }</tbody></table></div>` : `<div class="empty">No generations today</div>`}
    </div>`;
}

// ─── Logs ────────────────────────────────────────────────────────────────────

let logsFilters = { search: "", userId: "", ip: "", status: "", provider: "", isPublic: "", from: "", to: "" };
let logsPage = 0;
const LOGS_PER_PAGE = 50;

function renderLogs() {
  let total = state.logsTotal || 0;
  let totalPages = Math.ceil(total / LOGS_PER_PAGE) || 1;
  let users = state.users || [];
  let page = state.records || [];
  // Collect unique providers from all records for the filter
  let providerSet = new Set();
  state.records.forEach(function(r) { if (r.provider) providerSet.add(r.provider); });
  let providerOpts = '<option value="">All Providers</option>' + (providerSet.size ? [...providerSet].sort().map(function(p) { return '<option value="' + esc(p) + '" ' + (logsFilters.provider === p ? "selected" : "") + '>' + esc(p) + '</option>'; }).join("") : "");
  let userOpts = '<option value="">All Users</option>' + users.map(u => '<option value="' + esc(u.id) + '" ' + (logsFilters.userId === u.id ? "selected" : "") + '>' + esc(u.name || u.email) + '</option>').join("");

  $("#adminApp").innerHTML = `
    <div class="hero">
      <h1>Generation Logs</h1>
      <p>Filter and browse all generation requests.</p>
    </div>
    <div class="card">
      <div class="filter-bar">
        <input type="text" id="logSearch" placeholder="Search prompt..." value="${esc(logsFilters.search)}" style="flex:1;min-width:130px;max-width:180px;padding:10px 12px">
        <select id="logUser" style="flex:1;min-width:130px;max-width:180px;padding:10px 12px">${userOpts}</select>
        <input type="text" id="logIp" placeholder="IP address..." value="${esc(logsFilters.ip)}" style="flex:1;min-width:130px;max-width:180px;padding:10px 12px">
        <select id="logStatus" style="flex:1;min-width:130px;max-width:180px;padding:10px 12px"><option value="">All Status</option><option value="success" ${logsFilters.status === "success" ? "selected" : ""}>Success</option><option value="failed" ${logsFilters.status === "failed" ? "selected" : ""}>Failed</option><option value="pending" ${logsFilters.status === "pending" ? "selected" : ""}>Pending</option></select>
        <select id="logProvider" style="flex:1;min-width:130px;max-width:180px;padding:10px 12px">${providerOpts}</select>
        <select id="logPublic" style="flex:1;min-width:130px;max-width:180px;padding:10px 12px"><option value="">All</option><option value="1" ${logsFilters.isPublic === "1" ? "selected" : ""}>Public</option><option value="0" ${logsFilters.isPublic === "0" ? "selected" : ""}>Private</option></select>
        <input type="date" id="logFrom" value="${logsFilters.from}" style="flex:1;min-width:130px;max-width:180px;padding:10px 12px">
        <input type="date" id="logTo" value="${logsFilters.to}" style="flex:1;min-width:130px;max-width:180px;padding:10px 12px">
        <button class="btn btn-primary btn-sm" id="logApplyBtn" style="min-height:38px"><i class="ri-filter-3-line"></i> Apply</button>
        <button class="btn btn-sm" id="logResetBtn" style="min-height:38px"><i class="ri-refresh-line"></i> Reset</button>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span class="muted">${total} results (page ${logsPage+1}/${totalPages})</span>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm" id="logPrevBtn" ${logsPage === 0 ? "disabled" : ""}><i class="ri-arrow-left-s-line"></i> Prev</button>
          <button class="btn btn-sm" id="logNextBtn" ${logsPage >= totalPages - 1 ? "disabled" : ""}>Next <i class="ri-arrow-right-s-line"></i></button>
        </div>
      </div>
      <div class="table-wrap">
        ${page.length ? `<table><thead><tr><th>Image</th><th>User</th><th>Prompt</th><th>IP</th><th>Provider</th><th>Public</th><th>Status</th><th>Time</th></tr></thead><tbody>${
          page.map(r => { let fullPrompt = esc(r.prompt); let shortPrompt = fullPrompt.length > 120 ? fullPrompt.slice(0, 120) + '...' : fullPrompt; let hasMore = fullPrompt.length > 120; let errorDetail = r.errorMessage ? esc(r.errorMessage) : ""; return `<tr><td>${r.firstGenerationId ? `<div class="thumb-row">${(r.generationIds && r.generationIds.length ? r.generationIds : [r.firstGenerationId]).map(id => `<img class="thumb adm-thumb" src="/api/images/${id}/file" data-id="${esc(id)}" loading="lazy">`).join("")}</div>` : '<div class="thumb" style="opacity:0.2"><i class="ri-image-line" style="display:grid;place-items:center;height:100%"></i></div>'}</td><td><strong>${esc(r.userName || r.userEmail || "?")}</strong><br><span class="muted">${esc(r.userEmail || "")}</span></td><td class="prompt-cell"><span class="prompt-wrap">${shortPrompt}${hasMore ? `<span class="prompt-toggle" data-full="${fullPrompt}" style="font-size:10px;color:var(--accent);cursor:pointer;margin-left:4px">\u25BC</span>` : ''}</span></td><td><span style="font-size:12px">${esc(r.ipAddress || "-")}</span></td><td><span style="font-size:12px">${esc(r.provider || "default")}</span></td><td>${r.isPublic ? '<span style="color:var(--green)">Yes</span>' : "No"}</td><td><span class="badge ${r.status === "success" ? "badge-success" : r.status === "failed" ? "badge-failed" : "badge-pending"} log-status-badge" data-fullerror="${errorDetail}" style="cursor:pointer">${esc(r.status)}</span></td><td style="white-space:nowrap;font-size:12px">${fmtFull(r.createdAt)}</td></tr>`; }).join("")
        }</tbody></table>` : `<div class="empty">No logs found</div>`}
      </div>
    </div>`;

  setTimeout(() => {
    $("#logApplyBtn").onclick = function() {
      logsFilters.search = $("#logSearch").value;
      logsFilters.userId = $("#logUser").value;
      logsFilters.ip = $("#logIp").value;
      logsFilters.status = $("#logStatus").value;
      logsFilters.provider = $("#logProvider").value;
      logsFilters.isPublic = $("#logPublic").value;
      logsFilters.from = $("#logFrom").value;
      logsFilters.to = $("#logTo").value;
      logsPage = 0;
      loadPanel().then(function() { renderLogs(); });
    };
    $("#logResetBtn").onclick = function() {
      logsFilters = { search: "", userId: "", ip: "", status: "", provider: "", isPublic: "", from: "", to: "" };
      logsPage = 0;
      loadPanel().then(function() { renderLogs(); });
    };
    $("#logPrevBtn").onclick = function() { if (logsPage > 0) { logsPage--; loadPanel().then(function() { renderLogs(); }); } };
    $("#logNextBtn").onclick = function() { if (logsPage < totalPages - 1) { logsPage++; loadPanel().then(function() { renderLogs(); }); } };
  }, 0);
}

function openViewer(id) {
  let existing = document.getElementById("admViewer");
  if (existing) { existing.remove(); return; }
  let v = document.createElement("div");
  v.id = "admViewer";
  v.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;padding:20px;cursor:zoom-out";
  let img = document.createElement("img");
  let maxW = Math.min(window.innerWidth * 0.92, 1920);
  let maxH = window.innerHeight * 0.9;
  img.style.cssText = "max-width:" + maxW + "px;max-height:" + maxH + "px;object-fit:contain;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,0.5)";
  img.src = "/api/images/" + id + "/file";
  v.appendChild(img);
  v.onclick = function() { v.remove(); };
  document.body.appendChild(v);
}

// Delegated click handler for admin thumbnails and prompt expand
document.addEventListener("click", function(e) {
  let thumb = e.target.closest(".adm-thumb");
  if (thumb && thumb.dataset.id) {
    openViewer(thumb.dataset.id);
  }
  let pt = e.target.closest(".prompt-toggle");
  if (pt) {
    let wrap = pt.closest(".prompt-wrap");
    if (!wrap) return;
    let full = pt.dataset.full;
    let isExpanded = pt.dataset.expanded === "1";
    if (isExpanded) {
      wrap.textContent = full.slice(0, 120) + "...";
      pt.textContent = "\u25BC";
      pt.dataset.expanded = "0";
      wrap.appendChild(pt);
    } else {
      wrap.textContent = full;
      pt.textContent = "\u25B2";
      pt.dataset.expanded = "1";
      wrap.appendChild(pt);
    }
  }
  let badge = e.target.closest(".log-status-badge");
  if (badge) {
    let err = badge.dataset.fullerror;
    let st = badge.textContent.trim();
    let row = badge.closest("tr");
    let prompt = row ? (row.querySelector(".prompt-cell")?.textContent?.trim()?.slice(0, 300) || "") : "";
    let provider = row ? (row.querySelector("td:nth-child(5)")?.textContent?.trim() || "") : "";
    let ip = row ? (row.querySelector("td:nth-child(4)")?.textContent?.trim() || "") : "";
    let time = row ? (row.querySelector("td:nth-child(8)")?.textContent?.trim() || "") : "";
    let detail = st === "failed"
      ? "Request failed with status 500\n\nError: " + (err || "No details available")
      : "Request completed successfully (200 OK)";
    let overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:20px";
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    let box = document.createElement("div");
    box.style.cssText = "background:var(--card);border:1px solid var(--line);border-radius:14px;padding:24px;max-width:620px;width:100%;max-height:85vh;overflow-y:auto";
    box.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><h2 style="margin:0;font-size:16px">' + (st === "failed" ? '<span style="color:var(--red)">\u2716 Generation Failed</span>' : '<span style="color:var(--green)">\u2714 Generation Success</span>') + '</h2><button class="btn btn-sm" id="statusModalClose" style="min-width:60px">\u2715</button></div>' +
      '<div style="background:var(--soft);border-radius:8px;padding:16px;margin-bottom:12px;max-height:50vh;overflow-y:auto"><pre style="margin:0;font-size:12px;color:var(--ink-dim);white-space:pre-wrap;word-break:break-word;line-height:1.6;font-family:monospace">' + esc(detail) + '</pre></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;color:var(--ink-dim);margin-bottom:12px">' +
        (prompt ? '<div><div style="font-weight:600;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.04em;font-size:11px">Prompt</div><div style="color:var(--ink)">' + esc(prompt) + '</div></div>' : '') +
        (provider ? '<div><div style="font-weight:600;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.04em;font-size:11px">Provider</div><div style="color:var(--ink)">' + esc(provider) + '</div></div>' : '') +
        (ip ? '<div><div style="font-weight:600;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.04em;font-size:11px">IP</div><div style="color:var(--ink)">' + esc(ip) + '</div></div>' : '') +
        (time ? '<div><div style="font-weight:600;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.04em;font-size:11px">Time</div><div style="color:var(--ink)">' + esc(time) + '</div></div>' : '') +
      '</div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    document.getElementById("statusModalClose").onclick = function() { overlay.remove(); };
  }
});

// ─── Users ───────────────────────────────────────────────────────────────────

function renderUsers() {
  let s = state.settings || {};
  $("#adminApp").innerHTML = `
    <div class="hero">
      <h1>User Management</h1>
      <p>Manage users, credits, and permissions.</p>
    </div>
    <div class="card">
      <form id="addUserForm" style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
        <input type="email" id="newEmail" placeholder="Email" required style="flex:1;min-width:160px">
        <input type="text" id="newPassword" placeholder="Password" required style="flex:1;min-width:120px">
        <input type="text" id="newName" placeholder="Name (optional)" style="flex:1;min-width:120px">
        <button class="btn btn-primary" type="submit">Create User</button>
      </form>
      <div class="table-wrap">
        <table>
          <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Credits</th><th>Unlimited</th><th>Joined</th><th></th></tr></thead>
          <tbody>${state.users.map(u => `
            <tr data-user-id="${esc(u.id)}">
              <td><strong>${esc(u.name || u.email)}</strong><br><span class="muted">${esc(u.email)}</span></td>
              <td><select class="role-input" ${u.id === state.user.id ? "disabled" : ""}><option value="user" ${u.role === "user" ? "selected" : ""}>User</option><option value="admin" ${u.role === "admin" ? "selected" : ""}>Admin</option></select></td>
              <td><select class="status-input" ${u.id === state.user.id ? "disabled" : ""}><option value="active" ${u.status === "active" ? "selected" : ""}>Enabled</option><option value="disabled" ${u.status === "disabled" ? "selected" : ""}>Disabled</option></select></td>
              <td style="font-size:20px;text-align:center;width:60px">${u.unlimited ? '♾' : `<input class="credits-input" type="number" min="0" value="${Number(u.credits || 0)}" style="width:70px">`}</td>
              <td><input class="unlimited-input" type="checkbox" ${u.unlimited ? "checked" : ""}></td>
              <td style="white-space:nowrap;font-size:12px">${fmt(u.createdAt)}</td>
              <td>
                <button class="btn btn-sm cfg-user" type="button"><i class="ri-settings-3-line"></i></button>
                <button class="btn btn-sm btn-primary save-user" type="button">Save</button>
              </td>
            </tr>
            <tr class="user-panel-row hidden" data-panel-for="${esc(u.id)}"><td colspan="7"><div class="user-panel-content" style="padding:12px"></div></td></tr>
          `).join("")}</tbody>
        </table>
      </div>
    </div>`;
  $$(".cfg-user").forEach(b => b.addEventListener("click", function() {
    let uid = this.closest("tr").dataset.userId;
    let row = document.querySelector('[data-panel-for="' + uid + '"]');
    let wasHidden = row.classList.contains("hidden");
    $$(".user-panel-row").forEach(r => r.classList.add("hidden"));
    if (wasHidden) { row.classList.remove("hidden"); renderCfgPanel(uid, row.querySelector(".user-panel-content")); }
  }));
  $("#addUserForm").addEventListener("submit", addUser);
  $$(".save-user").forEach(b => b.addEventListener("click", function() { saveUser(b.closest("tr")); }));
}

function renderCfgPanel(uid, panel) {
  let u = state.users.find(x => x.id === uid);
  if (!u) return;
  let isSelf = u.id === state.user.id;
  let global = parseUiConfig(state.settings ? state.settings.uiConfig : "");
  let baseSizes = (global.sizes && global.sizes.length) ? global.sizes : ["1024x1024","1024x1536","1536x1024","768x1024","1024x768","2048x2048","2048x3072","3072x2048","2880x3840","3840x2880","512x512"];
  let allSizes = baseSizes.includes("custom") ? baseSizes : [...baseSizes, "custom"];
  let uic = parseUiConfig(u.uiConfig || "");
  panel.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:12px">
      <label style="flex:1;min-width:140px;font-size:12px;color:var(--ink-dim)">Name <input type="text" class="cfg-name" value="${esc(u.name || "")}" style="margin-top:4px"></label>
      <label style="flex:1;min-width:140px;font-size:12px;color:var(--ink-dim)">Email <input type="email" class="cfg-email" value="${esc(u.email || "")}" style="margin-top:4px"></label>
      <label style="flex:1;min-width:140px;font-size:12px;color:var(--ink-dim)">New Password <input type="password" class="cfg-password" placeholder="Leave empty" style="margin-top:4px"></label>
    </div>
    <div class="cfg-permissions" style="border-top:1px solid var(--line);padding-top:12px">
      <div style="font-weight:600;font-size:13px;margin-bottom:8px">Per-User UI Config</div>
      <div id="permDrops" style="display:flex;flex-wrap:wrap;gap:12px">
        <div style="flex:1;min-width:130px">${makeDrop("permSizes", "Sizes", allSizes, uic.sizes || [])}</div>
        <div style="flex:1;min-width:130px">${makeDrop("permQuality", "Quality", ["auto","low","medium","high"], uic.qualityOptions || [])}</div>
        <div style="flex:1;min-width:130px">${makeDrop("permBg", "Background", ["auto","opaque","transparent"], uic.backgroundOptions || [])}</div>
        <div style="flex:1;min-width:130px">${makeDrop("permFmt", "Format", ["png","webp","jpeg"], uic.formatOptions || [])}</div>
      </div>
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;margin-top:8px;color:var(--ink);cursor:pointer"><input type="checkbox" class="perm-publish" ${uic.allowPublish?"checked":""} style="width:auto"> Allow Publish</label>
    </div>
    <div style="margin-top:12px;display:flex;gap:8px">
      <button class="btn btn-primary btn-sm cfg-save-config">Save Config</button>
      ${isSelf ? "" : '<button class="btn btn-danger btn-sm cfg-delete">Delete User</button>'}
    </div>`;
  setTimeout(function() { initDrops(panel); }, 0);
  panel.querySelector(".cfg-save-config").onclick = function() {
    let patch = {};
    let nm = panel.querySelector(".cfg-name").value.trim();
    if (nm) patch.name = nm;
    let em = panel.querySelector(".cfg-email").value.trim();
    if (em) patch.email = em;
    let pw = panel.querySelector(".cfg-password").value;
    if (pw && pw.length >= 8) patch.password = pw;
    // Collect per-user UI config
    let permCfg = JSON.stringify({
      sizes: getDropSelected("permSizes"),
      qualityOptions: getDropSelected("permQuality"),
      backgroundOptions: getDropSelected("permBg"),
      formatOptions: getDropSelected("permFmt"),
      allowPublish: panel.querySelector(".perm-publish").checked
    });
    patch.uiConfig = permCfg;
    api("/api/admin/users/" + uid, { method: "PATCH", body: JSON.stringify(patch) }).then(function(d) {
      if (d && d.user) { let i = state.users.findIndex(x => x.id === uid); if (i >= 0) state.users[i] = d.user; }
      toast("User updated");
    }).catch(e => toast(e.message));
  };
  let del = panel.querySelector(".cfg-delete");
  if (del) del.onclick = function() {
    if (!confirm("Delete user " + u.email + "?")) return;
    api("/api/admin/users/" + uid, { method: "DELETE" }).then(function() {
      state.users = state.users.filter(x => x.id !== uid);
      renderUsers();
      toast("User deleted");
    }).catch(e => toast(e.message));
  };
}

async function addUser(e) {
  e.preventDefault();
  try {
    await api("/api/admin/users/create", { method: "POST", body: JSON.stringify({ email: $("#newEmail").value, password: $("#newPassword").value, name: $("#newName").value || "" }) });
    toast("User created");
    $("#addUserForm").reset();
    let data = await api("/api/admin/users");
    state.users = data.users || [];
    renderUsers();
  } catch (err) { toast(err.message); }
}

async function saveUser(row) {
  try {
    let creditsInput = $(".credits-input", row);
    let body = {
      role: $(".role-input", row).value,
      status: $(".status-input", row).value,
      credits: creditsInput ? Number(creditsInput.value || 0) : 0,
      creditDelta: 0,
      unlimited: $(".unlimited-input", row) ? $(".unlimited-input", row).checked : undefined
    };
    if (body.unlimited === undefined) delete body.unlimited;
    await api(`/api/admin/users/${row.dataset.userId}`, { method: "PATCH", body: JSON.stringify(body) });
    toast("User saved");
    let data = await api("/api/admin/users");
    state.users = data.users || [];
    renderUsers();
  } catch (err) { toast(err.message); }
}

// ─── Permissions ─────────────────────────────────────────────────────────────

function renderPermissions() {
  let s = state.settings || {};
  let uic = parseUiConfig(s.uiConfig || "");
  $("#adminApp").innerHTML = `
    <div class="hero">
      <h1>Permissions</h1>
      <p>Global application settings. API keys are configured in the Providers tab.</p>
    </div>
    <div class="grid" style="grid-template-columns:1fr 1fr">
      <div class="card" style="padding:20px 20px 20px 16px">
        <h2>General Settings</h2>
        <form id="settingsForm" class="form">
          <label>Sign-up Credits<input id="defaultCreditsInput" type="number" min="0" value="${Number(s.defaultCredits ?? 10)}"></label>
          <label>Credit Cost per Image<input id="generationCreditCostInput" type="number" min="0" value="${Number(s.generationCreditCost ?? 1)}"></label>
          <label>Max Images per Request<input id="maxImagesInput" type="number" min="1" max="4" value="${Number(s.maxImagesPerRequest ?? 1)}"></label>
          <label class="checkbox-label"><input id="allowRegistrationInput" type="checkbox" ${s.allowRegistration ? "checked" : ""}> Allow Registration</label>
          <label class="checkbox-label"><input id="requireApprovalInput" type="checkbox" ${s.requireApproval ? "checked" : ""}> New users require manual approval</label>
          <label class="checkbox-label"><input id="unlimitedGlobalInput" type="checkbox" ${s.unlimitedGlobal ? "checked" : ""}> Allow unlimited credits (global)</label>
          <div style="display:flex;justify-content:flex-end;margin-top:4px"><button class="btn btn-primary" type="submit">Save Settings</button></div>
        </form>
      </div>
    </div>`;

  setTimeout(() => {
    renderUiConfig(uic);
    $("#settingsForm").addEventListener("submit", savePermissions);
  }, 0);
}

function renderUiConfig(uic) {
  let allSizes = ["1024x1024","1024x1536","1536x1024","768x1024","1024x768","2048x2048","2048x3072","3072x2048","2880x3840","3840x2880","512x512","custom"];
  let card = document.createElement("div");
  card.className = "card";
  card.style.cssText = "display:flex;flex-direction:column;padding:20px";
  card.innerHTML = `<h2>Global UI Config</h2><div id="uiCfgWrap" style="display:flex;flex-direction:column;flex:1"></div>`;
  document.querySelector(".grid").appendChild(card);
  let wrap = $("#uiCfgWrap");
  // Dropdowns row
  let dropsRow = document.createElement("div");
  dropsRow.style.cssText = "display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px";
  dropsRow.innerHTML =
    '<div>' + makeDrop("gSizes", "Sizes", allSizes, uic.sizes || allSizes) + '</div>' +
    '<div>' + makeDrop("gQuality", "Quality", ["auto","low","medium","high"], uic.qualityOptions || []) + '</div>' +
    '<div>' + makeDrop("gBg", "Background", ["auto","opaque","transparent"], uic.backgroundOptions || []) + '</div>' +
    '<div>' + makeDrop("gFmt", "Format", ["png","webp","jpeg"], uic.formatOptions || []) + '</div>' +
    '<div>' + makeDrop("gBatch", "Max Batch", ["1","2","3","4","5","6","7","8"], [String(uic.batchMax || 4)]) + '</div>' +
    '';
  wrap.appendChild(dropsRow);
  // Row 3: Allow Publish (full width)
  let pubRow = document.createElement("div");
  pubRow.style.cssText = "padding-top:16px";
  pubRow.innerHTML = '<label style="display:flex;align-items:center;gap:6px;font-size:13px;color:var(--ink);cursor:pointer"><input type="checkbox" id="gPublish" ' + (uic.allowPublish ? "checked" : "") + ' style="width:auto"> Allow Publish</label>';
  wrap.appendChild(pubRow);
  // Row 4: Save button (right, at bottom)
  let bottomRow = document.createElement("div");
  bottomRow.style.cssText = "display:flex;align-items:center;justify-content:flex-end;gap:16px;margin-top:auto;padding-top:16px";
  bottomRow.innerHTML = '<button class="btn btn-primary" id="gSaveBtn">Save Global Config</button>';
  wrap.appendChild(bottomRow);
  setTimeout(function() {
    initDrops(wrap);
    wrap.querySelector("#gSaveBtn").onclick = function() {
      let cfg = JSON.stringify({
        sizes: getDropSelected("gSizes"),
        batchMax: parseInt(getDropSelected("gBatch")[0]) || 4,
        qualityOptions: getDropSelected("gQuality"),
        backgroundOptions: getDropSelected("gBg"),
        formatOptions: getDropSelected("gFmt"),
        allowPublish: document.getElementById("gPublish").checked
      });
      api("/api/admin/settings", { method: "PATCH", body: JSON.stringify({ uiConfig: cfg }) }).then(function() { toast("Global config saved"); }).catch(function(e) { toast(e.message); });
    };
  }, 0);
}

function parseUiConfig(s) { try { return JSON.parse(s); } catch(e) { return {}; } }

function makeDrop(id, label, allOptions, selected) {
  let cnt = selected.length;
  return '<div style="margin-bottom:8px"><label style="font-weight:600;font-size:12px;color:var(--ink-dim);display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.04em">' + label + '</label><div class="drop-wrap" style="position:relative"><div class="drop-header" data-drop="' + id + '" style="padding:7px 10px;border:1px solid var(--line);border-radius:6px;background:var(--soft);cursor:pointer;font-size:13px;color:var(--ink);display:flex;justify-content:space-between;align-items:center">' + cnt + ' selected <span style="font-size:10px;color:var(--ink-dim)">&#9660;</span></div><div class="drop-body" id="' + id + '" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:100;background:var(--card);border:1px solid var(--line);border-radius:6px;max-height:200px;overflow-y:auto;box-shadow:0 8px 24px rgba(0,0,0,0.3)">' + allOptions.map(function(v) {
    let sel = selected.includes(v);
    return '<div class="drop-opt' + (sel ? ' selected' : '') + '" data-val="' + v + '" style="padding:7px 10px;cursor:pointer;font-size:13px;color:var(--ink);display:flex;align-items:center;gap:6px;transition:background 0.1s" onmouseenter="this.style.background=\'var(--soft)\'" onmouseleave="this.style.background=\'\'"><span class="drop-cm" style="display:inline-block;width:16px;text-align:center;color:var(--accent);font-weight:700">' + (sel ? "\u2713" : "") + '</span> ' + v + '</div>';
  }).join("") + '</div></div></div>';
}

function initDrops(container) {
  // no-op: using global delegation instead
}

// Global delegation for all dropdown interactions
document.addEventListener("click", function(e) {
  let wrap = e.target.closest(".drop-wrap");
  let body = e.target.closest(".drop-body");
  let opt = e.target.closest(".drop-opt");
  let hdr = e.target.closest(".drop-header");
  
  // Click on header: toggle dropdown
  if (hdr) {
    let targetBody = document.getElementById(hdr.dataset.drop);
    if (!targetBody) return;
    let isOpen = targetBody.style.display !== "none";
    document.querySelectorAll(".drop-body").forEach(function(b) { b.style.display = "none"; });
    targetBody.style.display = isOpen ? "none" : "block";
    return;
  }
  
  // Click on option: toggle selection
  if (opt) {
    e.stopPropagation();
    let b = opt.closest(".drop-body");
    if (!b) return;
    opt.classList.toggle("selected");
    let cm = opt.querySelector(".drop-cm");
    if (cm) cm.textContent = opt.classList.contains("selected") ? "\u2713" : "";
    let checked = [...b.querySelectorAll(".drop-opt.selected")];
    if (b.parentElement) {
      let h = b.parentElement.querySelector(".drop-header");
      if (h) {
        let txt = h.childNodes[0];
        if (txt) txt.textContent = checked.length + " selected";
      }
    }
    return;
  }
  
  // Click outside any dropdown: close all
  if (!wrap) {
    document.querySelectorAll(".drop-body").forEach(function(b) { b.style.display = "none"; });
  }
});

function getDropSelected(id) {
  let body = document.getElementById(id);
  if (!body) return [];
  return [...body.querySelectorAll(".drop-opt")].filter(function(d) { return d.classList.contains("selected"); }).map(function(d) { return d.dataset.val; });
}

async function savePermissions(e) {
  e.preventDefault();
  try {
    state.settings = await api("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({
        defaultCredits: Number($("#defaultCreditsInput").value || 0),
        generationCreditCost: Number($("#generationCreditCostInput").value || 0),
        maxImagesPerRequest: Number($("#maxImagesInput").value || 1),
        allowRegistration: $("#allowRegistrationInput").checked,
        requireApproval: $("#requireApprovalInput").checked,
        unlimitedGlobal: $("#unlimitedGlobalInput").checked
      })
    });
    toast("Settings saved");
  } catch (err) { toast(err.message); }
}

// ─── Providers ───────────────────────────────────────────────────────────────

function renderProviders() {
  let provs = state.providers || [];
  let s = state.settings || {};
  let hasLegacy = s.hasApiKey && s.apiKeyMask && !provs.length;
  $("#adminApp").innerHTML = `
    <div class="hero">
      <h1>Providers</h1>
      <p>Configure AI providers. Drag to reorder priority. First enabled provider is primary, failover to next on error.</p>
    </div>
    ${hasLegacy ? `<div class="card" style="background:rgba(245,158,11,0.08);border-color:var(--amber);margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <i class="ri-information-line" style="color:var(--amber);font-size:20px"></i>
        <span style="flex:1;font-size:13px">Existing API config (${esc(s.apiKeyMask)}) is not yet in the providers list.</span>
        <button class="btn btn-sm btn-primary" id="importLegacyBtn"><i class="ri-download-line"></i> Import as Provider</button>
      </div>
    </div>` : ""}
    <div style="display:flex;gap:8px;margin-bottom:16px">
      <button class="btn btn-primary" id="addProviderBtn"><i class="ri-add-line"></i> Add Provider</button>
      <button class="btn btn-primary" id="saveProvidersBtn"><i class="ri-save-line"></i> Save Order</button>
    </div>
    <div class="card">
      ${provs.length ? `<div class="provider-list" id="providerList">${
        provs.map((p, i) => `<div class="provider-card" data-index="${i}" draggable="true">
          <span class="provider-handle"><i class="ri-draggable"></i></span>
          <div class="provider-info">
            <div class="provider-name">${esc(p.name || "Unnamed")} <span style="font-size:11px;color:var(--ink-dim);font-weight:400">${esc(p.preset || "openai")}</span></div>
            <div class="provider-detail">${esc(p.baseUrl || "-")} · ${esc(p.model || "default")} ${p.enabled === false ? '· <span style="color:var(--red)">disabled</span>' : ""}</div>
          </div>
          <button class="provider-toggle ${p.enabled !== false ? "enabled" : ""}" data-index="${i}" data-action="toggle" title="Toggle"><i class="ri-power-line"></i></button>
          <button class="btn btn-sm" data-index="${i}" data-action="edit" title="Edit"><i class="ri-pencil-line"></i></button>
          <button class="btn btn-sm btn-danger" data-index="${i}" data-action="delete" title="Delete"><i class="ri-delete-bin-line"></i></button>
        </div>`).join("")
      }</div>` : `<div class="empty">No providers configured. Click "Add Provider" to get started.</div>`}
    </div>`;

  setTimeout(() => {
    initProviderDrag();
    $("#addProviderBtn").onclick = function() { editProvider(); };
    $("#saveProvidersBtn").onclick = saveProviders;
    // Event delegation for provider action buttons
    document.querySelector("#providerList")?.addEventListener("click", function(e) {
      let btn = e.target.closest("[data-action]");
      if (!btn) return;
      let idx = parseInt(btn.dataset.index);
      let action = btn.dataset.action;
      if (action === "edit") editProvider(idx);
      else if (action === "delete") deleteProvider(idx);
      else if (action === "toggle") {
        if (state.providers[idx]) {
          state.providers[idx].enabled = state.providers[idx].enabled === false;
          saveProviders(true);
        }
      }
    });
    if (hasLegacy) {
      $("#importLegacyBtn").onclick = function() {
        let idx = state.providers.length;
        state.providers.push({
          id: "default",
          name: "Default (from API config)",
          apiKey: "",
          baseUrl: s.apiBaseUrl || "",
          model: s.model || "",
          preset: "chat",
          enabled: true
        });
        saveProviders(true);
        toast("Legacy config imported — enter API key to activate");
        setTimeout(() => editProvider(idx), 200);
      };
    }
  }, 0);
}

function initProviderDrag() {
  let items = $$(".provider-card");
  items.forEach(item => {
    item.addEventListener("dragstart", function(e) {
      this.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", this.dataset.index);
    });
    item.addEventListener("dragend", function() { this.classList.remove("dragging"); });
    item.addEventListener("dragover", function(e) { e.preventDefault(); this.classList.add("drag-over"); });
    item.addEventListener("dragleave", function() { this.classList.remove("drag-over"); });
    item.addEventListener("drop", function(e) {
      e.preventDefault();
      this.classList.remove("drag-over");
      let fromIdx = parseInt(e.dataTransfer.getData("text/plain"));
      let toIdx = parseInt(this.dataset.index);
      if (fromIdx === toIdx) return;
      let provs = state.providers;
      let [moved] = provs.splice(fromIdx, 1);
      provs.splice(toIdx, 0, moved);
      state.providers = provs;
      renderProviders();
    });
  });
}

function editProvider(idx) {
  let p = (idx !== undefined && idx >= 0) ? state.providers[idx] : { name: "", apiKey: "", baseUrl: "", model: "", preset: "openai", enabled: true };
  let isNew = idx === undefined || idx < 0;
  let apiKeyMask = p.apiKey ? p.apiKey.slice(0, 7) + "****" + p.apiKey.slice(-4) : "";
  modal(`
    <h2 style="margin-bottom:20px">${isNew ? "Add" : "Edit"} Provider</h2>
    <form id="providerForm" class="form">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <label>Name <input id="pName" value="${esc(p.name)}" placeholder="e.g. OpenAI" required></label>
        <label>Preset
          <select id="pPreset">
            <option value="openai" ${p.preset === "openai" ? "selected" : ""}>OpenAI Standard</option>
            <option value="chat" ${p.preset === "chat" ? "selected" : ""}>Chat Completion</option>
            <option value="google" ${p.preset === "google" ? "selected" : ""}>Google AI Studio</option>
            <option value="evolink" ${p.preset === "evolink" ? "selected" : ""}>Evolink Async</option>
            <option value="custom" ${p.preset === "custom" ? "selected" : ""}>Custom Settings...</option>
          </select>
        </label>
      </div>
      <label>API Key <input id="pKey" type="text" value="${esc(apiKeyMask || "")}" placeholder="API key"></label>
      <label>Base URL <input id="pBaseUrl" value="${esc(p.baseUrl || "")}" placeholder="https://api.openai.com/v1"></label>
      <label>Model <input id="pModel" value="${esc(p.model || "")}" placeholder="e.g. gpt-4o"></label>
      
      <div id="customFields" style="display:${p.preset === "custom" ? "block" : "none"};border:1px dashed var(--line);padding:12px;border-radius:8px;margin-top:12px">
        <div style="font-weight:600;font-size:12px;margin-bottom:8px;color:var(--accent)">Custom Configuration</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <label>API Format <select id="pCustomFormat"><option value="images" ${p.customApiFormat === "images" ? "selected" : ""}>Images API</option><option value="chat" ${p.customApiFormat === "chat" ? "selected" : ""}>Chat API</option></select></label>
          <label>Size Format <select id="pCustomSize"><option value="pixel" ${p.customSizeFormat === "pixel" ? "selected" : ""}>Pixels (1024x1024)</option><option value="ratio" ${p.customSizeFormat === "ratio" ? "selected" : ""}>Ratio (1:1)</option></select></label>
        </div>
        <label style="margin-top:8px">Reference Field Name <input id="pCustomRef" value="${esc(p.customRefField || "image_prompts")}" placeholder="e.g. image_urls, none"></label>
        <label style="margin-top:8px;display:flex;align-items:center;gap:8px;cursor:pointer"><input id="pCustomAsync" type="checkbox" ${p.customAsync ? "checked" : ""} style="width:auto"> Enable Async Polling</label>
        <label style="margin-top:8px">Poll URL (use {{task_id}}) <input id="pCustomPoll" value="${esc(p.customPollUrl || "")}" placeholder="/v1/tasks/{{task_id}}"></label>
      </div>

      <label class="checkbox-label" style="margin-top:12px"><input id="pEnabled" type="checkbox" ${p.enabled !== false ? "checked" : ""}> Enabled</label>
      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn btn-primary" type="submit"><i class="ri-save-line"></i> ${isNew ? "Add" : "Save"}</button>
        <button class="btn" type="button" id="testProviderBtn"><i class="ri-test-tube-line"></i> Test</button>
        <button class="btn" type="button" id="cancelModalBtn">Cancel</button>
      </div>
      <div id="testResult" style="font-size:13px;margin-top:8px"></div>
    </form>`);
  setTimeout(() => {
    $("#pPreset").onchange = function() {
      $("#customFields").style.display = this.value === "custom" ? "block" : "none";
    };
    $("#providerForm").onsubmit = function(e) {
      e.preventDefault();
      let prov = {
        name: $("#pName").value.trim(),
        apiKey: ($("#pKey").value.trim().includes("****") ? p.apiKey : $("#pKey").value.trim()) || "",
        baseUrl: $("#pBaseUrl").value.trim(),
        model: $("#pModel").value.trim(),
        preset: $("#pPreset").value,
        enabled: $("#pEnabled").checked,
        customApiFormat: $("#pCustomFormat").value,
        customSizeFormat: $("#pCustomSize").value,
        customRefField: $("#pCustomRef").value.trim(),
        customAsync: $("#pCustomAsync").checked,
        customPollUrl: $("#pCustomPoll").value.trim()
      };
      if (isNew) state.providers.push(prov);
      else state.providers[idx] = prov;
      closeModal();
      saveProviders(true);
    };
    $("#testProviderBtn").onclick = async function() {
      let tr = $("#testResult");
      tr.innerHTML = '<span style="color:var(--amber)">Testing...</span>';
      let apiKey = $("#pKey").value.trim().includes("****") ? p.apiKey : $("#pKey").value.trim();
      let baseUrl = $("#pBaseUrl").value.trim();
      let model = $("#pModel").value.trim() || "gpt-4o";
      let preset = $("#pPreset").value;
      if (!baseUrl || !apiKey) { tr.innerHTML = '<span style="color:var(--red)">Key and URL required</span>'; return; }
      try {
        let d = await api("/api/admin/providers/test", { method: "POST", body: JSON.stringify({ apiKey, baseUrl, model, preset, name: p.name }) });
        if (d.success) tr.innerHTML = '<span style="color:var(--green)">Success ✓</span>';
        else tr.innerHTML = '<span style="color:var(--red)">' + esc(d.error || "Fail") + '</span>';
      } catch (err) { tr.innerHTML = '<span style="color:var(--red)">' + esc(err.message) + '</span>'; }
    };
    $("#cancelModalBtn").onclick = closeModal;
  }, 0);
}

function deleteProvider(idx) {
  if (!confirm("Delete this provider?")) return;
  state.providers.splice(idx, 1);
  saveProviders(true);
}

async function saveProviders(silent) {
  try {
    let provs = state.providers.map(p => ({
      name: p.name,
      apiKey: p.apiKey || "",
      baseUrl: p.baseUrl || "",
      model: p.model || "",
      preset: p.preset || "openai",
      enabled: p.enabled !== false,
      customApiFormat: p.customApiFormat || "images",
      customSizeFormat: p.customSizeFormat || "pixel",
      customRefField: p.customRefField || "image_prompts",
      customAsync: Boolean(p.customAsync),
      customPollUrl: p.customPollUrl || ""
    }));
    state.settings = await api("/api/admin/settings", { method: "PATCH", body: JSON.stringify({ providers: provs }) });
    state.providers = (state.settings && state.settings.providers) || [];
    if (!silent) toast("Providers saved");
    renderProviders();
  } catch (err) { if (!silent) toast(err.message); }
}

// ─── Auth ────────────────────────────────────────────────────────────────────

async function login(e) {
  e.preventDefault();
  try {
    await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email: $("#emailInput").value, password: $("#passwordInput").value }) });
    await bootstrap();
  } catch (err) { toast(err.message); }
}

async function logout() {
  await api("/api/auth/logout", { method: "POST" }).catch(() => null);
  state.user = null;
  renderLogin();
}

async function bootstrap() {
  try {
    let data = await api("/api/auth/me");
    state.user = data.user;
    state.firstRun = data.firstRun;
    if (!state.user) return renderLogin();
    if (state.user.role !== "admin") return renderDenied();
    await loadPanel();
    renderAdmin();
  } catch (err) {
    toast(err.message);
    renderLogin();
  }
}

// ─── Init ────────────────────────────────────────────────────────────────────

$("#logoutBtn").addEventListener("click", logout);

// Nav click handlers
$$(".nav-item[data-view]").forEach(b => b.addEventListener("click", async function() {
  state.view = this.dataset.view;
  await loadPanel();
  renderAdmin();
}));

// Sidebar toggle
$("#sidebarToggle").addEventListener("click", function() {
  $("#sidebar").classList.toggle("open");
});

bootstrap();
