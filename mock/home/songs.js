(function () {
  "use strict";

  /** @type {{ title: string; lines: { ko: string; zh: string; cheer?: string }[] }[]} */
  const SONGS = [
    {
      title: "DALLA DALLA",
      lines: [
        { ko: "난 달라 달라", zh: "我与众不同", cheer: "MIDZY!" },
        { ko: "I love myself", zh: "我爱我自己" },
      ],
    },
    {
      title: "ICY",
      lines: [
        { ko: "Sorry, I'm not sorry", zh: "抱歉，但我不感到抱歉" },
        { ko: "눈치는 난 보지 않아", zh: "我不看眼色" },
      ],
    },
    {
      title: "WANNABE",
      lines: [
        { ko: "I wanna be me, me, me", zh: "我想做自己", cheer: "MIDZY!" },
        { ko: "I don't wanna be somebody", zh: "我不想成为别人" },
      ],
    },
    {
      title: "Not Shy",
      lines: [
        { ko: "Not shy, not me", zh: "不害羞，这就是我", cheer: "Yeji!" },
        { ko: "부끄럽지 않아", zh: "并不害羞" },
      ],
    },
    {
      title: "LOCO",
      lines: [
        { ko: "You got me loco, loco", zh: "你让我疯狂", cheer: "Ryujin!" },
        { ko: "난 네게 미쳤어", zh: "我为你着迷" },
      ],
    },
    {
      title: "Sneakers",
      lines: [
        { ko: "Got my sneakers on", zh: "穿上我的球鞋", cheer: "Lia!" },
        { ko: "Ready, set, go", zh: "预备，开始" },
      ],
    },
    {
      title: "Cheshire",
      lines: [
        { ko: "I'm a cheshire", zh: "我像柴郡猫", cheer: "Chaeryeong!" },
        { ko: "Smile but I'm sharp", zh: "微笑却很锋利" },
      ],
    },
    {
      title: "UNTOUCHABLE",
      lines: [
        { ko: "Nobody can touch me", zh: "没人能触碰我", cheer: "Yuna!" },
        { ko: "I'm untouchable", zh: "我遥不可及" },
      ],
    },
    {
      title: "CAKE",
      lines: [
        { ko: "Cake cake cake", zh: "蛋糕蛋糕蛋糕", cheer: "ITZY!" },
        { ko: "Can't stop me", zh: "无法阻止我" },
      ],
    },
    {
      title: "KILL SHOT",
      lines: [
        { ko: "One shot, kill shot", zh: "一击必杀", cheer: "MIDZY!" },
        { ko: "Game over", zh: "游戏结束" },
      ],
    },
    {
      title: "GOLD",
      lines: [
        { ko: "We're going gold", zh: "我们奔向金色", cheer: "GOLD!" },
        { ko: "Shine like gold", zh: "如金闪耀" },
      ],
    },
    {
      title: "Imaginary Friend",
      lines: [
        { ko: "You're my imaginary friend", zh: "你是我假想的朋友" },
        { ko: "Don't let me go", zh: "别让我离开" },
      ],
    },
  ];

  const N = SONGS.length;
  const VISIBLE = 5;
  const CENTER = Math.floor(VISIBLE / 2);
  const TRANSITION_MS = 950;

  const listEl = document.getElementById("songs-list");
  const lyricsLayer = document.getElementById("lyrics-layer");
  const indexLabel = document.getElementById("song-index");
  const hint = document.getElementById("songs-hint");

  /** Unbounded — grows forever up/down */
  let virtualIndex = 0;
  let isAnimating = false;
  let animTimer = null;
  let currentLyricEl = null;
  let lastLogical = -1;
  let trackEl = null;
  let slotEls = [];

  function pad(num) {
    return String(num).padStart(2, "0");
  }

  function mod(i) {
    return ((i % N) + N) % N;
  }

  function logicalIndex() {
    return mod(virtualIndex);
  }

  function getLineHeight() {
    return (
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--line-h")
      ) || 56
    );
  }

  function buildSlots() {
    trackEl = document.createElement("div");
    trackEl.className = "songs-list__track";
    trackEl.id = "songs-track";

    for (let s = 0; s < VISIBLE; s++) {
      const item = document.createElement("p");
      item.className = "songs-list__item";
      item.role = "listitem";
      trackEl.appendChild(item);
      slotEls.push(item);
    }

    listEl.appendChild(trackEl);
  }

  function fillSlots() {
    slotEls.forEach(function (el, s) {
      const songIdx = mod(virtualIndex + s - CENTER);
      el.textContent = SONGS[songIdx].title;
      applyItemStyles(s);
    });

    indexLabel.textContent = pad(logicalIndex() + 1) + " / " + pad(N);
  }

  /** dir: 0 = settled — active 始终在 CENTER 槽位（垂直居中） */
  function applyItemStyles(slotIndex) {
    const el = slotEls[slotIndex];
    const dist = Math.abs(slotIndex - CENTER);

    el.classList.remove("is-active", "is-near", "is-far", "is-leaving");

    if (dist === 0) {
      el.classList.add("is-active");
    } else if (dist === 1) {
      el.classList.add("is-near");
    } else if (dist === 2) {
      el.classList.add("is-far");
    }
  }

  function setTrackOffset(px) {
    trackEl.style.transform = "translate3d(0, " + px + "px, 0)";
  }

  function snapTrack(instant) {
    if (instant) {
      trackEl.style.transition = "none";
      setTrackOffset(0);
      void trackEl.offsetHeight;
      requestAnimationFrame(function () {
        trackEl.style.transition = "";
      });
    } else {
      setTrackOffset(0);
    }
  }

  function randomInRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function placeLyricBlock() {
    const li = logicalIndex();
    if (li === lastLogical && currentLyricEl) return;
    lastLogical = li;

    if (currentLyricEl) {
      currentLyricEl.classList.add("is-exit");
      const old = currentLyricEl;
      setTimeout(function () {
        old.remove();
      }, 450);
      currentLyricEl = null;
    }

    const song = SONGS[li];
    const line = song.lines[Math.floor(Math.random() * song.lines.length)];

    const block = document.createElement("div");
    block.className = "lyric-block";

    const ko = document.createElement("p");
    ko.className = "lyric-block__ko";
    ko.textContent = line.ko;

    const zh = document.createElement("p");
    zh.className = "lyric-block__zh";
    zh.textContent = line.zh;

    block.appendChild(ko);
    block.appendChild(zh);

    if (line.cheer) {
      const cheer = document.createElement("p");
      cheer.className = "lyric-block__cheer";
      cheer.textContent = "喊 · " + line.cheer;
      block.appendChild(cheer);
    }

    lyricsLayer.appendChild(block);

    const padX = 24;
    const padTop = 72;
    const padBot = 48;
    const w = block.offsetWidth || 260;
    const h = block.offsetHeight || 120;

    block.style.left =
      randomInRange(padX, Math.max(padX, window.innerWidth - w - padX)) + "px";
    block.style.top =
      randomInRange(padTop, Math.max(padTop, window.innerHeight - h - padBot)) +
      "px";
    block.style.setProperty("--rot", randomInRange(-3, 3).toFixed(1) + "deg");

    currentLyricEl = block;
    lyricsLayer.setAttribute("aria-hidden", "false");
  }

  function completeStep(dir) {
    trackEl.style.transition = "none";
    slotEls.forEach(function (el) {
      el.style.transition = "none";
    });

    virtualIndex += dir;
    fillSlots();
    snapTrack(true);

    slotEls.forEach(function (el) {
      el.style.transition = "";
    });

    trackEl.classList.remove("is-sliding");
    isAnimating = false;
    placeLyricBlock();
  }

  function runStep(dir) {
    if (isAnimating) return;

    isAnimating = true;
    const lineH = getLineHeight();
    const targetOffset = -dir * lineH;

    function onTransitionEnd(e) {
      if (e.target !== trackEl || e.propertyName !== "transform") return;
      trackEl.removeEventListener("transitionend", onTransitionEnd);
      clearTimeout(animTimer);
      completeStep(dir);
    }

    trackEl.classList.add("is-sliding");
    trackEl.style.transition = "";
    trackEl.addEventListener("transitionend", onTransitionEnd);
    setTrackOffset(targetOffset);

    if (hint) hint.classList.add("is-hidden");

    clearTimeout(animTimer);
    animTimer = setTimeout(function () {
      trackEl.removeEventListener("transitionend", onTransitionEnd);
      if (isAnimating) completeStep(dir);
    }, TRANSITION_MS + 100);
  }

  function step(dir) {
    runStep(dir);
  }

  function onWheel(e) {
    e.preventDefault();
    if (isAnimating) return;
    if (Math.abs(e.deltaY) < 8) return;
    step(e.deltaY > 0 ? 1 : -1);
  }

  function init() {
    buildSlots();
    fillSlots();
    snapTrack(true);
    placeLyricBlock();

    window.addEventListener("wheel", onWheel, { passive: false });

    let touchY = 0;
    window.addEventListener(
      "touchstart",
      function (e) {
        touchY = e.touches[0].clientY;
      },
      { passive: true }
    );

    window.addEventListener(
      "touchend",
      function (e) {
        if (isAnimating) return;
        const dy = touchY - e.changedTouches[0].clientY;
        if (Math.abs(dy) < 40) return;
        step(dy > 0 ? 1 : -1);
      },
      { passive: true }
    );

    window.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        step(-1);
      }
    });
  }

  init();
})();
