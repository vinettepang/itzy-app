import type { PosterTextSlot } from './layout';
import { POSTER_HEIGHT, POSTER_TEXT_SLOTS, POSTER_WIDTH } from './layout';

function formatDigits(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function fitOneLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  const t = text.trim();
  if (!t) return '';
  if (ctx.measureText(t).width <= maxWidth) return t;
  const ell = '…';
  let s = t;
  while (s.length > 0 && ctx.measureText(s + ell).width > maxWidth) {
    s = s.slice(0, -1);
  }
  return s + ell;
}

function wrapWords(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const t = text.trim();
  if (!t) return [];
  const words = t.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      if (ctx.measureText(w).width <= maxWidth) {
        line = w;
      } else {
        lines.push(fitOneLine(ctx, w, maxWidth));
        line = '';
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}

function buildDisplayText(slot: PosterTextSlot, value: string): string {
  const v = (value || '').trim();
  if (slot.priceFormat === 'krwDigits') {
    const m = v.match(/^\s*([^\d]+?)\s*([\d].*)$/);
    const currency = (m?.[1] ?? '').trimEnd();
    const num = formatDigits(m?.[2] ?? v);
    if (!num) return '';
    return `${slot.prefix ?? ''}${currency}${num}${slot.suffix ?? ''}`;
  }
  return `${slot.prefix ?? ''}${v}${slot.suffix ?? ''}`;
}

function drawSlot(ctx: CanvasRenderingContext2D, slot: PosterTextSlot, value: string) {
  const raw = buildDisplayText(slot, value);
  if (!raw) return;

  const weight = slot.fontWeight === 'bold' ? 'bold' : 'normal';
  ctx.font = `${weight} ${slot.fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = slot.color;
  ctx.textAlign = slot.align;
  ctx.textBaseline = slot.textBaseline ?? 'middle';

  const maxW = slot.maxWidth;
  const lh = slot.lineHeight ?? Math.round(slot.fontSize * 1.25);

  if (raw.includes('\n')) {
    const lines = raw
      .split('\n')
      .map((l) => fitOneLine(ctx, l.trim(), maxW))
      .filter(Boolean);
    lines.forEach((line, i) => {
      ctx.fillText(line, slot.x, slot.y + i * lh);
    });
    return;
  }

  if (slot.wrap) {
    const lines = wrapWords(ctx, raw, maxW)
      .map((l) => fitOneLine(ctx, l, maxW))
      .filter(Boolean);
    lines.forEach((line, i) => {
      ctx.fillText(line, slot.x, slot.y + i * lh);
    });
    return;
  }

  const line = fitOneLine(ctx, raw, maxW);
  if (!line) return;
  ctx.fillText(line, slot.x, slot.y);
}

function drawFallbackBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // 兜底背景尽量接近票面浅色，否则黑字会“看起来像空白”
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#f5f7ff');
  g.addColorStop(1, '#ffffff');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const band = ctx.createLinearGradient(0, 0, w, 0);
  band.addColorStop(0, 'rgba(99,102,241,0.16)');
  band.addColorStop(0.5, 'rgba(124,58,237,0.10)');
  band.addColorStop(1, 'rgba(236,72,153,0.12)');
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, w, Math.round(h * 0.22));
}

export type RenderPosterWebOptions = {
  isAlive?: () => boolean;
};

export const POSTER_CANCELLED = '__poster_cancelled__';

export async function renderPosterToObjectURL(
  canvas: HTMLCanvasElement,
  bgSrc: string,
  values: Record<string, string>,
  options?: RenderPosterWebOptions,
): Promise<string> {
  const isAlive = options?.isAlive ?? (() => true);
  if (!isAlive()) throw new Error(POSTER_CANCELLED);

  const w = POSTER_WIDTH;
  const h = POSTER_HEIGHT;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D 不可用');

  // 先铺白底：避免底图存在透明区域时，导出 PNG 在预览黑底上“看起来像空白”
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  const imgDraw = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    // 同源资源不设置 crossOrigin，避免部分环境下 CORS/taint 导致导出空白
    try {
      const u = new URL(bgSrc, window.location.href);
      if (u.origin !== window.location.origin) img.crossOrigin = 'anonymous';
    } catch {
      /* ignore */
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('底图加载失败'));
    img.src = bgSrc;
  });

  if (!isAlive()) throw new Error(POSTER_CANCELLED);

  try {
    ctx.drawImage(imgDraw, 0, 0, w, h);
  } catch {
    drawFallbackBg(ctx, w, h);
  }

  POSTER_TEXT_SLOTS.forEach((slot) => drawSlot(ctx, slot, values[slot.key] ?? ''));

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!isAlive()) {
          reject(new Error(POSTER_CANCELLED));
          return;
        }
        if (!blob) {
          reject(new Error('导出失败'));
          return;
        }
        resolve(URL.createObjectURL(blob));
      },
      'image/png',
      1,
    );
  });
}
