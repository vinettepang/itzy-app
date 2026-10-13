import { tfibAsset } from './assets';

type UnitValue = { value: number; unit: string };

type TransformFrame = {
  scale?: { x?: UnitValue; y?: UnitValue };
  offset?: { x?: UnitValue; y?: UnitValue };
  opacity?: UnitValue;
  rotation?: { z?: UnitValue };
  skew?: { x?: UnitValue; y?: UnitValue };
};

type ScrollAnim = {
  trigger?: string;
  rangeStart?: { mode?: string; value?: UnitValue };
  rangeEnd?: { mode?: string; value?: UnitValue };
  transforms?: TransformFrame[];
};

type BlockAnimJson = {
  componentId: string;
  animations?: ScrollAnim[];
};

const listeners: Array<() => void> = [];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function toNumber(v: UnitValue | undefined, fallback = 0): number {
  if (!v) return fallback;
  return v.value;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function interpolateUnit(a: UnitValue | undefined, b: UnitValue | undefined, t: number): string {
  const unit = b?.unit ?? a?.unit ?? 'px';
  const va = toNumber(a, 0);
  const vb = toNumber(b, unit === '%' ? va : 0);
  const v = lerp(va, vb, t);
  return unit === '%' ? `${v}%` : `${v}px`;
}

function interpolateFrame(a: TransformFrame, b: TransformFrame, t: number) {
  const sx = lerp(toNumber(a.scale?.x, 100), toNumber(b.scale?.x, 100), t) / 100;
  const sy = lerp(toNumber(a.scale?.y, 100), toNumber(b.scale?.y, 100), t) / 100;
  const op = lerp(toNumber(a.opacity, 100), toNumber(b.opacity, 100), t) / 100;
  const rz = lerp(toNumber(a.rotation?.z, 0), toNumber(b.rotation?.z, 0), t);
  const skx = lerp(toNumber(a.skew?.x, 0), toNumber(b.skew?.x, 0), t);
  const sky = lerp(toNumber(a.skew?.y, 0), toNumber(b.skew?.y, 0), t);
  const ox = interpolateUnit(a.offset?.x, b.offset?.x, t);
  const oy = interpolateUnit(a.offset?.y, b.offset?.y, t);
  return { sx, sy, op, rz, skx, sky, ox, oy };
}

/** 与 Squarespace scroll cover 接近：元素从进入视口到离开视口的进度 0→1 */
function scrollProgress(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const span = rect.height + vh;
  if (span <= 1) return 0;
  return clamp((vh - rect.top) / span, 0, 1);
}

/** Fluid Engine 区块用 --block-transform + transform: var(--block-transform) */
function applyMotion(el: HTMLElement, motion: ReturnType<typeof interpolateFrame>) {
  const { sx, sy, op, rz, skx, sky, ox, oy } = motion;
  const tf = `translate3d(${ox}, ${oy}, 0) rotateZ(${rz}deg) scaleX(${sx}) scaleY(${sy}) skewX(${skx}deg) skewY(${sky}deg)`;

  el.dataset.tfibMotion = '1';
  el.style.setProperty('--block-transform', tf);
  el.style.setProperty('--m-scale-x', String(sx));
  el.style.setProperty('--m-scale-y', String(sy));
  el.style.setProperty('--m-opacity', String(op));
  el.style.setProperty('--opacity', `${op * 100}%`);
  el.style.opacity = String(op);
  el.style.transformOrigin = '50% 50%';
}

type Driver = { el: HTMLElement; anims: ScrollAnim[] };

function collectDrivers(root: ParentNode): Driver[] {
  const drivers: Driver[] = [];
  root.querySelectorAll('script[type="application/json"][data-block-animations]').forEach((node) => {
    const script = node as HTMLScriptElement;
    const id = script.getAttribute('data-block-animations');
    if (!id) return;
    let data: BlockAnimJson;
    try {
      data = JSON.parse(script.textContent || '');
    } catch {
      return;
    }
    const scrollAnims = (data.animations ?? []).filter(
      (a) => a.trigger === 'scroll' && (a.transforms?.length ?? 0) >= 2,
    );
    if (!scrollAnims.length) return;

    const el = root.querySelector(`.fe-block-${data.componentId ?? id}`) as HTMLElement | null;
    if (!el) return;
    drivers.push({ el, anims: scrollAnims });
  });
  return drivers;
}

function composeMotion(el: HTMLElement, anims: ScrollAnim[]): ReturnType<typeof interpolateFrame> {
  const progress = scrollProgress(el);
  const [from, to] = anims[0].transforms as [TransformFrame, TransformFrame];
  let motion = interpolateFrame(from, to, progress);

  for (let i = 1; i < anims.length; i++) {
    const [a, b] = anims[i].transforms as [TransformFrame, TransformFrame];
    const endMode = anims[i].rangeEnd?.mode ?? '';
    const t = endMode.includes('exit') ? clamp((progress - 0.55) / 0.45, 0, 1) : progress;
    if (t <= 0.0001) continue;
    motion = interpolateFrame(a, b, t);
  }

  return motion;
}

function runBlockMotion(root: ParentNode) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const drivers = collectDrivers(root);
  if (!drivers.length) return;

  let raf = 0;
  let running = true;

  const tick = () => {
    for (const { el, anims } of drivers) {
      applyMotion(el, composeMotion(el, anims));
    }
    if (running) raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  listeners.push(() => {
    running = false;
    if (raf) cancelAnimationFrame(raf);
  });
}

async function tryOfficialRuntime(): Promise<boolean> {
  const w = window as Window & { __sqsAnimationRuntime?: { replay?: () => Promise<void> } };
  if (w.__sqsAnimationRuntime?.replay) {
    await w.__sqsAnimationRuntime.replay().catch(() => {});
    return true;
  }

  const base = tfibAsset('assets/universal/scripts-compressed/');
  const chunks = [
    'init-animation-triggers-fcab0fd32525a1db-min.en-US.js',
    'trigger-animation-runtime-8f1de5727cfeee2c-min.en-US.js',
  ];

  for (const file of chunks) {
    const src = `${base}${file}`;
    const key = `tfib-js:${src}`;
    if (document.querySelector(`script[data-tfib="${key}"]`)) continue;
    await new Promise<void>((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.dataset.tfib = key;
      el.onload = () => resolve();
      el.onerror = () => reject(new Error(src));
      document.head.appendChild(el);
    });
  }

  document.body.classList.add('seven-one-global-animations');
  if (w.__sqsAnimationRuntime?.replay) {
    await w.__sqsAnimationRuntime.replay().catch(() => {});
    return true;
  }
  return false;
}

/** Play As Practice 圆形滚动放大等 Fluid Engine 区块动效 */
export async function tfibInitBlockAnimations(root: ParentNode): Promise<void> {
  await tryOfficialRuntime().catch(() => {});
  runBlockMotion(root);
}

export function tfibTeardownBlockAnimations() {
  while (listeners.length) listeners.pop()?.();
  document.querySelectorAll('[data-tfib-motion]').forEach((el) => {
    const node = el as HTMLElement;
    delete node.dataset.tfibMotion;
    node.style.removeProperty('--block-transform');
    node.style.removeProperty('--m-scale-x');
    node.style.removeProperty('--m-scale-y');
    node.style.removeProperty('--m-opacity');
    node.style.removeProperty('--opacity');
    node.style.removeProperty('opacity');
    node.style.removeProperty('transform-origin');
  });
}
