import gsap from 'gsap';
import { ALBUMS } from './songsData';

type SongsPlayerTargets = {
  rootEl: HTMLElement;
  listEl: HTMLElement;
  trackEl: HTMLElement;
  lyricsLayer: HTMLElement;
  indexLabel: HTMLElement;
  hint?: HTMLElement | null;
};

const N = ALBUMS.length;
const VISIBLE = 5;
const CENTER = Math.floor(VISIBLE / 2);
/** 滚轮灵敏度：越小越慢 */
const SCROLL_FACTOR = 0.32;

function pad(num: number) {
  return String(num).padStart(2, '0');
}

function mod(i: number) {
  return ((i % N) + N) % N;
}

function getLineHeight(root: HTMLElement) {
  return (
    parseFloat(getComputedStyle(root).getPropertyValue('--line-h')) || 56
  );
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

function mixHex(hexA: string, hexB: string, t: number) {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return `rgb(${r}, ${g}, ${b})`;
}

function randomInRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function initSongsPlayer(targets: SongsPlayerTargets): () => void {
  const { rootEl, listEl, trackEl, lyricsLayer, indexLabel, hint } = targets;

  const lineH = () => getLineHeight(rootEl);

  let virtualIndex = 0;
  let currentLyricEl: HTMLElement | null = null;
  let lastLyricIndex = -1;
  let touchY = 0;

  const slotEls: HTMLElement[] = [];

  function buildSlots() {
    trackEl.innerHTML = '';
    slotEls.length = 0;

    for (let s = 0; s < VISIBLE; s += 1) {
      const item = document.createElement('p');
      item.className = 'songs-list__item';
      item.setAttribute('role', 'listitem');

      const label = document.createElement('span');
      label.className = 'songs-list__label';
      item.appendChild(label);

      trackEl.appendChild(item);
      slotEls.push(item);
    }
  }

  function logicalIndex() {
    return mod(Math.round(virtualIndex));
  }

  function updateCounter() {
    const idx = logicalIndex();
    indexLabel.textContent = `${pad(idx + 1)} / ${pad(N)}`;
  }

  function placeLyricBlock(index: number) {
    if (index === lastLyricIndex && currentLyricEl) return;
    lastLyricIndex = index;

    if (currentLyricEl) {
      currentLyricEl.classList.add('is-exit');
      const old = currentLyricEl;
      setTimeout(() => {
        old.remove();
      }, 450);
      currentLyricEl = null;
    }

    const album = ALBUMS[index];
    const block = document.createElement('div');
    block.className = 'lyric-block';

    const date = document.createElement('p');
    date.className = 'lyric-block__date';
    date.textContent = album.releaseDate;

    const tags = document.createElement('p');
    tags.className = 'lyric-block__tags';
    tags.textContent = `${album.albumType} · ${album.market}专`;

    block.appendChild(date);
    block.appendChild(tags);

    if (album.lines?.length) {
      const line = album.lines[Math.floor(Math.random() * album.lines.length)];

      const ko = document.createElement('p');
      ko.className = 'lyric-block__ko';
      ko.textContent = line.ko;

      const zh = document.createElement('p');
      zh.className = 'lyric-block__zh';
      zh.textContent = line.zh;

      block.appendChild(ko);
      block.appendChild(zh);

      if (line.cheer) {
        const cheer = document.createElement('p');
        cheer.className = 'lyric-block__cheer';
        cheer.textContent = `喊 · ${line.cheer}`;
        block.appendChild(cheer);
      }
    }

    lyricsLayer.appendChild(block);

    const padX = 24;
    const padTop = 72;
    const padBot = 48;
    const w = block.offsetWidth || 260;
    const h = block.offsetHeight || 120;

    block.style.left = `${randomInRange(padX, Math.max(padX, window.innerWidth - w - padX))}px`;
    block.style.top = `${randomInRange(padTop, Math.max(padTop, window.innerHeight - h - padBot))}px`;
    block.style.setProperty('--rot', `${randomInRange(-3, 3).toFixed(1)}deg`);

    currentLyricEl = block;
    lyricsLayer.setAttribute('aria-hidden', 'false');
  }

  function applyFrame(vi: number) {
    virtualIndex = vi;
    const base = Math.floor(virtualIndex);
    const frac = virtualIndex - base;
    const focal = CENTER + frac;
    const h = lineH();

    slotEls.forEach((el, s) => {
      const label = el.querySelector<HTMLElement>('.songs-list__label');
      if (!label) return;

      const albumIdx = mod(base + s - CENTER);
      label.textContent = ALBUMS[albumIdx].name;

      const dist = Math.abs(s - focal);
      const focus = clamp01(1 - dist);
      const scale = lerp(0.92, 1, focus);

      el.style.transform = `scale(${scale})`;
      label.style.background = mixHex('#efefef', '#dcff60', focus);
      label.style.fontWeight = focus > 0.55 ? '700' : '400';
      label.classList.toggle('is-active', focus > 0.92);
    });

    gsap.set(trackEl, { y: -frac * h });
    updateCounter();
    placeLyricBlock(logicalIndex());
  }

  function shiftBy(delta: number) {
    if (Math.abs(delta) < 0.0001) return;
    applyFrame(virtualIndex + delta);
    if (Math.abs(virtualIndex) > 0.05) {
      hint?.classList.add('is-hidden');
    }
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    e.stopPropagation();
    const step = (e.deltaY / lineH()) * SCROLL_FACTOR;
    if (Math.abs(step) < 0.0001) return;
    shiftBy(step);
  }

  function onTouchStart(e: TouchEvent) {
    touchY = e.touches[0].clientY;
  }

  function onTouchMove(e: TouchEvent) {
    e.preventDefault();
    const y = e.touches[0].clientY;
    const dy = touchY - y;
    touchY = y;
    if (Math.abs(dy) < 0.5) return;
    shiftBy((dy / lineH()) * SCROLL_FACTOR);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      shiftBy(1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      shiftBy(-1);
    }
  }

  function onResize() {
    applyFrame(virtualIndex);
  }

  buildSlots();
  applyFrame(0);

  listEl.addEventListener('wheel', onWheel, { passive: false });
  listEl.addEventListener('touchstart', onTouchStart, { passive: true });
  listEl.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onResize);

  return () => {
    listEl.removeEventListener('wheel', onWheel);
    listEl.removeEventListener('touchstart', onTouchStart);
    listEl.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', onResize);
    trackEl.innerHTML = '';
    currentLyricEl?.remove();
    lyricsLayer.innerHTML = '';
  };
}
