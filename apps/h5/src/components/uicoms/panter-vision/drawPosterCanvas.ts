export type PosterDrawOptions = {
  headlineTop: string;
  headlineBottom: string;
  taglineSolid: string;
  taglineOutline: string;
  metaLeft: string;
  metaCenter: string;
  metaRight: string;
  body: string;
};

const DEFAULT_OPTS: PosterDrawOptions = {
  metaLeft: 'Panter Vision\n@pantervision',
  metaCenter: 'pantervis@gmail.com\n+40 123 456 789',
  metaRight: 'Attempts\n001',
  headlineTop: 'PANTER',
  headlineBottom: 'VISION',
  taglineSolid: 'ANIMATED',
  taglineOutline: 'TEST SURFACE',
  body:
    'Furthermore, the paper examines how AI is transforming key areas of business operations, such as customer service, supply chain management, marketing, and financial analysis.',
};

const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const CONDENSED = '"Arial Narrow", "Helvetica Neue Condensed", "Roboto Condensed", Impact, sans-serif';

function drawMultiline(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  lineHeight: number,
) {
  text.split('\n').forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight));
}

/** 斜体压扁大标题：横向压缩 + 右倾，超出右边缘裁切（与参考海报一致） */
function drawItalicHeadline(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  targetWidth: number,
) {
  ctx.save();
  ctx.font = `700 ${size}px ${CONDENSED}`;
  const natural = ctx.measureText(text).width || 1;
  const scaleX = targetWidth / natural;
  ctx.translate(x, y);
  ctx.transform(scaleX, 0, -0.2, 1, 0, 0);
  ctx.textBaseline = 'top';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function drawSmiley(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.fillStyle = '#fff';
  ctx.lineWidth = Math.max(1.5, r * 0.07);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  const ex = r * 0.3;
  const ey = r * 0.22;
  ctx.beginPath();
  ctx.ellipse(cx - ex, cy - ey, r * 0.07, r * 0.13, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + ex, cy - ey, r * 0.07, r * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.05, r * 0.5, 0.18 * Math.PI, 0.82 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

function wrapJustified(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(/\s+/);
  const lines: string[][] = [];
  let current: string[] = [];
  for (const word of words) {
    const test = [...current, word].join(' ');
    if (ctx.measureText(test).width > maxWidth && current.length) {
      lines.push(current);
      current = [word];
    } else {
      current.push(word);
    }
  }
  if (current.length) lines.push(current);

  lines.forEach((ws, i) => {
    const yy = y + i * lineHeight;
    const isLast = i === lines.length - 1;
    if (isLast || ws.length === 1) {
      ctx.textAlign = 'right';
      ctx.fillText(ws.join(' '), x + maxWidth, yy);
      ctx.textAlign = 'left';
      return;
    }
    const wordsW = ws.reduce((s, w) => s + ctx.measureText(w).width, 0);
    const gap = (maxWidth - wordsW) / (ws.length - 1);
    let xx = x;
    for (const w of ws) {
      ctx.fillText(w, xx, yy);
      xx += ctx.measureText(w).width + gap;
    }
  });
}

/**
 * Panter Vision 风黑白海报（作为 WebGL 场景背后的平面纹理）
 */
/** framed：宽屏居中竖版；fullBleed：海报铺满容器宽度 */
export type PosterCanvasLayout = 'framed' | 'fullBleed';

/** 海报内容区宽高（用于绘制与玻璃字缩放） */
export function getPosterFrameMetrics(
  width: number,
  height: number,
  layout: PosterCanvasLayout = 'framed',
  horizontalInset = 0,
  contentWidthRatio = 0,
): { frameW: number; frameX: number } {
  if (contentWidthRatio > 0) {
    const ratio = Math.min(1, Math.max(0.5, contentWidthRatio));
    const frameW = width * ratio;
    return { frameW, frameX: (width - frameW) / 2 };
  }
  if (horizontalInset > 0) {
    const inset = Math.min(0.45, Math.max(0, horizontalInset));
    const frameW = width * (1 - 2 * inset);
    return { frameW, frameX: width * inset };
  }
  if (layout === 'fullBleed') {
    return { frameW: width, frameX: 0 };
  }
  const frameW = Math.min(width, height * POSTER_ASPECT);
  return { frameW, frameX: (width - frameW) / 2 };
}

export function drawPosterCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  partial?: Partial<PosterDrawOptions>,
  layout: PosterCanvasLayout = 'framed',
  horizontalInset = 0,
  contentWidthRatio = 0,
): void {
  const opts = { ...DEFAULT_OPTS, ...partial };
  const dpr = Math.min(window.devicePixelRatio, 2);
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const { frameW, frameX } = getPosterFrameMetrics(
    width,
    height,
    layout,
    horizontalInset,
    contentWidthRatio,
  );
  ctx.translate(frameX, 0);
  ctx.beginPath();
  ctx.rect(0, 0, frameW, height);
  ctx.clip();
  drawPosterFrame(ctx, frameW, height, opts);
}

/** 海报版面宽高比（宽 / 高），宽屏时居中成竖版 */
export const POSTER_ASPECT = 0.8;

function drawPosterFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opts: PosterDrawOptions,
) {
  const unit = Math.min(width, height * 0.75);
  const pad = Math.max(16, unit * 0.06);
  const contentW = width - pad * 2;

  const metaSize = Math.max(9, unit * 0.022);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `400 ${metaSize}px ${SANS}`;
  ctx.textBaseline = 'top';
  const metaY = pad * 0.8;
  drawMultiline(ctx, opts.metaLeft, pad, metaY, metaSize * 1.3);
  ctx.textAlign = 'center';
  drawMultiline(ctx, opts.metaCenter, width / 2, metaY, metaSize * 1.3);
  ctx.textAlign = 'right';
  drawMultiline(ctx, opts.metaRight, width - pad, metaY, metaSize * 1.3);
  ctx.textAlign = 'left';

  const ruleY = metaY + metaSize * 3;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, ruleY);
  ctx.lineTo(width - pad, ruleY);
  ctx.stroke();

  const headSize = Math.min(height * 0.23, unit * 0.4);
  const headY = ruleY + height * 0.06;
  ctx.fillStyle = '#e4e4e4';
  drawItalicHeadline(ctx, opts.headlineTop, pad + headSize * 0.12, headY, headSize, contentW * 1.04);
  drawItalicHeadline(ctx, opts.headlineBottom, pad, headY + headSize * 0.94, headSize, contentW * 0.9);

  const tagSize = Math.min(height * 0.075, unit * 0.13);
  const tagY = headY + headSize * 2.05;
  ctx.fillStyle = '#fff';
  ctx.font = `300 ${tagSize}px ${SANS}`;
  ctx.textBaseline = 'top';
  ctx.fillText(opts.taglineSolid, pad, tagY);
  const slashX = pad + ctx.measureText(`${opts.taglineSolid} `).width;
  ctx.fillText('//////', slashX, tagY);

  ctx.save();
  ctx.font = `300 ${tagSize}px ${SANS}`;
  const tw = ctx.measureText(opts.taglineOutline).width || 1;
  ctx.translate(pad, tagY + tagSize * 1.02);
  ctx.scale(contentW / tw, 1);
  ctx.fillText(opts.taglineOutline, 0, 0);
  ctx.restore();

  const rule2Y = tagY + tagSize * 2.35;
  ctx.beginPath();
  ctx.moveTo(pad, rule2Y);
  ctx.lineTo(width - pad, rule2Y);
  ctx.stroke();

  const bottomTop = rule2Y + pad * 0.6;
  const smileR = Math.min(unit * 0.085, (height - bottomTop - pad) * 0.42);
  if (smileR > 6) {
    const cy = bottomTop + smileR + 2;
    drawSmiley(ctx, pad + smileR, cy, smileR);
    drawSmiley(ctx, pad + smileR * 3.3, cy, smileR);
  }

  const bodySize = Math.max(9, unit * 0.026);
  const bodyW = contentW * 0.46;
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.font = `400 ${bodySize}px ${SANS}`;
  wrapJustified(ctx, opts.body, width - pad - bodyW, bottomTop, bodyW, bodySize * 1.3);
}

export { DEFAULT_OPTS as DEFAULT_POSTER_OPTS };
