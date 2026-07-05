const state = {
  lang: localStorage.getItem("lang") || "en",
  user: null,
  settings: null,
  firstRun: false,
  view: "home",
  forceHero: false,
  history: [],
  generating: false,
  funIndex: 0,
  funTimer: null,
  draftPrompt: "",
  generationOptions: {
    size: "768x1024",
    quality: "medium",
    background: "auto",
    outputFormat: "png"
  },
  references: [],
  refStore: {},
  checkin: {
    checkedInToday: false,
    credit: 1
  },
  authMode: "login",
  libraryTag: "all",
  librarySearch: "",
  promptItems: [],
  promptVisible: 20,
  promptLoading: true,
  editor: {
    imageUrl: "",
    imageData: "",
    prompt: "",
    tool: "brush",
    color: "#7c3aed",
    zoom: 1,
    history: [],
    pointerDown: false,
    startPoint: null,
    snapshot: null
  },
  stats: {
    todayGenerated: 4200
  },
  adminFilterUserId: "",
  adminUsers: null,
  publicGallery: []
};

const i18n = {
  zh: {
    brand: "Imagens",
    promptLibrary: "Библиотека промптов",
    imageEditor: "Редактор изображений",
    contact: "Связаться с админом",
    admin: "Админ",
    myWorks: "Мои работы",
    login: "Войти",
    logout: "Выйти",
    headPre: "Творите с",
    headItalic: "воображением",
    headPost: "",
    desc: "Превратите свои идеи в потрясающие изображения с помощью GPT Image. Просто опишите то, что вы видите в своем воображении.",
    reviews: "Созданные изображения сохраняются в вашу галерею",
    todayGeneratedPrefix: "Сегодня создано",
    todayGeneratedSuffix: "изображений",
    recentTitle: "Последние работы",
    recentSubtitle: "Ваша история творчества",
    examplesLabel: "Вдохновение",
    viewMore: "Показать еще",
    placeholder: "Опишите изображение, которое хотите создать...",
    create: "Создать",
    generating: "Создание...",
    reference: "Референс",
    options: "Настройки",
    size: "Размер",
    quality: "Качество",
    background: "Фон",
    format: "Формат",
    retry: "Повторить",
    download: "Сохранить",
    edit: "Редактировать промпт",
    editImage: "Редактировать",
    openEditor: "Редактор изображений",
    emptyWorks: "У вас пока нет созданных изображений",
    uploadEditImage: "Загрузите или выберите изображение для редактирования",
    uploadEditHint: "Поддержка кисти, выделения области и описания изменений",
    copy: "Копировать промпт",
    use: "Использовать",
    libraryBadge: "Библиотека промптов",
    libraryTitle: "Откройте для себя бесконечное творчество",
    librarySubtitle: "Ищите стили, сцены или темы и используйте их одним кликом.",
    librarySearchLabel: "Поиск",
    search: "Искать",
    all: "Все",
    noResults: "Промпты не найдены",
    preview: "Превью",
    totalPrompts: "Промптов",
    totalSources: "Источников",
    loadMore: "Загрузить еще",
    endOfHistory: "Это вся история",
    loadingPrompts: "Загрузка промптов...",
    loginTitle: "Войдите, чтобы продолжить творчество",
    registerTitle: "Регистрация аккаунта",
    authGift: "Зарегистрируйтесь, чтобы продолжить",
    authContinue: "Войдите, чтобы продолжить",
    authBonus: "При регистрации +10 кредитов, ежедневный вход +1 кредит",
    email: "Email",
    password: "Пароль",
    name: "Имя",
    submitLogin: "Войти",
    submitRegister: "Зарегистрироваться",
    switchToRegister: "Нет аккаунта? Регистрация",
    switchToLogin: "Есть аккаунт? Войти",
    skip: "Пропустить",
    creditsTitle: "Ежедневная награда",
    creditsBalance: "Ваш баланс",
    oneCredit: "Стоимость одной генерации",
    contactTitle: "Связаться с администратором",
    contactDesc: "Отсканируйте код для связи",
    contactInput: "WeChat / QQ / Email / Телефон",
    messageInput: "Сообщение (необязательно)",
    submit: "Отправить",
    received: "Получено",
    receivedDesc: "Администратор свяжется с вами в ближайшее время",
    close: "Закрыть",
    adminTitle: "Панель управления",
    settings: "Настройки API",
    users: "Пользователи",
    apiKey: "OpenAI API Key",
    apiBaseUrl: "API URL",
    model: "Модель",
    defaultCredits: "Кредиты по умолчанию",
    generationCost: "Стоимость генерации",
    maxImages: "Макс. изображений за раз",
    allowRegistration: "Разрешить регистрацию",
    requireApproval: "Требуется одобрение",
    save: "Сохранить",
    clearKey: "Очистить ключ",
    currentKey: "Текущий ключ",
    noKey: "Ключ не настроен",
    publishToSquare: "Опубликовать в галерее",
    role: "Роль",
    status: "Статус",
    credits: "Кредиты",
    checkinToday: "Получить бонусы",
    checkedIn: "Бонус получен",
    checkinReward: "Ежедневно +1 кредит",
    noticeTitle: "Уведомление о контенте",
    noticeSubtitle: "Для безопасности платформы мы обновили систему проверки контента.",
    noticeCore: "Основные правила",
    noticePrivacy: "Конфиденциальность",
    noticeTogether: "Вместе: Спасибо за понимание.",
    noticeAck: "Я понимаю",
    active: "Активен",
    disabled: "Отключен",
    user: "Пользователь",
    adminRole: "Админ",
    funMsgs: [
      "Подбираем цвета...",
      "Добавляем вдохновения...",
      "ИИ начинает рисовать...",
      "Смешиваем свет и тени...",
      "Вызываем воображение...",
      "Шедевр в процессе...",
      "Идеи обретают форму...",
      "Последние штрихи..."
    ]
  },
  en: {
    brand: "Imagens",
    promptLibrary: "Prompts",
    imageEditor: "Image Editor",
    contact: "Contact",
    admin: "Admin",
    myWorks: "My Works",
    login: "Login",
    logout: "Logout",
    headPre: "Create with",
    headItalic: "imagination",
    headPost: "",
    desc: "Transform your ideas into polished visuals with GPT Image. Just describe what you see in your mind.",
    reviews: "Generated images are saved to your gallery",
    todayGeneratedPrefix: "Today generated",
    todayGeneratedSuffix: "images",
    recentTitle: "Recent Creations",
    recentSubtitle: "Your creative history",
    examplesLabel: "Inspiration",
    viewMore: "View more",
    placeholder: "Describe the image you want to create...",
    create: "Create",
    generating: "Creating...",
    reference: "Reference",
    options: "Options",
    size: "Size",
    quality: "Quality",
    background: "Background",
    format: "Format",
    retry: "Regenerate",
    download: "Save",
    edit: "Edit prompt",
    editImage: "Edit",
    openEditor: "Edit image",
    emptyWorks: "No generated images yet",
    uploadEditImage: "Upload or choose an image",
    uploadEditHint: "Brush, rectangle selection, and local edit prompts",
    copy: "Copy prompt",
    use: "Generate",
    libraryBadge: "Curated Prompt Library",
    libraryTitle: "Discover Endless Creativity",
    librarySubtitle: "Search styles, scenes, and use cases, then send one straight to the composer.",
    librarySearchLabel: "Library",
    search: "Search",
    all: "All",
    noResults: "No matching prompts found",
    preview: "Preview",
    totalPrompts: "Curated Prompts",
    totalSources: "Data Sources",
    loadMore: "Load More Inspiration",
    endOfHistory: "End of history",
    loadingPrompts: "Loading prompt library...",
    loginTitle: "Login to continue",
    registerTitle: "Create account",
    authGift: "Sign in to continue creating",
    authContinue: "Sign in to continue creating",
    authBonus: "10 bonus credits on signup + 1 daily check-in credit",
    email: "Email",
    password: "Password",
    name: "Name",
    submitLogin: "Login",
    submitRegister: "Register",
    switchToRegister: "Need an account? Register",
    switchToLogin: "Already have an account? Login",
    skip: "Skip",
    creditsTitle: "Daily Check-in",
    creditsBalance: "Balance",
    oneCredit: "Credits per image",
    contactTitle: "Contact Admin",
    contactDesc: "Contact us for support",
    contactInput: "Email / Phone",
    messageInput: "Message (optional)",
    submit: "Submit",
    received: "Received",
    receivedDesc: "Admin will contact you soon",
    close: "Close",
    adminTitle: "Admin",
    settings: "Settings",
    users: "Users",
    apiKey: "OpenAI API Key",
    apiBaseUrl: "API Base URL",
    model: "Model",
    defaultCredits: "Default credits",
    generationCost: "Credits per image",
    maxImages: "Images per request",
    allowRegistration: "Allow registration",
    requireApproval: "Require approval",
    save: "Save",
    clearKey: "Clear key",
    currentKey: "Current key",
    noKey: "No key configured",
    publishToSquare: "Publish to square",
    role: "Role",
    status: "Status",
    credits: "Credits",
    checkinToday: "Check in",
    checkedIn: "Checked in today",
    checkinReward: "Daily check-in gives 1 credit",
    noticeTitle: "Content Safety Notice",
    noticeSubtitle: "To keep this platform healthy and safe, content review has been upgraded.",
    noticeCore: "Core Rules",
    noticePrivacy: "Privacy Promise",
    noticeTogether: "Together: Thank you for your understanding.",
    noticeAck: "I understand",
    active: "Active",
    disabled: "Disabled",
    user: "User",
    adminRole: "Admin",
    funMsgs: [
      "Mixing the perfect palette...",
      "Sprinkling pixel inspiration...",
      "The AI brush is warming up...",
      "Blending light and composition...",
      "Conjuring your vision...",
      "Growing your masterpiece...",
      "Brewing creativity...",
      "Adding finishing touches..."
    ]
  }
};

const fallbackPrompts = [];

const tags = ["all", "ui", "photo", "poster", "portrait", "illustration", "anime", "product", "3d", "landscape", "character", "other", "logo", "fashion", "cyberpunk", "infographic", "food"];
const tagLabels = {
  zh: {
    all: "Все",
    ui: "UI",
    photo: "Фото",
    poster: "Постер",
    portrait: "Портрет",
    illustration: "Иллюстрация",
    anime: "Аниме",
    product: "Товар",
    "3d": "3D рендер",
    landscape: "Пейзаж",
    character: "Персонаж",
    other: "Другое",
    logo: "Логотип",
    fashion: "Мода",
    cyberpunk: "Киберпанк",
    infographic: "Инфографика",
    food: "Еда"
  },
  en: {
    all: "All",
    ui: "UI",
    photo: "Photo",
    poster: "Poster",
    portrait: "Portrait",
    illustration: "Illustration",
    anime: "Anime",
    product: "E-commerce",
    "3d": "3D Render",
    landscape: "Landscape",
    character: "Character",
    other: "Other",
    logo: "Logo",
    fashion: "Fashion",
    cyberpunk: "Cyberpunk",
    infographic: "Infographic",
    food: "Food"
  }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const elements = {
  app: $("#app"),
  homeView: $("#homeView"),
  chatView: $("#chatView"),
  libraryView: $("#libraryView"),
  editorView: $("#editorView"),
  modalLayer: $("#modalLayer"),
  toastLayer: $("#toastLayer"),
  brandBtn: $("#brandBtn"),
  promptLibraryBtn: $("#promptLibraryBtn"),
  imageEditorBtn: $("#imageEditorBtn"),
  contactBtn: $("#contactBtn"),
  langBtn: $("#langBtn"),
  creditsBtn: $("#creditsBtn"),
  creditsText: $("#creditsText"),
  myWorksBtn: $("#myWorksBtn"),
  adminBtn: $("#adminBtn"),
  loginBtn: $("#loginBtn"),
  logoutBtn: $("#logoutBtn"),
  apiStatus: $("#apiStatus"),
  todayGeneratedText: $("#todayGeneratedText"),
  heroComposerMount: $("#heroComposerMount"),
  stickyComposerMount: $("#stickyComposerMount"),
  generationStatus: $("#generationStatus"),
  funMessage: $("#funMessage"),
  historyList: $("#historyList"),
  historySection: $("#historySection"),
  recentSection: $("#recentSection"),
  recentMasonry: $("#recentMasonry"),
  exampleGrid: $("#exampleGrid"),
  promptDrawerContent: $("#promptDrawerContent"),
  openLibraryInlineBtn: $("#openLibraryInlineBtn"),
  librarySearchForm: $("#librarySearchForm"),
  librarySearchInput: $("#librarySearchInput"),
  tagFilters: $("#tagFilters"),
  promptGrid: $("#promptGrid"),
  composerTemplate: $("#composerTemplate"),
  editorCanvasArea: $("#editorCanvasArea"),
  editorUploadCard: $("#editorUploadCard"),
  editorUploadInput: $("#editorUploadInput"),
  editorBottomUploadInput: $("#editorBottomUploadInput"),
  editorImageFrame: $("#editorImageFrame"),
  editorImageScaler: $("#editorImageScaler"),
  editorSourceImage: $("#editorSourceImage"),
  editorMaskCanvas: $("#editorMaskCanvas"),
  editorPromptForm: $("#editorPromptForm"),
  editorPromptInput: $("#editorPromptInput"),
  editorPublicInput: $("#editorPublicInput"),
  editorZoomText: $("#editorZoomText"),
  editorColorInput: $("#editorColorInput")
};

let heroVideoWatchdog = null;

var _csrfToken = (function() {
  var m = document.querySelector('meta[name="csrf-token"]');
  return m ? m.getAttribute("content") : "";
})();

async function api(path, options = {}) {
  var hdrs = { "Content-Type": "application/json" };
  if (_csrfToken) hdrs["X-CSRF-Token"] = _csrfToken;
  if (options.headers) Object.assign(hdrs, options.headers);
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: hdrs,
    ...options
  });
  // Update CSRF token from response header if present
  var respCsrf = response.headers.get("X-CSRF-Token");
  if (respCsrf) _csrfToken = respCsrf;
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function text(key) {
  return i18n[state.lang][key] || i18n.zh[key] || key;
}

function local(value) {
  if (value && typeof value === "object") return value[state.lang] || value.zh || value.en || "";
  return value || "";
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(state.lang === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

function truncate(value, length = 120) {
  const textValue = String(value || "");
  return textValue.length > length ? `${textValue.slice(0, length)}...` : textValue;
}

function showToast(message, icon = "ri-information-line") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="${icon}"></i><span>${escapeHtml(message)}</span>`;
  elements.toastLayer.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

function applyI18n(root = document) {
  $$("[data-i18n]", root).forEach((node) => {
    node.textContent = text(node.dataset.i18n);
  });
  $$(".prompt-box").forEach((node) => {
    node.placeholder = text("placeholder");
  });
  var langBtns = document.querySelectorAll("#langBtn");
  langBtns.forEach(function(btn) { btn.textContent = state.lang === "zh" ? "RU/EN" : "EN/RU"; });
  updateDailyMetric();
}

function formatDailyCount(value) {
  const count = Math.max(0, Number(value) || 0);
  return `${count.toLocaleString(state.lang === "zh" ? "ru-RU" : "en-US")}${count >= 1000 ? "+" : ""}`;
}

function updateDailyMetric() {
  if (!elements.todayGeneratedText) return;
  elements.todayGeneratedText.textContent = `${text("todayGeneratedPrefix")} ${formatDailyCount(state.stats.todayGenerated)} ${text("todayGeneratedSuffix")}`;
}

function updateNav() {
  const loggedIn = Boolean(state.user);
  elements.loginBtn.classList.toggle("hidden", loggedIn);
  elements.logoutBtn.classList.toggle("hidden", !loggedIn);
  elements.creditsBtn.classList.toggle("hidden", !loggedIn);
  elements.myWorksBtn.classList.toggle("hidden", !loggedIn);
  elements.imageEditorBtn.classList.toggle("hidden", !loggedIn);
  elements.adminBtn.classList.toggle("hidden", state.user?.role !== "admin");
  elements.creditsText.textContent = state.user
    ? (state.user.unlimited ? `${text("credits")} ♾` : `${text("credits")} ${state.user.credits}`)
    : "0";

  const hasApiKey = Boolean(state.settings?.hasApiKey);
  elements.apiStatus.textContent = hasApiKey
    ? "Imagens"
    : state.lang === "zh"
      ? "API-ключ не настроен"
      : "API key not configured";
  elements.apiStatus.style.color = hasApiKey ? "#64748b" : "#b42318";
}

function setView(view) {
  state.view = view;
  elements.app.classList.toggle("editor-mode", view === "editor");
  // History now lives on homeView, so homeView is always shown when view=home
  elements.homeView.classList.toggle("hidden", view !== "home");
  elements.chatView.classList.toggle("hidden", true);
  elements.libraryView.classList.toggle("hidden", view !== "library");
  elements.editorView.classList.toggle("hidden", view !== "editor");
  if (view === "library") renderLibrary();
  if (view === "editor") renderEditor();
  updateNav();
  if (view === "home" && shouldShowHero()) {
    requestAnimationFrame(playHeroVideo);
  }
}

function shouldShowHero() {
  return state.forceHero || state.generating || state.history.length === 0;
}

function renderAll() {
  applyI18n();
  updateNav();
  renderRecentCreations();
  renderExamples();
  renderHistory();
  if (state.view === "library") renderLibrary();
  if (state.view === "editor") renderEditor();
    renderComposers();
    syncReferences();
    setView(state.view);
    // Filter UI options based on permissions
    try {
      var _isAdmin = state.user && state.user.role === "admin";
      var _gcfg = JSON.parse(state.settings && state.settings.uiConfig || "{}");
      var _ucfg = JSON.parse(state.user && state.user.effectiveConfig || "{}");
      var _cfg = Object.assign({}, _gcfg, _ucfg);
      ["sizes","qualityOptions","backgroundOptions","formatOptions"].forEach(function(k){if(_ucfg[k])_cfg[k]=_ucfg[k];});
      document.querySelectorAll(".composer").forEach(function(f) {
        var _sz = f.querySelector(".size-input");
        if (_sz) [].slice.call(_sz.options).forEach(function(o){o.hidden = !(o.value==="custom"||_isAdmin||(_cfg.sizes||[]).includes(o.value));});
        var _ql = f.querySelector(".quality-input");
        if (_ql) [].slice.call(_ql.options).forEach(function(o){o.hidden = !(_isAdmin||(_cfg.qualityOptions||[]).includes(o.value));});
        var _bg = f.querySelector(".background-input");
        if (_bg) [].slice.call(_bg.options).forEach(function(o){o.hidden = !(_isAdmin||(_cfg.backgroundOptions||[]).includes(o.value));});
        var _fmt = f.querySelector(".format-input");
        if (_fmt) [].slice.call(_fmt.options).forEach(function(o){o.hidden = !(_isAdmin||(_cfg.formatOptions||[]).includes(o.value));});
      });
    } catch(e) {}
  }

function recentFallbackItems() {
  return getPromptSource().slice(0, 12).map((prompt, index) => ({
    id: `sample_${prompt.id}`,
    prompt: prompt.prompt,
    title: prompt.title,
    image: prompt.image,
    icon: prompt.icon || "ri-image-line",
    colors: prompt.colors,
    isSample: true,
    heightClass: ["tall", "medium", "short", "medium", "tall", "short"][index % 6]
  }));
}

function recentHistoryItems() {
  return state.publicGallery
    .filter((item) => item.images?.[0])
    .slice(0, 16)
    .map((item, index) => ({
      id: item.id,
      prompt: item.prompt,
      title: truncate(item.prompt, 36),
      image: item.images[0],
      isSample: false,
      isPublic: true,
      heightClass: ["medium", "tall", "short", "medium"][index % 4],
      time: item.time
    }));
}

function renderRecentCreations() {
  const items = recentHistoryItems();
  const displayItems = items.length ? items : recentFallbackItems();
  elements.recentMasonry.innerHTML = displayItems.map((item) => {
    const visual = item.image
      ? `<img src="${item.image}" loading="lazy" decoding="async" fetchpriority="low" alt="${escapeHtml(truncate(item.prompt, 80))}">`
      : `<div class="recent-gradient" style="--art-bg:${item.colors}"><i class="${item.icon}"></i></div>`;
    return `
      <button class="recent-tile ${item.heightClass}" type="button" data-recent-id="${escapeHtml(item.id)}">
        <div class="recent-visual">${visual}</div>
        <div class="recent-caption">
          <strong>${escapeHtml(item.title || truncate(item.prompt, 34))}</strong>
          <span>${escapeHtml(truncate(item.prompt, 76))}</span>
        </div>
      </button>
    `;
  }).join("");

  $$("[data-recent-id]", elements.recentMasonry).forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.recentId;
      const item = displayItems.find((entry) => String(entry.id) === id);
      if (item) openRecentPreview(item);
    });
  });
}

function openRecentPreview(item) {
  const visual = item.image
    ? `<img class="preview-image" src="${item.image}" alt="${escapeHtml(truncate(item.prompt, 80))}">`
    : `<div class="preview-gradient" style="--art-bg:${item.colors}"><i class="${item.icon}"></i></div>`;
  openModal(`
    <section class="modal preview-modal">
      <button class="close-modal" type="button"><i class="ri-close-line"></i></button>
      ${visual}
      <div class="preview-body">
        <h2>${escapeHtml(item.title || text("preview"))}</h2>
        <p>${escapeHtml(item.prompt)}</p>
        <div class="message-actions preview-actions">
          ${item.image ? `<a href="${item.image}" download="${escapeHtml(item.id)}.png"><i class="ri-download-line"></i>${text("download")}</a>` : ""}
          ${item.image ? `<button type="button" data-preview-editor><i class="ri-magic-line"></i>${text("openEditor")}</button>` : ""}
          <button type="button" data-preview-use><i class="ri-edit-line"></i>${text("edit")}</button>
          <button type="button" data-preview-copy><i class="ri-file-copy-line"></i>${text("copy")}</button>
        </div>
      </div>
    </section>
  `);
  $("[data-preview-use]", elements.modalLayer).addEventListener("click", () => {
    state.draftPrompt = item.prompt;
    closeModal();
    state.forceHero = true;
    setView("home");
    syncComposers();
    setTimeout(() => $(".prompt-box", elements.heroComposerMount)?.focus(), 120);
  });
  $("[data-preview-editor]", elements.modalLayer)?.addEventListener("click", () => {
    closeModal();
    openImageEditor(item.image, item.prompt);
  });
  $("[data-preview-copy]", elements.modalLayer).addEventListener("click", async () => {
    await copyText(item.prompt);
    showToast(state.lang === "zh" ? "Промпт скопирован" : "Prompt copied", "ri-file-copy-line");
  });
}

function renderComposers() {
  // Hide composers when not logged in
  const loggedIn = !!state.user;
  if (elements.stickyComposerMount) {
    elements.stickyComposerMount.style.display = loggedIn ? "" : "none";
  }
  if (elements.heroComposerMount) {
    elements.heroComposerMount.style.display = loggedIn ? "" : "none";
  }
  if (!loggedIn) {
    // Remove existing composers so they don't get re-shown
    if (elements.stickyComposerMount) elements.stickyComposerMount.innerHTML = "";
    return;
  }
  if (elements.heroComposerMount && !elements.heroComposerMount.children.length) {
    // Hero composer not used - stickyComposerMount handles composer
  }
  if (elements.stickyComposerMount && !elements.stickyComposerMount.children.length) {
    elements.stickyComposerMount.appendChild(createComposer(true));
  }
  // Force centering via inline styles
  if (elements.stickyComposerMount) {
    elements.stickyComposerMount.style.position = "fixed";
    elements.stickyComposerMount.style.left = "50%";
    elements.stickyComposerMount.style.bottom = "10px";
    elements.stickyComposerMount.style.transform = "translateX(-50%)";
    elements.stickyComposerMount.style.zIndex = "999";
    elements.stickyComposerMount.style.pointerEvents = "none";
    const composer = elements.stickyComposerMount.querySelector(".composer");
    if (composer) {
      composer.style.position = "relative";
      composer.style.margin = "0";
      composer.style.maxWidth = "1200px";
      composer.style.width = "calc(100% - 40px)";
      composer.style.pointerEvents = "auto";
      composer.style.boxSizing = "border-box";
    }
  }
  document.querySelectorAll(".gen-bar-wrap").forEach(function(w) {
    w.classList.toggle("active", state.generating);
  });
  syncComposers();
}

function createComposer(sticky) {
  const fragment = elements.composerTemplate.content.cloneNode(true);
  const form = $(".composer", fragment);
  const textarea = $(".prompt-box", form);
  const referenceInput = $(".reference-input", form);
  const referenceRow = $(".reference-row", form);
  const optionsToggle = $(".options-toggle", form);
  const publicInput = $(".public-input", form);
  const advanced = $(".advanced-options", form);

  form.dataset.sticky = sticky ? "1" : "0";
  textarea.addEventListener("input", () => {
    state.draftPrompt = textarea.value;
    syncComposers(form);
  });
  textarea.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      form.requestSubmit();
    }
  });
  referenceInput.addEventListener("change", async () => {
    const files = [...referenceInput.files].slice(0, 4);
    const results = [];
    for (const file of files) {
      const url = await blobToDataUrl(file);
      results.push({ file, url, name: file.name });
    }
    state.references = state.references.concat(results);
    renderReferences(referenceRow);
    syncReferences(form);
    if (state.references.length) {
      showToast(state.lang === "zh" ? "Добавлено превью референса; бэкенд пока генерирует по тексту" : "Reference previews added; backend currently generates from text", "ri-image-add-line");
    }
  });
  optionsToggle.addEventListener("click", () => {
    advanced.classList.toggle("hidden");
    optionsToggle.classList.toggle("active", !advanced.classList.contains("hidden"));
  });
  publicInput.addEventListener("change", () => {
    state.publishToSquare = publicInput.checked;
    syncComposers(form);
  });
  $$(".advanced-options select", form).forEach((select) => {
    select.addEventListener("change", () => {
      state.generationOptions = getComposerOptions(form);
      updateCustomSizeVisibility(form);
      syncComposers(form);
    });
  });
  $$(".custom-size-row input", form).forEach((input) => {
    input.addEventListener("input", () => {
      state.generationOptions = getComposerOptions(form);
      syncComposers(form);
    });
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitGeneration(form);
  });
  applyI18n(form);
  return fragment;
}

function getComposerOptions(form) {
  const sizeValue = $(".size-input", form).value;
  const customWidth = $(".custom-width-input", form)?.value || "2048";
  const customHeight = $(".custom-height-input", form)?.value || "2048";
  return {
    size: sizeValue === "custom" ? `${customWidth}x${customHeight}` : sizeValue,
    sizeMode: sizeValue,
    customWidth,
    customHeight,
    n: Number($(".n-input", form).value) || 1,
    quality: $(".quality-input", form).value,
    background: $(".background-input", form).value,
    outputFormat: $(".format-input", form).value,
    isPublic: $(".public-input", form).checked
  };
}

function updateCustomSizeVisibility(form) {
  const row = $(".custom-size-row", form);
  if (!row) return;
  row.classList.toggle("hidden", $(".size-input", form).value !== "custom");
}

function syncComposers(sourceForm) {
  $$(".composer").forEach((form) => {
    if (form !== sourceForm) {
      $(".prompt-box", form).value = state.draftPrompt;
      const mode = state.generationOptions.sizeMode || state.generationOptions.size;
      $(".size-input", form).value = [...$(".size-input", form).options].some((option) => option.value === mode) ? mode : "custom";
      $(".custom-width-input", form).value = state.generationOptions.customWidth || "2048";
      $(".custom-height-input", form).value = state.generationOptions.customHeight || "2048";
      $(".quality-input", form).value = state.generationOptions.quality;
      $(".background-input", form).value = state.generationOptions.background;
      $(".format-input", form).value = state.generationOptions.outputFormat;
      $(".public-input", form).checked = state.publishToSquare;
    }
    updateCustomSizeVisibility(form);
    $(".model-label", form).textContent = "Imagens";
    $(".send-button", form).disabled = state.generating || !state.settings?.hasApiKey;
  });
}

function renderReferences(row) {
  row.innerHTML = state.references.map((reference, index) => `
    <div class="reference-thumb">
      <img src="${reference.url}" alt="${escapeHtml(reference.name)}">
      <button type="button" data-remove-reference="${index}"><i class="ri-close-line"></i></button>
    </div>
  `).join("");
  row.classList.toggle("hidden", state.references.length === 0);
  $$("[data-remove-reference]", row).forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.removeReference);
      const [removed] = state.references.splice(index, 1);
      if (removed?.url) URL.revokeObjectURL(removed.url);
      $$(".reference-row").forEach(renderReferences);
    });
  });
}

function syncReferences(sourceForm) {
  $$(".reference-row").forEach((row) => {
    if (!sourceForm || row !== $(".reference-row", sourceForm)) renderReferences(row);
  });
}

async function submitGeneration(form) {
  const prompt = $(".prompt-box", form).value.trim();
  if (!prompt) return;
  if (!state.user) {
    state.draftPrompt = prompt;
    openAuthModal("login");
    return;
  }
  if (!state.settings?.hasApiKey) {
    showToast(state.lang === "zh" ? "Сначала настройте OpenAI API Key в панели управления" : "Configure the OpenAI API key first", "ri-key-2-line");
    return;
  }
  if (state.generating) return;

  state.generationOptions = getComposerOptions(form);
  state.publishToSquare = state.generationOptions.isPublic;
  const tempId = `tmp_${Date.now()}`;
  const item = {
    id: tempId,
    prompt,
    images: [],
    status: "generating",
    time: new Date().toISOString(),
    isPublic: state.publishToSquare,
    options: { ...state.generationOptions },
    references: state.references.map((reference) => reference.url)
  };
  state.refStore[tempId] = item.references;
  state.forceHero = false;
  state.generating = true;
  startFunMessages();
  renderAll();
  setView("home");

  try {
    console.log("[RETRY DEBUG] references:", item.references, "count:", item.references ? item.references.length : 0);
    const data = await api("/api/images/generate", {
      method: "POST",
      body: JSON.stringify({
        prompt,
        size: item.options.size,
        quality: item.options.quality,
        background: item.options.background,
        outputFormat: item.options.outputFormat,
        isPublic: item.isPublic,
        n: item.options.n || 1,
        references: item.references
      })
    });
    state.history = data.generations.map((generation) => {
            var newItem = {
              id: generation.id,
              prompt: prompt,
              images: [generation.imageUrl],
              status: "done",
              time: generation.createdAt,
              model: generation.model,
              isPublic: Boolean(generation.isPublic),
              options: { ...item.options },
              references: item.references
            };
            state.refStore[generation.id] = item.references;
            return newItem;
          }).concat(state.history);
    state.user.credits = data.credits;
    state.stats.todayGenerated += data.generations.length;
    updateDailyMetric();
    if (item.isPublic) await loadPublicGallery();
    showToast(state.lang === "zh" ? "Создано" : "Created", "ri-sparkling-2-fill");
  } catch (error) {
    state.history = state.history.map((entry) =>
      entry.id === tempId ? { ...entry, status: "error", error: error.message } : entry
    );
    if (/credit|баланс|лимит|очки|Not enough/i.test(error.message)) openCreditsModal();
    else showToast(error.message, "ri-error-warning-line");
  } finally {
    state.generating = false;
    stopFunMessages();
    renderAll();
    console.log("[GENERATE DONE] renderAll called, history length:", state.history.length);
  }
}

function startFunMessages() {
  stopFunMessages();
  state.funIndex = 0;
  elements.generationStatus.classList.remove("hidden");
  elements.funMessage.textContent = text("funMsgs")[0];
  state.funTimer = setInterval(() => {
    const messages = text("funMsgs");
    state.funIndex = (state.funIndex + 1) % messages.length;
    elements.funMessage.textContent = messages[state.funIndex];
  }, 3000);
}

function stopFunMessages() {
  if (state.funTimer) clearInterval(state.funTimer);
  state.funTimer = null;
  elements.generationStatus.classList.add("hidden");
}

function scrollToBottom() {
  setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 80);
}

let historyObserver = null;
let historyLoading = false;

async function loadHistory(before) {
  if (!state.user) {
    state.history = [];
    return;
  }
  if (historyLoading) return;
  historyLoading = true;
  try {
    var targetUser = state.adminFilterUserId;
    var q = "/api/images/history?limit=20";
    if (before) q += "&before=" + encodeURIComponent(before);
    if (targetUser) q += "&userId=" + encodeURIComponent(targetUser);
    const data = await api(q);
    if (data.generations) {
      var existingIds = new Set(state.history.map(function(h) { return h.id; }));
      data.generations.forEach(function(generation) {
        if (existingIds.has(generation.id)) return;
        state.history.push({
          id: generation.id,
          prompt: generation.prompt,
          images: [generation.imageUrl],
          status: "done",
          time: generation.createdAt,
          model: generation.model,
          isPublic: Boolean(generation.isPublic),
          options: {
            size: generation.size,
            quality: generation.quality,
            background: generation.background,
            outputFormat: generation.outputFormat
          },
          references: state.refStore[generation.id] || generation.references || undefined
        });
        existingIds.add(generation.id);
      });
      state.historyEnd = !data.hasMore;
      state.historyLoaded = true;
    }
  } catch (error) {
    showToast(error.message, "ri-error-warning-line");
  } finally {
    historyLoading = false;
    renderHistory();
  }
}

function renderHistory() {
  const loggedIn = !!state.user;

  // Show history section only when logged in
  if (elements.historySection) {
    elements.historySection.classList.toggle("hidden", !loggedIn);
  }

  // Initial load if empty
  if (!state.historyLoaded && loggedIn) { loadHistory(); }

  // Load users for admin filter
  if (state.user && state.user.role === "admin" && !state.adminUsers) {
    state.adminUsers = [];
    api("/api/admin/users").then(function(d) {
      if (d && d.users) state.adminUsers = d.users;
    }).catch(function() {});
  }

  var isAdmin = state.user && state.user.role === "admin";
  var filterHtml = "";
  if (isAdmin) {
    var selUser = state.adminFilterUserId ? (state.adminUsers || []).find(function(u) { return u.id === state.adminFilterUserId; }) : null;
    filterHtml = '<div id="adminFilterWrap" style="margin-bottom:12px;display:flex;align-items:center;gap:8px;position:relative">' +
      '<label style="font-size:12px;color:#888;white-space:nowrap">Filter user:</label>' +
      '<div style="position:relative;flex:1;max-width:280px">' +
      '<input id="afInput" type="text" placeholder="Type to search..." value="' + (selUser ? escapeHtml(selUser.name || selUser.email) : "") + '" style="width:100%;padding:6px 28px 6px 10px;border:1px solid #d0d5dd;border-radius:8px;font-size:13px">' +
      '<button id="afClear" type="button" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);border:none;background:none;cursor:pointer;font-size:14px;color:#999;display:' + (selUser ? "inline" : "none") + '">&times;</button>' +
      '<div id="afList" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:100;background:#fff;border:1px solid #d0d5dd;border-radius:8px;max-height:200px;overflow-y:auto;box-shadow:0 4px 12px rgba(0,0,0,0.1)"></div>' +
      '</div></div>';
  }

  elements.historyList.innerHTML = filterHtml + `
    <div class="image-grid">
      ${state.history.map((item) => {
        if (item.status === "done") {
          return `
            <div class="image-cell" data-cell-id="${escapeHtml(item.id)}">
              <img src="${item.images[0]}" alt="${escapeHtml(truncate(item.prompt, 80))}">
              <div class="cell-overlay">
                <a href="${item.images[0]}" download="${item.id}.png" title="${escapeHtml(text("download"))}" aria-label="${escapeHtml(text("download"))}"><i class="ri-download-line"></i></a>
                <button type="button" data-retry-id="${escapeHtml(item.id)}" title="${escapeHtml(text("retry"))}" aria-label="${escapeHtml(text("retry"))}"><i class="ri-refresh-line"></i></button>
                <button type="button" data-edit="${escapeHtml(item.prompt)}" title="${escapeHtml(text("edit"))}" aria-label="${escapeHtml(text("edit"))}"><i class="ri-edit-line"></i></button>
                <button type="button" data-edit-image="${escapeHtml(item.id)}" title="${escapeHtml(text("openEditor"))}" aria-label="${escapeHtml(text("openEditor"))}"><i class="ri-magic-line"></i></button>
              </div>
            </div>`;
        }
        if (item.status === "generating") {
          return `
            <div class="image-cell" data-cell-id="${escapeHtml(item.id)}">
              <div class="cell-generating">
                <div class="paint-drip"><span></span><span></span><span></span><span></span><span></span></div>
              </div>
            </div>`;
        }
        return `
          <div class="image-cell" data-cell-id="${escapeHtml(item.id)}">
            <div class="cell-error">${escapeHtml(item.error || "Error")}</div>
          </div>`;
      }).join("")}
      ${!state.historyEnd && state.historyLoaded ? '<div id="historySentinel" class="history-sentinel" style="height:1px"></div>' : ""}
      ${state.historyEnd && state.history.length > 0 ? '<div class="history-end" style="text-align:center;padding:16px;color:#888;font-size:13px">' + text("endOfHistory") + '</div>' : ""}
      ${!state.historyLoaded && loggedIn ? '<div class="history-loading" style="text-align:center;padding:16px;color:#888">Loading...</div>' : ""}
    </div>
  `;

  // Bind event listeners
  $$("[data-retry-id]", elements.historyList).forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const item = state.history.find((entry) => String(entry.id) === button.dataset.retryId);
      if (!item) return;
      state.draftPrompt = item.prompt || "";
      var refs = Array.isArray(item.references) && item.references.length
        ? item.references
        : (state.refStore[item.id] || []);
      state.references = refs.filter(Boolean).map(function(url) { return { url: url, name: "ref.png" }; });
      syncComposers();
      $$(".reference-row").forEach(function(r){ renderReferences(r); });
      const form = $(".composer", elements.stickyComposerMount) || $(".composer", elements.heroComposerMount);
      submitGeneration(form);
    });
  });
  $$("[data-edit-image]", elements.historyList).forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const item = state.history.find((entry) => String(entry.id) === button.dataset.editImage);
      if (item?.images?.[0]) openImageEditor(item.images[0], item.prompt);
    });
  });
  $$("[data-edit]", elements.historyList).forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      state.draftPrompt = button.dataset.edit;
      syncComposers();
      $(".prompt-box", $(".composer", elements.stickyComposerMount) || document).focus();
    });
  });
  $$("[data-cell-id]", elements.historyList).forEach((cell) => {
    cell.addEventListener("click", function(e) {
      if (e.target.closest("a, button")) return;
      var img = this.querySelector("img");
      if (!img) return;
      var viewer = document.getElementById("imageViewer");
      if (viewer) { viewer.remove(); return; }
      viewer = document.createElement("div");
      viewer.id = "imageViewer";
      viewer.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;box-sizing:border-box";
      var closeBtn = document.createElement("button");
      closeBtn.innerHTML = '<i class="ri-close-line"></i>';
      closeBtn.style.cssText = "position:absolute;top:16px;right:16px;width:40px;height:40px;border-radius:50%;border:none;background:rgba(0,0,0,0.5);color:#fff;font-size:24px;cursor:pointer;z-index:2;display:flex;align-items:center;justify-content:center";
      closeBtn.addEventListener("click", function(e) { e.stopPropagation(); viewer.remove(); });
      viewer.appendChild(closeBtn);
      var actions = document.createElement("div");
      actions.style.cssText = "position:absolute;bottom:20px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:2";
      var overlayClone = this.querySelector(".cell-overlay");
      if (overlayClone) {
        var btns = overlayClone.querySelectorAll("a, button");
        btns.forEach(function(b) {
          var clone = b.cloneNode(true);
          clone.style.cssText = "background:rgba(26,26,26,0.85);backdrop-filter:blur(8px);color:#e5e5e5;border-radius:8px;width:40px;height:40px;padding:0;font-size:18px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;text-decoration:none;border:1px solid rgba(255,255,255,0.15);transition:all 0.15s";
          clone.addEventListener("mouseenter", function() { this.style.background = "#7c3aed"; this.style.borderColor = "#7c3aed"; });
          clone.addEventListener("mouseleave", function() { this.style.background = "rgba(26,26,26,0.85)"; this.style.borderColor = "rgba(255,255,255,0.15)"; });
          actions.appendChild(clone);
        });
      }
      viewer.appendChild(actions);
      var closeImg = document.createElement("img");
      closeImg.style.cssText = "max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,0.5);position:relative;z-index:1";
      closeImg.id = "imageViewerImg";
      viewer.appendChild(closeImg);
      viewer.addEventListener("click", function(e) { if (e.target === this) this.remove(); });
      document.body.appendChild(viewer);
      document.getElementById("imageViewerImg").src = img.src;
    });
  });
  setupHistoryScroll();

  // Bind admin filter autocomplete
  var afInput = document.getElementById("afInput");
  var afList = document.getElementById("afList");
  var afClear = document.getElementById("afClear");
  if (afInput) {
    afInput.oninput = function() {
      var q = this.value.toLowerCase();
      var items = (state.adminUsers || []).filter(function(u) { return (u.name || u.email).toLowerCase().indexOf(q) >= 0; });
      afList.innerHTML = items.map(function(u) { return '<div class="af-item" data-id="' + u.id + '" style="padding:6px 10px;cursor:pointer;font-size:13px;border-bottom:1px solid #eee">' + escapeHtml(u.name || u.email) + ' <span style="color:#999;font-size:11px">' + escapeHtml(u.email) + '</span></div>'; }).join("");
      afList.style.display = items.length && q ? "block" : "none";
    };
    afList.onclick = function(e) {
      var item = e.target.closest(".af-item");
      if (!item) return;
      state.adminFilterUserId = item.dataset.id;
      afInput.value = item.textContent.trim().split(" ")[0];
      afList.style.display = "none";
      afClear.style.display = "inline";
      // Reload history with new filter
      state.history = [];
      state.historyLoaded = false;
      historyLoading = false;
      state.historyEnd = false;
      loadHistory();
    };
    if (afClear) {
      afClear.onclick = function() {
        state.adminFilterUserId = "";
        afInput.value = "";
        afClear.style.display = "none";
        afList.style.display = "none";
        state.history = [];
        state.historyLoaded = false;
        historyLoading = false;
        state.historyEnd = false;
        loadHistory();
      };
    }
    document.addEventListener("click", function(e) {
      if (!e.target.closest("#adminFilterWrap")) afList.style.display = "none";
    });
  }
}
// Infinite scroll: IntersectionObserver for history sentinel
function setupHistoryScroll() {
  if (historyObserver) historyObserver.disconnect();
  var sentinel = document.getElementById("historySentinel");
  if (!sentinel || state.historyEnd) return;
  historyObserver = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting && !historyLoading && !state.historyEnd) {
      var last = state.history[state.history.length - 1];
      if (last) loadHistory(last.id);
    }
  }, { rootMargin: "200px" });
  historyObserver.observe(sentinel);
}

function renderExamples() {
  if (elements.promptDrawerContent) {
    elements.promptDrawerContent.innerHTML = getPromptSource().map(promptCardHtml).join("");
    bindPromptCards(elements.promptDrawerContent);
  }
  if (elements.exampleGrid) {
    var _src = getPromptSource().slice().sort(function(){return 0.5-Math.random();});
    elements.exampleGrid.innerHTML = _src.slice(0, 5).map(promptCardHtml).join("");
    bindPromptCards(elements.exampleGrid);
  }
}

function renderLibrary() {
  elements.librarySearchInput.value = state.librarySearch;
  const counts = getTagCounts();
  elements.tagFilters.innerHTML = tags
    .filter((tag) => tag === "all" || counts[tag])
    .map((tag) => `
    <button type="button" class="${state.libraryTag === tag ? "active" : ""}" data-tag="${tag}">
      ${escapeHtml(tagLabels[state.lang][tag] || tag)}
      <span>${tag === "all" ? getPromptSource().length : counts[tag]}</span>
    </button>
  `).join("");
  $$("[data-tag]", elements.tagFilters).forEach((button) => {
    button.addEventListener("click", () => {
      state.libraryTag = button.dataset.tag;
      state.promptVisible = 20;
      renderLibrary();
    });
  });

  const query = state.librarySearch.trim().toLowerCase();
  const source = getPromptSource();
  const filtered = source.filter((prompt) => {
    const matchesTag = state.libraryTag === "all" || prompt.tag === state.libraryTag;
    const promptTags = Array.isArray(prompt.tags) ? prompt.tags : [prompt.tag].filter(Boolean);
    const matchesTags = state.libraryTag === "all" || promptTags.includes(state.libraryTag);
    const haystack = `${prompt.title} ${prompt.prompt} ${promptTags.join(" ")} ${prompt.author || ""}`.toLowerCase();
    return (matchesTag || matchesTags) && (!query || haystack.includes(query));
  });
  const visible = filtered.slice(0, state.promptVisible);
  const sourceCount = getSourceCount(source);
  const stats = `
    <div class="library-stats">
      <div><strong>${source.length.toLocaleString()}+</strong><span>${text("totalPrompts")}</span></div>
      <div class="stat-divider"></div>
      <div><strong>${sourceCount}</strong><span>${text("totalSources")}</span></div>
    </div>
  `;
  elements.promptGrid.innerHTML = state.promptLoading
    ? `<div class="empty-message">${text("loadingPrompts")}</div>`
    : filtered.length
      ? `${visible.map(promptCardHtml).join("")}${visible.length < filtered.length ? `<div class="load-more-wrap"><button id="loadMorePrompts" type="button">${text("loadMore")} <span>(${visible.length}/${filtered.length})</span></button></div>` : ""}`
      : `<div class="empty-message">${text("noResults")}</div>`;
  const statsTarget = $(".library-stats");
  if (statsTarget) statsTarget.remove();
  $(".library-hero").insertAdjacentHTML("beforeend", stats);
  $("#loadMorePrompts")?.addEventListener("click", () => {
    state.promptVisible += 20;
    renderLibrary();
  });
  bindPromptCards(elements.promptGrid);
}

function getSourceCount(source) {
  const origins = new Set();
  source.forEach((prompt) => {
    if (prompt.source) origins.add(prompt.source);
    if (!prompt.sourceUrl) return;
    try {
      origins.add(new URL(prompt.sourceUrl).hostname.replace(/^www\./, ""));
    } catch {
      origins.add(prompt.sourceUrl);
    }
  });
  return Math.max(1, origins.size);
}

function promptCardHtml(prompt) {
  const promptText = prompt.prompt;
  const title = prompt.title;
  const tagsHtml = (prompt.tags || [prompt.tag].filter(Boolean)).slice(0, 3).map((tag) => `
    <span>${escapeHtml(tagLabels[state.lang][tag] || tag)}</span>
  `).join("");
  const primaryTag = (prompt.tags && prompt.tags[0]) || prompt.tag || "other";
  const artBg = prompt.colors || tagColor(primaryTag) || "linear-gradient(135deg,#64748b,#cbd5e1)";
  const iconClass = prompt.icon || tagIcon(primaryTag) || "ri-image-line";
  var imgSrc = prompt.image || "https://picsum.photos/seed/" + prompt.id + "/400/400";
  var art = '<img src="' + escapeHtml(imgSrc) + '" loading="lazy" decoding="async" fetchpriority="low" alt="' + escapeHtml(title) + '" crossorigin="anonymous" onerror="this.onerror=null;this.parentElement.classList.add(\'image-error\',\'image-fallback\');this.parentElement.querySelector(\'.card-fallback-icon\').style.display=\'flex\';">';
  return `
    <article class="prompt-card" style="--art-bg:${artBg}">
      <div class="card-art">
        ${art}
        <div class="card-fallback-icon" style="display:${prompt.image ? "none" : "flex"}"><i class="${iconClass}"></i></div>
        <em><i class="ri-user-line"></i>${escapeHtml(prompt.author || "@open")}</em>
      </div>
      <h3>${escapeHtml(title)}</h3>
      <div class="prompt-tags">${tagsHtml}</div>
      <p>${escapeHtml(promptText)}</p>
      <div class="card-actions">
        <button type="button" data-copy-prompt="${prompt.id}"><i class="ri-file-copy-line"></i>${text("copy")}</button>
        <button class="use-button" type="button" data-use-prompt="${prompt.id}">${text("use")} <i class="ri-arrow-right-line"></i></button>
      </div>
    </article>
  `;
}

function bindPromptCards(root) {
  $$("[data-copy-prompt]", root).forEach((button) => {
    button.addEventListener("click", async () => {
      const prompt = getPromptSource().find((item) => item.id === Number(button.dataset.copyPrompt));
      await copyText(prompt.prompt);
      showToast(state.lang === "zh" ? "Prompt copied" : "Prompt copied", "ri-file-copy-line");
    });
  });
  $$("[data-use-prompt]", root).forEach((button) => {
    button.addEventListener("click", () => {
      const prompt = getPromptSource().find((item) => item.id === Number(button.dataset.usePrompt));
      state.draftPrompt = prompt.prompt;
      state.forceHero = true;
      setView("home");
      syncComposers();
      showToast(state.lang === "zh" ? "Filled into generation box" : "Sent to composer", "ri-arrow-right-line");
      setTimeout(() => $(".prompt-box", elements.heroComposerMount)?.focus(), 120);
    });
  });
}function openImageEditor(imageUrl, prompt) {
  function initFilerobot(url) {
    try {
      var existing = document.getElementById("filerobotContainer");
      if (existing) existing.remove();
      var c = document.createElement("div");
      c.id = "filerobotContainer";
      c.style.cssText = "position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center";
      document.body.appendChild(c);
      var wrap = document.createElement("div");
      wrap.style.cssText = "width:90vw;height:90vh;position:relative;border-radius:8px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.4)";
      c.appendChild(wrap);
      if (typeof FilerobotImageEditor === "undefined") { console.error("Filerobot not loaded"); c.remove(); return; }
      var FE = FilerobotImageEditor.default || FilerobotImageEditor;
      var styleFix = document.createElement('style');
      styleFix.textContent = '.FIE_annotation-option-popup,.FIE_color-picker-triggerer[data-state="open"],#SfxPopper,.SfxPopper-root,.SfxMenu-root,.SfxModal-Wrapper,[class*="__portal"],[class*="popup"],[class*="dropdown"],[class*="menu"]{z-index:2147483647!important}.FIE_root{overflow:visible!important}.FIE_main-container{overflow:visible!important}#SfxPopper{position:relative;z-index:2147483647!important}.FUE_refBtn{display:none!important;margin-left:16px!important}.FIE_topbar [class*="sc-21g986-1"]{margin-right:auto!important}.FIE_topbar [class*="sc-21g986-2"]{margin-left:auto!important}';
      document.head.appendChild(styleFix);
      var ed = new FE(wrap, {
        source: url,
        tabsIds: ["Adjust","Finetune","Filters","Annotate","Watermark","Resize"],
        annotationsCommon: { fill: "#ff0000", stroke: "#000000", strokeWidth: 2, opacity: 1 },
        Text: { fonts: ["Arial","Times New Roman","Courier New","Georgia","Verdana","Impact","Comic Sans MS"] },
        onSave: function(o) {
          if (o && o.imageBase64) { var a = document.createElement("a"); a.href = o.imageBase64; a.download = "edited_" + Date.now() + ".png"; a.click(); }
          c.remove();
        },
        onClose: function(){ c.remove(); },
        onReference: function(imgData) {
          doReference(imgData);
        }
      });
      ed.render();
      function doReference(imgData) {
        if (imgData && typeof state !== "undefined" && state.references !== undefined) {
          state.references.push({ file: null, url: imgData, name: "edited.png" });
          document.querySelectorAll(".reference-row").forEach(function(row) {
            if (typeof renderReferences === "function") renderReferences(row);
          });
          if (typeof syncReferences === "function") syncReferences();
          if (typeof setView === "function") setView("home");
        }
        c.remove();
      }
      function initRefButton() {
        if (document.querySelector(".FUE_refBtn")) return;
        var tb = wrap.querySelector('[class*="Topbar"], [class*="topbar"], [class*="header"]');
        if (!tb) { setTimeout(initRefButton, 200); return; }
        var sb = tb.querySelector(".FIE_topbar-save");
        if (sb) {
          var sw = sb.closest('[class*="sc-21g986-1"]');
          if (sw && sw.parentNode === tb) { tb.insertBefore(sw, tb.firstChild); }
        }
        tb.insertAdjacentHTML("beforeend", '<button class="FUE_refBtn" style="display:inline-flex!important;align-items:center;gap:6px;margin-left:auto;margin-right:12px;padding:7px 16px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:#7c3aed;color:#fff;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;transition:all .15s" onmouseover="this.style.background=\'#6d28d9\'" onmouseout="this.style.background=\'#7c3aed\'"><i class="ri-image-add-line" style="font-size:15px"></i> Use as Reference</button>');
        var btn = tb.querySelector(".FUE_refBtn");
        if (!btn) return;
        btn.onclick = function() {
          try {
            var d = ed.getCurrentImgData();
            if (d && d.imageBase64) { doReference(d.imageBase64); return; }
            var canvases = wrap.querySelectorAll("canvas");
            for (var i = 0; i < canvases.length; i++) {
              if (canvases[i].width > 100 && canvases[i].height > 100) { doReference(canvases[i].toDataURL("image/png")); return; }
            }
          } catch(e) { console.error("Filerobot ref error:", e); }
        };
      }
      setTimeout(initRefButton, 500);
    } catch(e) { console.error("Filerobot error:", e); }
  }
  if(imageUrl){initFilerobot(imageUrl);return}
  var inp=document.createElement("input");inp.type="file";inp.accept="image/*";
  inp.onchange=function(){var f=inp.files[0];if(!f)return;var r=new FileReader();r.onload=function(e){initFilerobot(e.target.result)};r.readAsDataURL(f)};
  inp.click()
}

function renderEditor() {
  if (!elements.editorView) return;
  $$("[data-editor-tool]", elements.editorView).forEach((button) => {
    button.classList.toggle("active", button.dataset.editorTool === state.editor.tool);
  });
  if (document.activeElement !== elements.editorPromptInput) {
    elements.editorPromptInput.value = state.editor.prompt || "";
  }
  elements.editorColorInput.value = state.editor.color;
  elements.editorUploadCard.classList.toggle("hidden", Boolean(state.editor.imageUrl));
  elements.editorImageFrame.classList.toggle("hidden", !state.editor.imageUrl);
  elements.editorZoomText.textContent = `${Math.round(state.editor.zoom * 100)}%`;
  elements.editorImageScaler.style.transform = `scale(${state.editor.zoom})`;
  if (state.editor.imageUrl && elements.editorSourceImage.getAttribute("src") !== state.editor.imageUrl) {
    elements.editorSourceImage.src = state.editor.imageUrl;
  }
}

function setEditorImage(src, imageData = "") {
  state.editor.imageUrl = src;
  state.editor.imageData = imageData || (src.startsWith("data:") ? src : "");
  state.editor.zoom = 1;
  state.editor.history = [];
  renderEditor();
}

function resetEditorCanvas() {
  const image = elements.editorSourceImage;
  const canvas = elements.editorMaskCanvas;
  if (!image?.naturalWidth || !canvas) return;
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  state.editor.history = [canvas.toDataURL("image/png")];
}

function editorPoint(event) {
  const canvas = elements.editorMaskCanvas;
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function pushEditorHistory() {
  const canvas = elements.editorMaskCanvas;
  state.editor.history.push(canvas.toDataURL("image/png"));
  if (state.editor.history.length > 20) state.editor.history.shift();
}

function restoreEditorHistory(dataUrl) {
  const canvas = elements.editorMaskCanvas;
  const ctx = canvas.getContext("2d");
  const image = new Image();
  image.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
  };
  image.src = dataUrl;
}

function editorPointerDown(event) {
  if (!state.editor.imageUrl || state.editor.tool === "move") return;
  event.preventDefault();
  const canvas = elements.editorMaskCanvas;
  const ctx = canvas.getContext("2d");
  const point = editorPoint(event);
  state.editor.pointerDown = true;
  state.editor.startPoint = point;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (state.editor.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 34 / state.editor.zoom;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  } else if (state.editor.tool === "rect") {
    state.editor.snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = hexToRgba(state.editor.color, 0.72);
    ctx.lineWidth = 18 / state.editor.zoom;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }
}

function editorPointerMove(event) {
  if (!state.editor.pointerDown) return;
  event.preventDefault();
  const canvas = elements.editorMaskCanvas;
  const ctx = canvas.getContext("2d");
  const point = editorPoint(event);
  if (state.editor.tool === "rect" && state.editor.snapshot) {
    ctx.putImageData(state.editor.snapshot, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = hexToRgba(state.editor.color, 0.78);
    ctx.lineWidth = 8 / state.editor.zoom;
    ctx.strokeRect(
      state.editor.startPoint.x,
      state.editor.startPoint.y,
      point.x - state.editor.startPoint.x,
      point.y - state.editor.startPoint.y
    );
  } else {
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }
}

function editorPointerUp() {
  if (!state.editor.pointerDown) return;
  const ctx = elements.editorMaskCanvas.getContext("2d");
  ctx.closePath();
  ctx.globalCompositeOperation = "source-over";
  state.editor.pointerDown = false;
  state.editor.snapshot = null;
  pushEditorHistory();
}

function undoEditorMark() {
  if (state.editor.history.length <= 1) return;
  state.editor.history.pop();
  restoreEditorHistory(state.editor.history[state.editor.history.length - 1]);
}

function zoomEditor(direction) {
  const factor = direction === "+" ? 1.12 : 0.88;
  state.editor.zoom = Math.max(0.25, Math.min(3, state.editor.zoom * factor));
  renderEditor();
}

function hexToRgba(hex, alpha) {
  const raw = hex.replace("#", "");
  const bigint = Number.parseInt(raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

async function handleEditorUpload(file) {
  if (!file) return;
  const dataUrl = await blobToDataUrl(file);
  setEditorImage(dataUrl, dataUrl);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function imageReferenceForEdit(src) {
  if (!src) return "";
  if (src.startsWith("data:")) return src;
  try {
    const response = await fetch(src, { credentials: "same-origin" });
    if (!response.ok) throw new Error("Image fetch failed");
    return await blobToDataUrl(await response.blob());
  } catch {
    return src;
  }
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function editorAnnotatedImageData(originalData) {
  const maskCanvas = elements.editorMaskCanvas;
  if (!canvasHasMarks(maskCanvas)) return { imageData: originalData, maskData: "" };
  const originalImage = await loadImageElement(originalData);
  const canvas = document.createElement("canvas");
  canvas.width = originalImage.naturalWidth || originalImage.width;
  canvas.height = originalImage.naturalHeight || originalImage.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
  return {
    imageData: canvas.toDataURL("image/png"),
    maskData: maskCanvas.toDataURL("image/png")
  };
}

function canvasHasMarks(canvas) {
  if (!canvas?.width || !canvas.height) return false;
  const ctx = canvas.getContext("2d");
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] > 0) return true;
  }
  return false;
}

async function submitImageEdit(event) {
  event.preventDefault();
  if (!state.user) {
    openAuthModal("login");
    return;
  }
  if (!state.settings?.hasApiKey) {
    showToast(state.lang === "zh" ? "Please configure in admin first OpenAI API Key" : "Configure the OpenAI API key first", "ri-key-2-line");
    return;
  }
  const prompt = elements.editorPromptInput.value.trim();
  if (!state.editor.imageUrl) {
    showToast(state.lang === "zh" ? "Please upload or select an image first" : "Choose an image first", "ri-image-add-line");
    return;
  }
  if (prompt.length < 3) {
    showToast(state.lang === "zh" ? "Please enter edit description" : "Enter an edit prompt", "ri-edit-line");
    return;
  }

  const button = $("button[type='submit']", elements.editorPromptForm);
  button.disabled = true;
  state.editor.prompt = prompt;
  try {
    const originalData = state.editor.imageData || await imageReferenceForEdit(state.editor.imageUrl);
    const { imageData, maskData } = await editorAnnotatedImageData(originalData);
    const data = await api("/api/images/edit", {
      method: "POST",
      body: JSON.stringify({
        prompt: maskData
          ? `${prompt}。Only modify the area covered by purple boxes or brushes，keep other areas unchanged，Do not retain purple marks in final result。`
          : prompt,
        imageData,
        maskData,
        isPublic: elements.editorPublicInput.checked
      })
    });
    const generation = data.generations[0];
    state.user.credits = data.credits;
    state.stats.todayGenerated += 1;
    state.history.push({
      id: generation.id,
      prompt: generation.prompt,
      images: [generation.imageUrl],
      status: "done",
      time: generation.createdAt,
      model: generation.model,
      isPublic: Boolean(generation.isPublic)
    });
    setEditorImage(generation.imageUrl);
    if (generation.isPublic) await loadPublicGallery();
    renderAll();
    showToast(state.lang === "zh" ? "Правки завершены" : "Edit created", "ri-magic-line");
  } catch (error) {
    if (/credit|баланс|лимит|очки|Not enough/i.test(error.message)) openCreditsModal();
    else showToast(error.message, "ri-error-warning-line");
  } finally {
    button.disabled = false;
  }
}

function getPromptSource() {
  return state.promptItems.length ? state.promptItems : fallbackPrompts.map((prompt) => ({
    ...prompt,
    title: local(prompt.title),
    prompt: local(prompt.prompt),
    tags: [prompt.tag]
  }));
}

function getTagCounts() {
  const counts = {};
  for (const prompt of getPromptSource()) {
    const promptTags = prompt.tags || [prompt.tag].filter(Boolean);
    for (const tag of promptTags) counts[tag] = (counts[tag] || 0) + 1;
  }
  return counts;
}

async function loadPromptLibrary() {
  state.promptLoading = true;
  if (state.view === "library") renderLibrary();
  try {
    const data = await fetch("/prompts.json?v=" + Date.now()).then((response) => response.json());
    const items = Array.isArray(data) ? data : (data.prompts || []);
    state.promptItems = items.map((prompt) => ({
      ...prompt,
      colors: prompt.colors || tagColor(prompt.tags?.[0] || prompt.tag || "other")
    }));
  } catch (error) {
    showToast(state.lang === "zh" ? "Ошибка загрузки библиотеки промптов, используются примеры" : "Prompt library failed, using fallback", "ri-error-warning-line");
  } finally {
    state.promptLoading = false;
    renderAll();
  }
}

function setupHeroVideo() {
  const video = $(".hero-video-layer video");
  if (!video) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    video.pause();
    video.removeAttribute("autoplay");
    return;
  }
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.addEventListener("pause", () => playHeroVideo());
  video.addEventListener("stalled", restartHeroVideo);
  video.addEventListener("suspend", () => playHeroVideo());
  window.addEventListener("focus", () => playHeroVideo());
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) playHeroVideo();
  });
  if (!heroVideoWatchdog) {
    let lastTime = -1;
    let stillTicks = 0;
    heroVideoWatchdog = window.setInterval(() => {
      const currentVideo = $(".hero-video-layer video");
      if (!currentVideo || elements.homeView.classList.contains("hidden") || document.hidden) return;
      if (currentVideo.paused) {
        playHeroVideo();
        return;
      }
      const currentTime = Number(currentVideo.currentTime || 0);
      if (Math.abs(currentTime - lastTime) < 0.01) {
        stillTicks += 1;
        if (stillTicks >= 2) restartHeroVideo();
      } else {
        stillTicks = 0;
      }
      lastTime = currentTime;
    }, 1400);
  }
  restartHeroVideo();
}

function playHeroVideo() {
  const video = $(".hero-video-layer video");
  if (!video || elements.homeView.classList.contains("hidden")) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  if (video.readyState === 0) video.load();
  video.play().catch(() => null);
}

function restartHeroVideo() {
  const video = $(".hero-video-layer video");
  if (!video || elements.homeView.classList.contains("hidden")) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  try {
    if (video.readyState < 2) video.load();
    video.currentTime = 0.05;
  } catch {
    video.load();
  }
  playHeroVideo();
}

async function loadStats() {
  try {
    const data = await api("/api/stats/today");
    state.stats.todayGenerated = Number(data.todayGenerated ?? data.count ?? state.stats.todayGenerated);
    updateDailyMetric();
  } catch {
    updateDailyMetric();
  }
}

async function loadPublicGallery() {
  try {
    const data = await api("/api/images/public?limit=60");
    state.publicGallery = (data.generations || []).map((generation) => ({
      id: generation.id,
      prompt: generation.prompt,
      images: [generation.imageUrl],
      status: "done",
      time: generation.createdAt,
      model: generation.model,
      isPublic: Boolean(generation.isPublic)
    }));
  } catch {
    state.publicGallery = [];
  }
}

function tagColor(tag) {
  const colors = {
    ui: "linear-gradient(135deg, #38bdf8, #6366f1)",
    photo: "linear-gradient(135deg, #0f766e, #f59e0b)",
    poster: "linear-gradient(135deg, #111827, #2563eb)",
    portrait: "linear-gradient(135deg, #7c3aed, #ec4899)",
    illustration: "linear-gradient(135deg, #8b5cf6, #fbbf24)",
    anime: "linear-gradient(135deg, #f472b6, #a78bfa)",
    product: "linear-gradient(135deg, #0f172a, #64748b)",
    "3d": "linear-gradient(135deg, #f97316, #0f172a)",
    landscape: "linear-gradient(135deg, #22c55e, #38bdf8)",
    character: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
    logo: "linear-gradient(135deg, #111827, #fbbf24)",
    fashion: "linear-gradient(135deg, #db2777, #fb7185)",
    cyberpunk: "linear-gradient(135deg, #0f172a, #a855f7)",
    infographic: "linear-gradient(135deg, #059669, #2563eb)",
    food: "linear-gradient(135deg, #dc2626, #f59e0b)",
    other: "linear-gradient(135deg,#64748b,#cbd5e1)"
  };
  return colors[tag] || "linear-gradient(135deg,#64748b,#cbd5e1)";
}

function tagIcon(tag) {
  const icons = {
    ui: "ri-window-line",
    photo: "ri-camera-lens-line",
    poster: "ri-layout-4-line",
    portrait: "ri-user-smile-line",
    illustration: "ri-brush-line",
    anime: "ri-ghost-smile-line",
    product: "ri-shopping-bag-3-line",
    "3d": "ri-cube-line",
    landscape: "ri-landscape-line",
    character: "ri-user-star-line",
    logo: "ri-copyright-line",
    fashion: "ri-shirt-line",
    cyberpunk: "ri-flashlight-line",
    infographic: "ri-bar-chart-box-line",
    food: "ri-restaurant-line",
    other: "ri-image-line"
  };
  return icons[tag] || "ri-image-line";
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

function openModal(html) {
  elements.modalLayer.innerHTML = html;
  elements.modalLayer.classList.remove("hidden");
  $(".close-modal", elements.modalLayer)?.addEventListener("click", closeModal);
  elements.modalLayer.addEventListener("click", onModalBackdrop);
  applyI18n(elements.modalLayer);
}

function onModalBackdrop(event) {
  if (event.target === elements.modalLayer) closeModal();
}

function closeModal() {
  elements.modalLayer.classList.add("hidden");
  elements.modalLayer.innerHTML = "";
  elements.modalLayer.removeEventListener("click", onModalBackdrop);
}

function openMyWorksModal() {
  if (!state.user) {
    openAuthModal("login");
    return;
  }
  openModal(`
    <section class="modal works-modal">
      <button class="close-modal" type="button"><i class="ri-close-line"></i></button>
      <div class="works-head">
        <div>
          <h2>${text("myWorks")}</h2>
          <p>${state.lang === "zh" ? "View recent generation history，Continue editing or generate again。" : "Review recent generations, edit, or regenerate."}</p>
        </div>
        <button class="ghost-button works-refresh" type="button" data-works-refresh><i class="ri-refresh-line"></i></button>
      </div>
      <div id="worksGrid" class="works-grid"><div class="empty-message">${text("loadingPrompts")}</div></div>
    </section>
  `);
  $("[data-works-refresh]", elements.modalLayer).addEventListener("click", () => loadMyWorks(true));
  loadMyWorks(false);
}

async function loadMyWorks(forceReload = false) {
  const grid = $("#worksGrid", elements.modalLayer);
  if (!grid) return;
  grid.innerHTML = `<div class="empty-message">${text("loadingPrompts")}</div>`;
  if (forceReload) await loadHistory();
  const items = [...state.history]
    .filter((item) => item.status === "done" && item.images?.[0])
    .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
  if (!items.length) {
    grid.innerHTML = `<div class="empty-message">${text("emptyWorks")}</div>`;
    return;
  }
  grid.innerHTML = items.map((item) => `
    <article class="work-card" data-work-id="${escapeHtml(item.id)}">
      <img src="${escapeHtml(item.images[0])}" loading="lazy" decoding="async" alt="${escapeHtml(truncate(item.prompt, 80))}">
      <div class="work-body">
        <p>${escapeHtml(truncate(item.prompt, 92))}</p>
        <span>${escapeHtml(formatDate(item.time))}${item.isPublic ? ` · ${text("publishToSquare")}` : ""}</span>
        <div class="work-actions">
          <a href="${escapeHtml(item.images[0])}" download="${escapeHtml(item.id)}.png"><i class="ri-download-line"></i>${text("download")}</a>
          <button type="button" data-work-retry="${escapeHtml(item.id)}"><i class="ri-refresh-line"></i>${text("retry")}</button>
          <button type="button" data-work-editor="${escapeHtml(item.id)}"><i class="ri-magic-line"></i>${text("openEditor")}</button>
        </div>
      </div>
    </article>
  `).join("");
  $$("[data-work-retry]", grid).forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.history.find((entry) => String(entry.id) === button.dataset.workRetry);
      if (!item) return;
      state.references = Array.isArray(item.references)
        ? item.references.filter(Boolean).map(function(url) { return { url: url }; })
        : [];
      closeModal();
      state.forceHero = true;
      state.draftPrompt = item.prompt;
      setView("home");
      syncComposers();
      $$(".reference-row").forEach(renderReferences);
      setTimeout(() => submitGeneration($(".composer", elements.heroComposerMount)), 80);
    });
  });
  $$("[data-work-editor]", grid).forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.history.find((entry) => String(entry.id) === button.dataset.workEditor);
      if (!item?.images?.[0]) return;
      closeModal();
      openImageEditor(item.images[0], item.prompt);
    });
  });
}

function openComplianceNotice() {
  const storageKey = "imageStudioComplianceNoticeV1";
  if (localStorage.getItem(storageKey) === "seen") return;
  openModal(`
    <section class="modal compliance-modal" role="dialog" aria-modal="true" aria-labelledby="complianceTitle">
      <button class="close-modal compliance-close" type="button" aria-label="${text("close")}"><i class="ri-close-line"></i></button>
      <div class="compliance-icon"><i class="ri-shield-check-line"></i></div>
      <div class="compliance-title">
        <h2 id="complianceTitle"><i class="ri-megaphone-fill"></i>${text("noticeTitle")}</h2>
        <p>${text("noticeSubtitle")}</p>
      </div>
      <div class="notice-card danger">
        <h3><span></span>${text("noticeCore")}</h3>
        <ul>
          <li><strong>Prohibited content is strictly forbidden：</strong>Platform（including“Tavern”and other interactive tools）strictly prohibits vulgar or pornographic content、violence, gore、online scams、politically sensitive topics, and other illegal dialogue。</li>
          <li><strong>Sensitive word filtering：</strong>System content safety audit is enabled，Automatically block inappropriate speech and harmful info。</li>
          <li><strong>Strict action on violations：</strong>For violating accounts，We will take actions depending on severity：<em>Warning → Restrict features → Temporary ban → Permanent account deletion → Reporting to authorities。</em></li>
        </ul>
      </div>
      <div class="notice-card privacy">
        <h3><i class="ri-shield-user-line"></i>${text("noticePrivacy")}</h3>
        <p><strong>Information Security：</strong>We promise！Your information is stored encrypted internally，and is strictly used for system operation, compliance, and security purposes。We will not sell to any individual or third party、provide or disclose your data。</p>
      </div>
      <div class="notice-card together">
        <p><strong>${text("noticeTogether").split("：")[0]}：</strong>${text("noticeTogether").split("：").slice(1).join("：") || text("noticeTogether")}</p>
      </div>
      <div class="compliance-actions">
        <button class="modal-primary" type="button" data-compliance-ack>${text("noticeAck")}</button>
      </div>
    </section>
  `);

  const markSeen = () => {
    localStorage.setItem(storageKey, "seen");
    closeModal();
  };
  $("[data-compliance-ack]", elements.modalLayer).addEventListener("click", markSeen);
  $(".compliance-close", elements.modalLayer).addEventListener("click", () => {
    localStorage.setItem(storageKey, "seen");
  });
}

function openAuthModal(mode = state.authMode) {
  // Registration is disabled — always show login
  const safeMode = "login";
  state.authMode = safeMode;
  openModal(`
    <section class="modal">
      <button class="close-modal" type="button"><i class="ri-close-line"></i></button>
      <div class="modal-title">
        <i class="ri-sparkling-2-fill"></i>
        <h2>${text("loginTitle")}</h2>
        <p><i class="ri-gift-line"></i> ${text("authContinue")}</p>
      </div>
      <form id="authForm" class="modal-form">
        <label>${text("email")}<input id="authEmail" type="email" autocomplete="email" required></label>
        <label>${text("password")}<input id="authPassword" type="password" autocomplete="current-password" required></label>
        <button class="modal-primary" type="submit">${text("submitLogin")}</button>
        <button class="link-button" type="button" data-close-auth>${text("skip")}</button>
      </form>
    </section>
  `);
  $$("[data-auth-mode]", elements.modalLayer).forEach((button) => {
    button.addEventListener("click", () => openAuthModal(button.dataset.authMode));
  });
  $("[data-close-auth]", elements.modalLayer).addEventListener("click", closeModal);
  $("#authForm").addEventListener("submit", submitAuth);
}

async function submitAuth(event) {
  event.preventDefault();
  const submit = event.currentTarget.querySelector("button[type='submit']");
  submit.disabled = true;
  try {
    const payload = {
      email: $("#authEmail").value,
      password: $("#authPassword").value,
      name: $("#authName")?.value || ""
    };
    const data = await api(`/api/auth/${state.authMode}`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    if (data.pendingApproval) {
      showToast(state.lang === "zh" ? "Account created，Waiting for admin approval" : "Account created, waiting for approval", "ri-time-line");
      closeModal();
      return;
    }
    state.user = data.user;
    const me = await api("/api/auth/me");
    state.settings = me.settings;
    state.firstRun = me.firstRun;
    state.checkin = me.checkin || state.checkin;
    await loadHistory();
    closeModal();
    state.forceHero = true;
    renderAll();
    window.scrollTo({ top: 0, behavior: "auto" });
    restartHeroVideo();
  } catch (error) {
    showToast(error.message, "ri-error-warning-line");
  } finally {
    submit.disabled = false;
  }
}

async function logout() {
  await api("/api/auth/logout", { method: "POST" }).catch(() => null);
  state.user = null;
  state.history = [];
  state.checkin = { checkedInToday: false, credit: state.settings?.checkinCredit || 1 };
  state.forceHero = true;
  renderAll();
  window.scrollTo({ top: 0, behavior: "auto" });
  restartHeroVideo();
}

function openCreditsModal() {
  if (!state.user) {
    openAuthModal("login");
    return;
  }
  const credits = state.user?.credits ?? 0;
  const checkedIn = Boolean(state.checkin?.checkedInToday);
  const checkinCredit = Number(state.checkin?.credit || state.settings?.checkinCredit || 1);
  const generationCost = Number(state.settings?.generationCreditCost ?? 1);
  openModal(`
    <section class="modal">
      <button class="close-modal" type="button"><i class="ri-close-line"></i></button>
      <div class="modal-title">
        <i class="ri-sparkling-2-fill"></i>
        <h2>${text("creditsTitle")}</h2>
        <p>${text("creditsBalance")}: <strong>${credits}</strong> · ${text("oneCredit")}: <strong>${generationCost}</strong></p>
      </div>
      <div class="checkin-card">
        <i class="ri-calendar-check-line"></i>
        <strong>+${checkinCredit}</strong>
        <span>${text("checkinReward")}</span>
      </div>
      <button class="modal-primary" type="button" data-checkin ${checkedIn ? "disabled" : ""}>
        ${checkedIn ? text("checkedIn") : text("checkinToday")}
      </button>
      <button class="modal-secondary" type="button" data-close-auth>${text("close")}</button>
    </section>
  `);
  $("[data-checkin]", elements.modalLayer).addEventListener("click", submitCheckin);
  $("[data-close-auth]", elements.modalLayer).addEventListener("click", closeModal);
}

async function submitCheckin(event) {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    const data = await api("/api/checkin", { method: "POST" });
    state.user = data.user || { ...state.user, credits: data.credits };
    state.checkin = data.checkin || { checkedInToday: true, credit: state.checkin?.credit || 1 };
    showToast(data.checkedIn
      ? (state.lang === "zh" ? `Check-in successful，Earned ${data.awarded} Credits` : `Checked in, +${data.awarded} credit`)
      : text("checkedIn"), "ri-calendar-check-line");
    updateNav();
    openCreditsModal();
  } catch (error) {
    showToast(error.message, "ri-error-warning-line");
    button.disabled = false;
  }
}

function openContactModal() {
  openModal(`
    <section class="modal">
      <button class="close-modal" type="button"><i class="ri-close-line"></i></button>
      <div class="modal-title">
        <i class="ri-customer-service-2-line" style="color:#1677ff"></i>
        <h2>${text("contactTitle")}</h2>
        <p>${text("contactDesc")}</p>
      </div>
      <div class="contact-card">
        <img src="/wx.jpg" alt="${escapeHtml(text("contactTitle"))}" class="contact-qr">
      </div>
      <button class="modal-secondary" type="button" data-close-auth>${text("close")}</button>
    </section>
  `);
  $("[data-close-auth]", elements.modalLayer).addEventListener("click", closeModal);
}

async function openAdminModal() {
  if (state.user?.role !== "admin") return;
  openModal(`
    <section class="modal admin-modal">
      <button class="close-modal" type="button"><i class="ri-close-line"></i></button>
      <div class="modal-title">
        <i class="ri-settings-3-line"></i>
        <h2>${text("adminTitle")}</h2>
      </div>
      <div class="admin-grid">
        <div class="admin-card">
          <h3>${text("settings")}</h3>
          <form id="settingsForm" class="admin-form">
        <label>${text("apiKey")}<input id="apiKeyInput" type="password" placeholder="Your API key"></label>
        <label>${text("apiBaseUrl")}<input id="apiBaseUrlInput" placeholder="AI API base URL"></label>
            <label>${text("model")}<input id="modelInput" placeholder="Imagens"></label>
            <label>${text("defaultCredits")}<input id="defaultCreditsInput" type="number" min="0"></label>
            <label>${text("generationCost")}<input id="generationCreditCostInput" type="number" min="0"></label>
            <label>${text("maxImages")}<input id="maxImagesInput" type="number" min="1" max="4"></label>
            <label class="admin-switch"><input id="allowRegistrationInput" type="checkbox">${text("allowRegistration")}</label>
            <label class="admin-switch"><input id="requireApprovalInput" type="checkbox">${text("requireApproval")}</label>
            <button class="modal-primary" type="submit">${text("save")}</button>
            <button id="clearApiKeyBtn" class="modal-secondary" type="button">${text("clearKey")}</button>
            <p id="apiKeyMask" style="color:#8b94a1;font-size:12px;margin:0"></p>
          </form>
        </div>
        <div class="admin-card">
          <h3>${text("users")}</h3>
          <div class="users-table-wrap">
            <table class="users-table">
              <thead>
                <tr>
                  <th>${text("user")}</th>
                  <th>${text("role")}</th>
                  <th>${text("status")}</th>
                  <th>${text("credits")}</th>
                  <th>+/-</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="usersBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  `);
  await loadAdminSettings();
  await loadUsers();
}

async function loadAdminSettings() {
  const settings = await api("/api/admin/settings");
  state.settings = settings;
  $("#apiBaseUrlInput").value = settings.apiBaseUrl || "";
  $("#modelInput").value = settings.model || "Imagens";
  $("#defaultCreditsInput").value = settings.defaultCredits ?? 10;
  $("#generationCreditCostInput").value = settings.generationCreditCost ?? 1;
  $("#maxImagesInput").value = settings.maxImagesPerRequest ?? 1;
  $("#allowRegistrationInput").checked = Boolean(settings.allowRegistration);
  $("#requireApprovalInput").checked = Boolean(settings.requireApproval);
  $("#apiKeyMask").textContent = settings.apiKeyMask
    ? `${text("currentKey")}: ${settings.apiKeyMask}`
    : text("noKey");
  $("#settingsForm").addEventListener("submit", saveSettings);
  $("#clearApiKeyBtn").addEventListener("click", clearApiKey);
}

async function saveSettings(event) {
  event.preventDefault();
  const settings = await api("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify({
      openaiApiKey: $("#apiKeyInput").value.trim(),
      apiBaseUrl: $("#apiBaseUrlInput").value.trim(),
      model: $("#modelInput").value.trim(),
      defaultCredits: Number($("#defaultCreditsInput").value || 0),
      generationCreditCost: Number($("#generationCreditCostInput").value || 0),
      maxImagesPerRequest: Number($("#maxImagesInput").value || 1),
      allowRegistration: $("#allowRegistrationInput").checked,
      requireApproval: $("#requireApprovalInput").checked
    })
  });
  state.settings = settings;
  $("#apiKeyInput").value = "";
  $("#apiKeyMask").textContent = settings.apiKeyMask
    ? `${text("currentKey")}: ${settings.apiKeyMask}`
    : text("noKey");
  showToast(state.lang === "zh" ? "Saved" : "Saved", "ri-checkbox-circle-line");
  updateNav();
  syncComposers();
}

async function clearApiKey() {
  const settings = await api("/api/admin/settings", {
    method: "PATCH",
    body: JSON.stringify({ clearApiKey: true })
  });
  state.settings = settings;
  $("#apiKeyMask").textContent = text("noKey");
  showToast(state.lang === "zh" ? "Cleared" : "Cleared", "ri-delete-bin-line");
  updateNav();
  syncComposers();
}

async function loadUsers() {
  const data = await api("/api/admin/users");
  const body = $("#usersBody");
  body.innerHTML = data.users.map((user) => `
    <tr data-user-id="${user.id}">
      <td class="user-cell"><strong>${escapeHtml(user.name || user.email)}</strong><span>${escapeHtml(user.email)}</span></td>
      <td>
        <select class="role-input" ${user.id === state.user.id ? "disabled" : ""}>
          <option value="user" ${user.role === "user" ? "selected" : ""}>${text("user")}</option>
          <option value="admin" ${user.role === "admin" ? "selected" : ""}>${text("adminRole")}</option>
        </select>
      </td>
      <td>
        <select class="status-input" ${user.id === state.user.id ? "disabled" : ""}>
          <option value="active" ${user.status === "active" ? "selected" : ""}>${text("active")}</option>
          <option value="disabled" ${user.status === "disabled" ? "selected" : ""}>${text("disabled")}</option>
        </select>
      </td>
      <td><input class="credits-input" type="number" min="0" value="${Number(user.credits || 0)}"></td>
      <td><input class="credit-delta-input" type="number" step="1" value="0"></td>
      <td><button class="tiny-button save-user" type="button"><i class="ri-save-line"></i>${text("save")}</button></td>
    </tr>
  `).join("");
  $$(".save-user", body).forEach((button) => {
    button.addEventListener("click", () => saveUser(button.closest("tr")));
  });
}

async function saveUser(row) {
  const id = row.dataset.userId;
  const user = await api(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      role: $(".role-input", row).value,
      status: $(".status-input", row).value,
      credits: Number($(".credits-input", row).value || 0),
      creditDelta: Number($(".credit-delta-input", row).value || 0)
    })
  });
  if (id === state.user.id) state.user = user.user;
  showToast(state.lang === "zh" ? "UserSaved" : "User saved", "ri-save-line");
  updateNav();
}

async function bootstrap() {
  renderComposers();
  try {
    const data = await api("/api/auth/me");
    state.user = data.user;
    state.settings = data.settings;
    state.firstRun = data.firstRun;
    state.checkin = data.checkin || state.checkin;
    await loadHistory();
    await loadStats();
    await loadPublicGallery();
  } catch (error) {
    showToast(error.message, "ri-error-warning-line");
  }
  state.forceHero = true;
  renderAll();
  setupHeroVideo();
  if (state.view === "home") {
    setTimeout(openComplianceNotice, 260);
  }
}

function bindGlobalEvents() {
  elements.brandBtn?.addEventListener("click", () => {
    state.forceHero = true;
    setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
    restartHeroVideo();
  });
  elements.promptLibraryBtn?.addEventListener("click", () => setView("library"));
  elements.imageEditorBtn?.addEventListener("click", () => { if (!state.user) { openAuthModal("login"); return; } openImageEditor(); });
  elements.openLibraryInlineBtn?.addEventListener("click", () => setView("library"));
  elements.contactBtn?.addEventListener("click", openContactModal);
  elements.langBtn?.addEventListener("click", () => {
    state.lang = state.lang === "zh" ? "en" : "zh";
    localStorage.setItem("lang", state.lang);
    renderAll();
  });
  elements.loginBtn?.addEventListener("click", () => openAuthModal("login"));
  elements.logoutBtn?.addEventListener("click", logout);
  elements.creditsBtn?.addEventListener("click", openCreditsModal);
  elements.myWorksBtn?.addEventListener("click", openMyWorksModal);
  elements.adminBtn?.addEventListener("click", () => {
    window.location.href = "/admin";
  });
  elements.librarySearchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    state.librarySearch = elements.librarySearchInput.value;
    state.promptVisible = 20;
    renderLibrary();
  });
  $("[data-editor-home]", elements.editorView)?.addEventListener("click", () => setView("home"));
  $("[data-editor-create]", elements.editorView)?.addEventListener("click", () => {
    state.forceHero = true;
    setView("home");
  });
  $$("[data-editor-tool]", elements.editorView).forEach((button) => {
    button.addEventListener("click", () => {
      state.editor.tool = button.dataset.editorTool;
      renderEditor();
    });
  });
  $("[data-editor-undo]", elements.editorView)?.addEventListener("click", undoEditorMark);
  $$("[data-editor-zoom]", elements.editorView).forEach((button) => {
    button.addEventListener("click", () => zoomEditor(button.dataset.editorZoom));
  });
  elements.editorColorInput?.addEventListener("input", () => {
    state.editor.color = elements.editorColorInput.value;
  });
  elements.editorPromptInput?.addEventListener("input", () => {
    state.editor.prompt = elements.editorPromptInput.value;
  });
  elements.editorUploadInput?.addEventListener("change", (event) => handleEditorUpload(event.target.files?.[0]));
  elements.editorBottomUploadInput?.addEventListener("change", (event) => handleEditorUpload(event.target.files?.[0]));
  elements.editorSourceImage?.addEventListener("load", resetEditorCanvas);
  elements.editorMaskCanvas?.addEventListener("pointerdown", editorPointerDown);
  elements.editorMaskCanvas?.addEventListener("pointermove", editorPointerMove);
  window.addEventListener("pointerup", editorPointerUp);
  elements.editorPromptForm?.addEventListener("submit", submitImageEdit);
}


// Batch display patch
var _sg = submitGeneration;
if (_sg) {
  submitGeneration = async function(f) {
    await _sg(f);
    try {
      if (typeof loadHistory === "function") await loadHistory();
      if (typeof renderHistory === "function") renderHistory();
    } catch(e) {}
  };
}
// Suppress "Cannot read" errors
var _st = showToast;
if (_st) {
  showToast = function(m, i) {
    if (m && typeof m === "string" && (m.indexOf("Cannot read") >= 0 || m.indexOf("does not support") >= 0 || m.indexOf("no image returned") >= 0 || m.indexOf("quota") >= 0 || m.indexOf("generation failed") >= 0)) return;
    _st(m, i);
  };
}

bindGlobalEvents();
bootstrap();
loadPromptLibrary();
