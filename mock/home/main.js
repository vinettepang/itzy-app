(function () {
  "use strict";

  const LOADER_KEY = "itzy-home-v2";
  const DEMO_MODE_KEY = "itzy-home-mode";

  const loader = document.getElementById("loader");
  const site = document.getElementById("site");
  const cornerDate = document.getElementById("corner-date");
  const cornerTime = document.getElementById("corner-time");
  const menuBtn = document.getElementById("menu-btn");
  const menuPanel = document.getElementById("menu-panel");
  const heroComeback = document.getElementById("hero-comeback");
  const heroShow = document.getElementById("hero-show");
  const demoToggle = document.getElementById("demo-toggle");
  const boardForm = document.getElementById("board-form");
  const toast = document.getElementById("toast");
  const showLocal = document.getElementById("show-local");

  const COMEBACK_AT = new Date("2026-07-15T18:00:00+09:00");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  /* ── Loader ───────────────────────────────────────────── */
  function initLoader() {
    if (sessionStorage.getItem(LOADER_KEY)) {
      loader.classList.add("is-done");
      site.hidden = false;
      return;
    }

    setTimeout(function () {
      loader.classList.add("is-done");
      site.hidden = false;
      sessionStorage.setItem(LOADER_KEY, "1");
    }, 2000);
  }

  /* ── Clock ──────────────────────────────────────────────── */
  function updateClock() {
    const kst = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })
    );

    const dateStr =
      pad(kst.getDate()) +
      "/" +
      pad(kst.getMonth() + 1) +
      "/" +
      String(kst.getFullYear()).slice(-2);

    const timeStr = "KST " + pad(kst.getHours()) + ":" + pad(kst.getMinutes());

    if (cornerDate) cornerDate.textContent = dateStr;
    if (cornerTime) cornerTime.textContent = timeStr;
  }

  function updateLocalShowTime() {
    if (!showLocal) return;
    const showAt = new Date("2026-03-15T18:00:00+09:00");
    showLocal.textContent =
      "Local · " +
      showAt.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });
  }

  /* ── Menu ───────────────────────────────────────────────── */
  function initMenu() {
    menuBtn.addEventListener("click", function () {
      const open = menuPanel.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.textContent = open ? "CLOSE" : "MENU";
      document.body.classList.toggle("menu-open", open);
    });

    menuPanel.querySelectorAll(".menu-panel__link").forEach(function (link) {
      link.addEventListener("click", function () {
        menuPanel.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.textContent = "MENU";
        document.body.classList.remove("menu-open");
      });
    });
  }

  /* ── Hero mode ──────────────────────────────────────────── */
  function isComebackPeriod() {
    const forced = sessionStorage.getItem(DEMO_MODE_KEY);
    if (forced === "comeback") return true;
    if (forced === "show") return false;

    const hash = location.hash.replace("#", "");
    if (hash === "comeback") return true;
    if (hash === "show") return false;

    const now = Date.now();
    const start = new Date("2026-06-01T00:00:00+09:00").getTime();
    return now >= start && now <= COMEBACK_AT.getTime();
  }

  function setHeroMode(comeback) {
    heroComeback.hidden = !comeback;
    heroShow.hidden = comeback;
    document.body.classList.toggle("mode-comeback", comeback);

    if (demoToggle) {
      demoToggle.textContent = comeback ? "MODE: COMEBACK" : "MODE: SHOW";
    }
  }

  function toggleHeroMode() {
    const next = heroComeback.hidden ? "comeback" : "show";
    sessionStorage.setItem(DEMO_MODE_KEY, next);
    setHeroMode(next === "comeback");
  }

  /* ── Countdown ──────────────────────────────────────────── */
  let lastMinute = -1;

  function updateCountdown() {
    const diff = Math.max(0, COMEBACK_AT.getTime() - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const el = (id) => document.getElementById(id);
    if (el("cd-days")) el("cd-days").textContent = pad(d);
    if (el("cd-hours")) el("cd-hours").textContent = pad(h);
    if (el("cd-mins")) el("cd-mins").textContent = pad(m);
    if (el("cd-secs")) el("cd-secs").textContent = pad(s);

    const cd = document.getElementById("countdown");
    if (cd && m !== lastMinute) {
      lastMinute = m;
      cd.setAttribute(
        "aria-label",
        d + " days " + h + " hours " + m + " minutes remaining"
      );
    }
  }

  /* ── Board ──────────────────────────────────────────────── */
  function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    toast.classList.add("is-visible");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("is-visible");
      setTimeout(function () {
        toast.hidden = true;
      }, 350);
    }, 3000);
  }

  function initBoard() {
    boardForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const nick = boardForm.nickname.value.trim();
      const msg = boardForm.message.value.trim();
      if (!nick || !msg) {
        showToast("请填写昵称和留言");
        return;
      }
      boardForm.reset();
      showToast("已提交 · 审核通过后展示");
    });
  }

  /* ── Boot ───────────────────────────────────────────────── */
  initLoader();
  initMenu();
  initBoard();
  updateClock();
  updateLocalShowTime();
  setHeroMode(isComebackPeriod());
  updateCountdown();

  setInterval(updateClock, 60000);
  setInterval(updateCountdown, 1000);

  if (demoToggle) demoToggle.addEventListener("click", toggleHeroMode);

  window.addEventListener("hashchange", function () {
    sessionStorage.removeItem(DEMO_MODE_KEY);
    setHeroMode(isComebackPeriod());
  });
})();
