/** 罐子内部的逻辑坐标（与 JarPage 里的 SVG viewBox 一致） */
export const JAR_W = 320;
export const JAR_H = 420;
export const CX = 160;
export const ORB_R = 22;
export const MOUTH = { x: 160, y: 40 };
export const SPAWN = { x: 160, y: 74 };

const BOTTOM = 392;
const NECK_HW = 57;
const NECK_END = 86;
const BODY_HW = 122;
const BODY_TOP = 150;
const CORNER_Y = 340;
const CORNER_R = 52;
const CORNER_X = BODY_HW - CORNER_R;

const GRAVITY = 1500;
const RESTITUTION = 0.28;

export type Body = { id: string; x: number; y: number; vx: number; vy: number; r: number };

function halfWidth(y: number) {
  if (y < NECK_END) return NECK_HW;
  if (y < BODY_TOP) {
    const u = (y - NECK_END) / (BODY_TOP - NECK_END);
    const s = u * u * (3 - 2 * u);
    return NECK_HW + (BODY_HW - NECK_HW) * s;
  }
  return BODY_HW;
}

function constrain(b: Body) {
  if (b.y > BOTTOM - b.r) {
    b.y = BOTTOM - b.r;
    if (b.vy > 0) b.vy = -b.vy * RESTITUTION;
    b.vx *= 0.94;
  }
  const dx = b.x - CX;
  const side = Math.sign(dx) || 1;
  if (b.y > CORNER_Y && Math.abs(dx) > CORNER_X) {
    const ccx = CX + side * CORNER_X;
    const ox = b.x - ccx;
    const oy = b.y - CORNER_Y;
    const d = Math.hypot(ox, oy);
    const lim = CORNER_R - b.r;
    if (d > lim) {
      const nx = ox / d;
      const ny = oy / d;
      b.x = ccx + nx * lim;
      b.y = CORNER_Y + ny * lim;
      const vn = b.vx * nx + b.vy * ny;
      if (vn > 0) {
        b.vx -= (1 + RESTITUTION) * vn * nx;
        b.vy -= (1 + RESTITUTION) * vn * ny;
      }
    }
    return;
  }
  const hw = halfWidth(b.y) - b.r;
  if (Math.abs(dx) > hw) {
    b.x = CX + side * hw;
    if (b.vx * side > 0) b.vx = -b.vx * RESTITUTION;
  }
}

export function stepBodies(bodies: Body[], dt: number) {
  const SUB = 4;
  const h = dt / SUB;
  for (let s = 0; s < SUB; s++) {
    for (const b of bodies) {
      b.vy += GRAVITY * h;
      b.x += b.vx * h;
      b.y += b.vy * h;
    }
    for (let iter = 0; iter < 2; iter++) {
      for (let i = 0; i < bodies.length; i++) {
        const a = bodies[i];
        for (let j = i + 1; j < bodies.length; j++) {
          const b = bodies[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const min = a.r + b.r;
          const d2 = dx * dx + dy * dy;
          if (d2 >= min * min) continue;
          const d = Math.sqrt(d2) || 0.01;
          const nx = dx / d;
          const ny = dy / d;
          const push = (min - d) / 2;
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;
          const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (vn < 0) {
            const imp = (-(1 + RESTITUTION) * vn) / 2;
            a.vx -= imp * nx;
            a.vy -= imp * ny;
            b.vx += imp * nx;
            b.vy += imp * ny;
          }
        }
      }
      for (const b of bodies) constrain(b);
    }
    for (const b of bodies) {
      b.vx *= 0.995;
      b.vy *= 0.998;
    }
  }
}

/** 首次进入页面时把已有光球从罐底往上码好，再预跑几步让它们自然落稳 */
export function layoutInitial(ids: string[]): Body[] {
  const perRow = 6;
  const gap = ORB_R * 2;
  const bodies = ids.map((id, k) => {
    const row = Math.floor(k / perRow);
    const col = k % perRow;
    const x = CX - ((perRow - 1) / 2) * gap + col * gap + (row % 2 ? ORB_R * 0.6 : -ORB_R * 0.6);
    const y = BOTTOM - ORB_R - row * gap * 0.88;
    return { id, x, y, vx: 0, vy: 0, r: ORB_R };
  });
  for (let i = 0; i < 160; i++) stepBodies(bodies, 1 / 60);
  return bodies;
}
