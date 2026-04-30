import Taro from '@tarojs/taro';
import { normalizeMiniProgramAssetPath } from '@/utils/localAssetPath';
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
    // 允许 value 前带货币符号，如：₩154000 / $154000 / RM 154000
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
    const lines = wrapWords(ctx, raw, maxW).map((l) => fitOneLine(ctx, l, maxW)).filter(Boolean);
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
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#3730a3');
  g.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

type CanvasNode = {
  width: number;
  height: number;
  getContext: (type: '2d') => CanvasRenderingContext2D | null;
  createImage: () => {
    onload: (() => void) | null;
    onerror: (() => void) | null;
    src: string;
  };
};

export type RenderPosterOptions = {
  /** 页面已卸载时返回 false，避免异步回调里访问已销毁子页面帧（微信 __subPageFrameEndTime__ 报错） */
  isAlive?: () => boolean;
};

function nextTicks(n: number): Promise<void> {
  let p = Promise.resolve();
  for (let i = 0; i < n; i++) {
    p = p.then(
      () =>
        new Promise<void>((resolve) => {
          Taro.nextTick(() => resolve());
        }),
    );
  }
  return p;
}

/** 用户离开海报页时取消绘制，避免与业务无关的 toast */
export const POSTER_CANCELLED = '__poster_cancelled__';

export async function renderPosterToTempPath(
  bgSrc: string,
  values: Record<string, string>,
  options?: RenderPosterOptions,
): Promise<string> {
  const isAlive = options?.isAlive ?? (() => true);
  await nextTicks(2);

  return new Promise((resolve, reject) => {
    let settled = false;
    const safeResolve = (path: string) => {
      if (settled) return;
      settled = true;
      resolve(path);
    };
    const safeReject = (err: Error) => {
      if (settled) return;
      settled = true;
      reject(err);
    };

    if (!isAlive()) {
      safeReject(new Error(POSTER_CANCELLED));
      return;
    }

    try {
      Taro.createSelectorQuery()
        .select('#posterCanvas')
        .fields({ node: true, size: true })
        .exec((res: { node: CanvasNode }[]) => {
          try {
            if (!isAlive()) {
              safeReject(new Error(POSTER_CANCELLED));
              return;
            }

            const raw = res?.[0];
            const canvas = raw?.node;
            if (!canvas) {
              safeReject(new Error('Canvas 未就绪'));
              return;
            }

            const w = POSTER_WIDTH;
            const h = POSTER_HEIGHT;
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              safeReject(new Error('Canvas 2D 不可用'));
              return;
            }

            const img = canvas.createImage();
            const drawTextLayer = () => {
              POSTER_TEXT_SLOTS.forEach((slot) => {
                drawSlot(ctx, slot, values[slot.key] ?? '');
              });
            };

            const exportPng = () => {
              if (!isAlive()) {
                safeReject(new Error(POSTER_CANCELLED));
                return;
              }
              drawTextLayer();
              const cw = canvas.width;
              const ch = canvas.height;
              const runExport = () => {
                if (!isAlive()) {
                  safeReject(new Error(POSTER_CANCELLED));
                  return;
                }
                void Taro.canvasToTempFilePath({
                  canvas: canvas as never,
                  x: 0,
                  y: 0,
                  width: cw,
                  height: ch,
                  destWidth: cw,
                  destHeight: ch,
                  fileType: 'png',
                  quality: 1,
                  success: (r) => {
                    if (!isAlive()) {
                      safeReject(new Error(POSTER_CANCELLED));
                      return;
                    }
                    safeResolve(r.tempFilePath);
                  },
                  fail: (e) => {
                    safeReject(e instanceof Error ? e : new Error(String(e)));
                  },
                });
              };
              if (typeof requestAnimationFrame === 'function') {
                requestAnimationFrame(() => runExport());
              } else {
                setTimeout(runExport, 0);
              }
            };

            img.onload = () => {
              try {
                if (!isAlive()) {
                  safeReject(new Error(POSTER_CANCELLED));
                  return;
                }
                try {
                  ctx.drawImage(img as never, 0, 0, w, h);
                } catch {
                  drawFallbackBg(ctx, w, h);
                }
                exportPng();
              } catch (e) {
                safeReject(e instanceof Error ? e : new Error(String(e)));
              }
            };
            img.onerror = () => {
              try {
                if (!isAlive()) {
                  safeReject(new Error(POSTER_CANCELLED));
                  return;
                }
                drawFallbackBg(ctx, w, h);
                exportPng();
              } catch (e) {
                safeReject(e instanceof Error ? e : new Error(String(e)));
              }
            };
            img.src = normalizeMiniProgramAssetPath(bgSrc);
          } catch (e) {
            safeReject(e instanceof Error ? e : new Error(String(e)));
          }
        });
    } catch (e) {
      safeReject(e instanceof Error ? e : new Error(String(e)));
    }
  });
}
