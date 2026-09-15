// =============================================================
//  ЮБИЛЕЙ 45 · приложение  (config.js загружается отдельным классическим скриптом)
// =============================================================
const CFG = window.CONFIG || {};
const body = document.body;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none)").matches;
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const esc = (s) => String(s ?? "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));

// -------------------------------------------------------------
//  1. ГИДРАЦИЯ КОНТЕНТА ИЗ CONFIG
// -------------------------------------------------------------
function hydrate() {
  $("#hero-date-text").textContent = CFG.eventDateLabel;
  const addr = $("#venue-addr");
  const addrHref = CFG.yandexMapsUrl;
  addr.querySelector("span:first-child").textContent = CFG.addressLines[0];
  addr.querySelector("span:first-child + span").textContent = CFG.addressLines[1];
  addr.setAttribute("href", addrHref);

  $("#venue-name").textContent = CFG.venueName;
  $("#map-route-btn").setAttribute("href", CFG.yandexMapsUrl);
  $("#map-yandex").setAttribute("href", CFG.yandexMapsUrl);
  $("#map-google").setAttribute("href", CFG.googleMapsUrl);

  // Фото
  const img = $("#hero-photo-img");
  const wrap = img.closest(".hero-photo");
  if (CFG.photo) {
    img.src = CFG.photo;
    img.onload = () => wrap.classList.remove("placeholder");
    img.onerror = () => wrap.classList.add("placeholder");
  } else {
    wrap.classList.add("placeholder");
  }
  if (!CFG.stretchCover) wrap.classList.add("placeholder");

  buildTimeline();
  buildOptions();
  buildMap();
}

// -------------------------------------------------------------
//  2. КОНВЕРТ + АНИМАЦИЯ ОТКРЫТИЯ
// -------------------------------------------------------------
const envScreen = $("#envelope-screen");
const envelope = $("#envelope");
const envOpenBtn = $("#env-open-btn");
const page = $("#page");
let openedInSession = false;

function beforeOpen() {
  body.classList.add("loading-lock");
  envScreen.classList.add("is-shown");
  page.setAttribute("aria-hidden", "true");
  document.documentElement.style.overflow = "hidden";
}

function finishOpen() {
  setTimeout(() => {
    document.documentElement.style.overflow = "";
    body.classList.remove("loading-lock");
    page.removeAttribute("aria-hidden");
  }, reducedMotion ? 0 : 200);
}

function openEnvelope() {
  if (openedInSession) return;
  openedInSession = true;
  // пользователь уже кликнул — пробуем тихо включить музыку
  setTimeout(() => music.start(), 150);
  try { localStorage.setItem(CFG.storageKey, "1"); } catch (e) {}

  if (reducedMotion) {
    envScreen.remove();
    finishOpen();
    revealSetup();
    return;
  }

  body.classList.add("opening");
  envOpenBtn.disabled = true;

  // 1) свечение печати
  $(".env-seal", envScreen).classList.add("glow");
  // 2) печать ломается
  setTimeout(() => envelope.classList.add("is-breaking"), 620);
  // 3) открывается клапан + страница начинает подниматься
  setTimeout(() => {
    envelope.classList.add("is-open");
    page.classList.add("page-rise");
    page.removeAttribute("aria-hidden");
    document.documentElement.style.overflow = "";
  }, 1000);
  // 4) экран конверта уходит
  setTimeout(() => {
    envScreen.classList.add("env-screen-leave");
    finishOpen();
    revealSetup();
  }, 1850);
  // уборка из DOM
  setTimeout(() => envScreen.remove(), 2700);
}

function bindEnvelope() {
  const trigger = () => openEnvelope();
  envelope.addEventListener("click", trigger);
  envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); trigger(); }
  });
  envOpenBtn.addEventListener("click", trigger);
}

// -------------------------------------------------------------
//  3. REVEAL ПРИ ПРОКРУТКЕ
// -------------------------------------------------------------
function revealSetup() {
  const targets = $$(".section > .container, .timeline .tl-item");
  targets.forEach((el) => el.classList.add("reveal"));

  if (reducedMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  targets.forEach((el) => io.observe(el));
}

// -------------------------------------------------------------
//  4. TIMELINE + ВАРИАНТЫ
// -------------------------------------------------------------
function buildTimeline() {
  const tl = $("#timeline");
  tl.innerHTML = CFG.schedule.map((s, i) =>
    `<li class="tl-item">
       <div class="tl-time"><span style="display:block">${esc(s.time)}</span>
         <small>${i === 0 ? "начало" : i === CFG.schedule.length - 1 ? "после банкета" : ""}</small></div>
       <div class="tl-label">${esc(s.label)}</div>
     </li>`
  ).join("");
}

function optHTML(o, name) {
  return `
  <label class="opt">
    <input type="radio" name="${name}" value="${esc(o.id)}">
    <span class="opt-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg></span>
    <span class="opt-label">${esc(o.label)}</span>
  </label>`;
}

function bindOpts() {
  $$(".opt input").forEach((input) => {
    input.addEventListener("change", () => {
      const wrapper = input.closest(".opt-group") || input.closest("fieldset");
      const siblings = (wrapper && input.closest(".opt-grid")) || null;
      if (siblings) {
        $$(".opt", siblings).forEach((l) => l.classList.remove("is-selected"));
      }
      const label = input.closest(".opt");
      if (input.checked) label.classList.add("is-selected");
    });
  });
}

function buildOptions() {
  const partyWrap = $("#party-options");
  partyWrap.classList.add("opt-group");
  partyWrap.innerHTML = CFG.partyOptions.map((o) => optHTML(o, "party")).join("");

  const drinkWrap = $("#drink-options");
  drinkWrap.classList.add("opt-group");
  drinkWrap.innerHTML = CFG.drinkOptions.map((o) => optHTML(o, "drink")).join("");

  const foodWrap = $("#food-options");
  foodWrap.classList.add("opt-group");
  foodWrap.innerHTML = CFG.foodOptions.map((o) => optHTML(o, "food")).join("");

  bindOpts();
}

// -------------------------------------------------------------
//  5. КАРТА (OpenStreetMap embed, без ключей)
// -------------------------------------------------------------
function buildMap() {
  const map = $("#map");
  const { lat, lng } = CFG.coords;
  const d = 0.012;
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  map.innerHTML =
    `<iframe
       loading="lazy"
       title="Карта: где пройдёт праздник"
       src="https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat},${lng}"
       allowfullscreen></iframe>`;
}

// -------------------------------------------------------------
//  6. ОБРАТНЫЙ ОТСЧЁТ
// -------------------------------------------------------------
function startCountdown() {
  const target = new Date(CFG.eventDate).getTime();
  const pad = (n) => String(n).padStart(2, "0");
  const title = $("#cd-title");
  const wrap = $(".cd-wrap");
  const party = $("#cd-party-h");

  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      wrap.style.display = "none";
      title.textContent = "Настал этот день!";
      if (!party) {
        const h = document.createElement("p");
        h.id = "cd-party-h"; h.className = "cd-party-h"; h.textContent = "Сегодня праздник! 🎉";
        title.insertAdjacentElement("afterend", h);
      }
      return;
    }
    const d = Math.floor(diff / 86400000);
    const hh = Math.floor(diff / 3600000) % 24;
    const mm = Math.floor(diff / 60000) % 60;
    const ss = Math.floor(diff / 1000) % 60;
    $("#cd-days").textContent = pad(d);
    $("#cd-hours").textContent = pad(hh);
    $("#cd-mins").textContent = pad(mm);
    $("#cd-secs").textContent = pad(ss);
  };
  tick();
  setInterval(tick, 1000);
}

// -------------------------------------------------------------
//  7. НАВИГАЦИЯ + ПЛАВАЮЩАЯ КНОПКА
// -------------------------------------------------------------
const mnav = $("#mnav");
const mnavItems = $$(".mnav-item");
const floating = $("#floating-rsvp");
const dnav = $("#dnav");

const sectionIds = ["invitation", "program", "venue", "rsvp"];

function setupSpy() {
  // активный пункт
  const map = new Map();
  sectionIds.forEach((id) => {
    const sec = document.getElementById(id);
    if (sec) map.set(sec, id);
  });
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = map.get(e.target);
            mnavItems.forEach((b) => b.classList.toggle("is-active", b.dataset.nav === id));
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    map.forEach((_, sec) => spy.observe(sec));
  }
}

function hideFloatingWhenInForm() {
  const rsvp = $("#rsvp");
  if (!rsvp) return;
  setInterval(() => {
    const r = rsvp.getBoundingClientRect();
    const viewH = window.innerHeight;
    const inForm = r.top < viewH * 0.5 && r.bottom > viewH * 0.4;
    floating.classList.toggle("is-hide", inForm);
  }, 250);
}

function setupScrollEffects() {
  const onScroll = () => {
    const past = window.scrollY > window.innerHeight * 0.4;
    floating.classList.toggle("is-hidden", !past);
    dnav.classList.toggle("is-scrolled", window.scrollY > 30);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// дексктопная навигация — плавный скролл (уже задан через CSS, но с учётом offset)
function setupHashLinks() {
  const applyOffset = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 14;
    window.scrollTo({ top: y, behavior: reducedMotion ? "auto" : "smooth" });
  };

  mnavItems.forEach((b) =>
    b.addEventListener("click", () => applyOffset(b.dataset.nav))
  );
  $$(".dnav-links a").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      applyOffset(a.getAttribute("href").slice(1));
    })
  );
  // кнопка на hero-скролл
}

// -------------------------------------------------------------
//  8. ФОРМА
// -------------------------------------------------------------
const form = $("#rsvp-form");
const nameInput = $("#guest-name");
const nameErr = $('[data-error-for="guest-name"]');
const globalErr = $("#form-error-global");

function setErr(input, errEl, msg) {
  if (msg) {
    input.classList.add("is-invalid");
    errEl.textContent = msg;
    errEl.classList.add("show");
  } else {
    input.classList.remove("is-invalid");
    errEl.classList.remove("show");
  }
}

function selectedValue(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : "";
}

function showModal(attending, nameTxt) {
  const modal = $("#success-modal");
  $("#modal-title").textContent = attending ? "Спасибо!" : "Спасибо за отклик";
  $("#modal-text").innerHTML = attending
    ? `Отлично! Всё записали ❤️<br>${esc(nameTxt ? nameTxt + ", " : "")}ждём тебя 17 октября!`
    : "Очень жаль, но спасибо, что предупредил(а) ❤️";
  $(".modal-check", modal).classList.toggle("frown", !attending);
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  modal.setAttribute("aria-modal", "true");
  $("#modal-close").focus();
  const close = () => closeModal(modal);
  $("#modal-close").addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
}
function closeModal(modal) {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function validate() {
  let ok = true;
  const name = nameInput.value.trim();

  if (!name) { setErr(nameInput, nameErr, "Пожалуйста, представьтесь"); ok = false; }
  else setErr(nameInput, nameErr, "");

  if (!selectedValue("party")) {
    globalErr.textContent = "Выберите, придёте ли вы";
    ok = false;
  }

  const attending = isAttending();
  if (attending) {
    const need = [
      ["drink", "Выберите свой напиток"],
      ["food", "Выберите предпочтение в еде"],
    ];
    for (const [name_, msg] of need) {
      if (!selectedValue(name_)) { globalErr.textContent = msg; ok = false; }
    }
  }
  if (ok) globalErr.textContent = "";
  return ok;
}

function isAttending() {
  const v = selectedValue("party");
  const opt = CFG.partyOptions.find((o) => o.id === v);
  return !!opt && opt.fun;
}

async function handleSubmit(e) {
  e.preventDefault();
  nameInput.value = nameInput.value.trim();
  if (!validate()) return;

  const btn = $("#rsvp-submit");
  const original = btn.textContent;
  btn.disabled = true;
  btn.innerHTML = "Отправляем…";
  const data = {
    name: nameInput.value,
    party: selectedValue("party"),
    partyFun: isAttending(),
    drink: selectedValue("drink"),
    food: selectedValue("food"),
  };

  try {
    await CFG.submitHandler(data);
    btn.disabled = false;
    btn.textContent = original;
    showModal(isAttending(), nameInput.value);
  } catch (err) {
    console.error(err);
    btn.disabled = false;
    btn.textContent = original;
    globalErr.textContent = "Не удалось отправить. Попробуйте ещё раз.";
  }
}

// -------------------------------------------------------------
//  9. ЗОЛОТОЕ КОНФЕТТИ В ФИНАЛЕ
// -------------------------------------------------------------
function setupConfetti() {
  const closing = $("#closing");
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  closing.appendChild(layer);

  const spawn = () => {
    if (reducedMotion) return;
    const rect = closing.getBoundingClientRect();
    const w = rect.width;
    const colors = ["#d8bc85", "#c19a52", "#a37f3d", "#ecd9ae"];
    for (let i = 0; i < 26; i++) {
      const p = document.createElement("span");
      p.className = "confetti-party";
      const size = 4 + Math.random() * 6;
      p.style.left = Math.random() * w + "px";
      p.style.width = size + "px";
      p.style.height = size * (0.5 + Math.random()) + "px";
      p.style.background = colors[i % colors.length];
      p.style.animationTimingFunction = "cubic-bezier(.2,.6,.4,1)";
      const dur = 2.4 + Math.random() * 2.4;
      p.animate(
        [
          { transform: "translateY(-8px) rotate(0)", opacity: 0.95 },
          { transform: `translateY(${rect.height + 20}px) rotate(${i % 2 ? 240 : -240}deg)`, opacity: 0 },
        ],
        { duration: dur * 1000, easing: "cubic-bezier(.2,.6,.4,1)", delay: Math.random() * 500 }
      );
      layer.appendChild(p);
      setTimeout(() => p.remove(), dur * 1000 + 900);
    }
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) { spawn(); io.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    io.observe(closing);
  }
}

// -------------------------------------------------------------
//  9.1 ФОНОВАЯ МУЗЫКА (YouTube)
// -------------------------------------------------------------
const music = {
  url: CFG.musicUrl,
  audio: null,
  started: false,
  on: false,
  btn: $("#music-btn"),

  load() {
    this.btn?.addEventListener("click", () => this.toggle());
    if (!this.url) { this.btn?.remove(); return; }
    this.audio = new Audio(this.url);
    this.audio.loop = true;
    this.audio.preload = "auto";
    this.audio.addEventListener("canplaythrough", () => this.btn?.classList.add("is-ready"));
    this.audio.addEventListener("ended", () => { this.on = false; this.sync(); });
  },

  start() {
    if (!this.audio || this.started) return;
    this.started = true;
    this.toggle();
  },

  toggle() {
    if (!this.audio) return;
    if (this.audio.paused) {
      const p = this.audio.play();
      if (p && p.catch) p.catch(() => { this.on = false; this.sync(); });
      this.on = true;
    } else {
      this.audio.pause();
      this.on = false;
    }
    this.sync();
  },

  sync() {
    this.btn?.classList.toggle("is-on", this.on);
    this.btn?.setAttribute("aria-pressed", String(this.on));
  },
};

// -------------------------------------------------------------
//  STARТ
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  hydrate();
  bindEnvelope();
  music.load();
  startup();
});

const startup = () => {
  // если уже открыто — показываем сразу, без конверта
  let already = false;
  try { already = localStorage.getItem(CFG.storageKey) === "1"; } catch (e) {}

  if (already) {
    envScreen.remove();
    page.removeAttribute("aria-hidden");
    revealSetup();
  } else {
    beforeOpen();
  }

  startCountdown();
  setupSpy();
  hideFloatingWhenInForm();
  setupScrollEffects();
  setupHashLinks();
  setupConfetti();
  form.addEventListener("submit", handleSubmit);
  nameInput.addEventListener("input", () => setErr(nameInput, nameErr, ""));
};