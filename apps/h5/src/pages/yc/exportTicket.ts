/** Rasterize SVG overlay for PNG export (SOURCE · fn-export-f · m). */
async function svgToImage(svg: SVGElement): Promise<HTMLImageElement> {
  const clone = svg.cloneNode(true) as SVGElement;
  clone.setAttribute('width', '520');
  clone.setAttribute('height', '280');
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = `
    .ticket-copy{
fill:#4a301d;
font-family:"Martian Mono","Courier New",monospace
}
    .ticket-small{
font-size:11px;
font-weight:400;
letter-spacing:.04em
}
    .ticket-name{
font-weight:500;
letter-spacing:-.02em
}
    .ticket-separator{
stroke:#4a301d;
stroke-width:1.5;
stroke-dasharray:4 4;
opacity:.2
}
    .ticket-admit{
font-size:40px;
font-weight:500;
letter-spacing:-.02em;
opacity:.4
}
    .ticket-year{
fill:#fff;
font-family:"Martian Mono",monospace;
font-size:90px;
font-weight:700;
letter-spacing:.05em;
opacity:.15;
mix-blend-mode:overlay
}
  `;
  clone.prepend(style);
  const xml = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(
    new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }),
  );
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
  URL.revokeObjectURL(url);
  return img;
}

function punchTicketCorners(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  const holes: [number, number, number][] = [
    [0, 0, 16],
    [width, 0, 16],
    [0, height, 16],
    [width, height, 16],
    [0.76 * width, 0, 14],
    [0.76 * width, height, 14],
  ];
  for (const [x, y, r] of holes) {
    ctx.beginPath();
    ctx.arc(x, y, 3 * r, 0, 2 * Math.PI);
    ctx.fill();
  }
  ctx.restore();
}

/** Composite ticket canvases + SVG → padded PNG blob (SOURCE · fn-export-f). */
export async function exportTicketPng(
  artwork: HTMLElement,
): Promise<Blob | null> {
  await document.fonts.ready;
  const ticket = document.createElement('canvas');
  ticket.width = 1560;
  ticket.height = 840;
  const ctx = ticket.getContext('2d');
  if (!ctx) return null;

  const bounds = artwork.getBoundingClientRect();
  for (const canvas of artwork.querySelectorAll('canvas')) {
    const rect = canvas.getBoundingClientRect();
    const style = getComputedStyle(canvas);
    ctx.save();
    ctx.globalAlpha = Number.parseFloat(style.opacity) || 1;
    if (style.mixBlendMode && style.mixBlendMode !== 'normal') {
      ctx.globalCompositeOperation = style.mixBlendMode as GlobalCompositeOperation;
    }
    ctx.drawImage(
      canvas,
      ((rect.left - bounds.left) / bounds.width) * 1560,
      ((rect.top - bounds.top) / bounds.height) * 840,
      (rect.width / bounds.width) * 1560,
      (rect.height / bounds.height) * 840,
    );
    ctx.restore();
  }

  const overlay = artwork.querySelector('#ticket-overlay');
  if (overlay instanceof SVGElement) {
    const img = await svgToImage(overlay);
    ctx.drawImage(img, 0, 0, ticket.width, ticket.height);
  }
  punchTicketCorners(ctx, ticket.width, ticket.height);

  const padded = document.createElement('canvas');
  padded.width = 2160;
  padded.height = 1560;
  const pctx = padded.getContext('2d');
  if (!pctx) return null;
  pctx.fillStyle = '#2E1F15';
  pctx.fillRect(0, 0, padded.width, padded.height);
  pctx.drawImage(ticket, 300, 360);

  return new Promise((resolve) => {
    padded.toBlob((blob) => resolve(blob), 'image/png');
  });
}
