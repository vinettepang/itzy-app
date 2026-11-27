import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import helvetikerBold from 'three/examples/fonts/helvetiker_bold.typeface.json';

export type FolderState = 'closed' | 'open' | 'fan' | 'focus';

export type FolderSceneOptions = {
  container: HTMLElement;
  dprCap?: number;
  autoPlay?: boolean;
  onStateChange?: (state: FolderState, focus: number) => void;
  /** 用户直接点击画布时触发，页面据此关闭自动演示 */
  onUserInteract?: () => void;
};

export type FolderSceneHandle = {
  setAuto: (on: boolean) => void;
  setState: (state: FolderState, focus?: number) => void;
  next: () => void;
  shake: () => void;
  dispose: () => void;
};

const W = 3.3;
const H = 2.4;
const TAB_H = 0.3;
const TAB_W = 1.25;
const FRONT_H = 2.12;
/** 前后板之间的夹层厚度，物件在里面上下进出 */
const GAP = 0.44;
const INNER_Z = GAP / 2;
/** 整个文件夹（含物件）的缩放；物件再单独放大 ITEM_BOOST 倍 */
const FOLDER_SCALE = 0.8;
const ITEM_BOOST = 1.4;
const INSIDE_SCALE = 0.85 / ITEM_BOOST;
/** 物件放大后，飞出布局以文件夹上沿为基准同比撑开，避免互相重叠 */
const spreadX = (x: number) => x * ITEM_BOOST;
const spreadY = (y: number) => 2.4 + (y - 2.4) * ITEM_BOOST;
const BASE_POSE = { x: 0.1, y: -0.34, z: 0.05 };

type Pose2 = { x: number; y: number; rz: number };
type ItemDef = {
  name: string;
  closed: Pose2;
  /** 打开时整件探出文件夹边沿，仍停在夹层正上方 */
  open: Pose2;
  out: Pose2 & { z: number };
  /** 相对文件夹的尺寸，按参考视频里各物件占文件夹宽度的比例校准 */
  size: number;
  /** 飞出后的自转方式 */
  spin?: 'y' | 'sway';
};

export const FOLDER_ITEMS: ItemDef[] = [
  { name: '回形针', size: 0.8, closed: { x: 0.0, y: 1.45, rz: 0 }, open: { x: 0.1, y: 3.28, rz: -0.2 }, out: { x: 0.0, y: 4.55, z: 1.0, rz: -0.45 }, spin: 'y' },
  { name: 'FOR MIDZY 窗口', size: 1.15, closed: { x: -0.85, y: 1.5, rz: 0.04 }, open: { x: -0.8, y: 3.32, rz: 0.05 }, out: { x: -0.55, y: 4.1, z: 1.3, rz: 0.1 } },
  { name: '铅笔', size: 0.95, closed: { x: 0.85, y: 0.72, rz: Math.PI / 2 }, open: { x: 0.72, y: 2.58, rz: 1.35 }, out: { x: 0.4, y: 4.1, z: 1.15, rz: -0.85 } },
  { name: '笑脸徽章', size: 0.85, closed: { x: 0.0, y: 0.7, rz: 0 }, open: { x: 0.02, y: 2.6, rz: 0 }, out: { x: -0.45, y: 3.38, z: 1.45, rz: 0 }, spin: 'y' },
  { name: 'ITZY 钥匙扣', size: 1.05, closed: { x: 0.62, y: 1.5, rz: 0.06 }, open: { x: 0.88, y: 3.3, rz: 0.08 }, out: { x: 1.2, y: 3.5, z: 1.25, rz: 0.12 } },
  { name: '四叶草', size: 0.8, closed: { x: 1.32, y: 1.0, rz: 0.4 }, open: { x: 1.42, y: 2.66, rz: 0.4 }, out: { x: -1.12, y: 3.02, z: 1.2, rz: 0.3 } },
  { name: 'MIDZY 气泡', size: 1.2, closed: { x: -0.85, y: 0.7, rz: 0 }, open: { x: -0.85, y: 2.66, rz: 0 }, out: { x: -0.2, y: 2.68, z: 1.4, rz: -0.04 } },
];

const PIXEL_FONT: Record<string, string[]> = {
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
};

const CURSOR_ART = [
  'o..........',
  'oo.........',
  'owo........',
  'owwo.......',
  'owwwo......',
  'owwwwo.....',
  'owwwwwo....',
  'owwwwwwo...',
  'owwwwwwwo..',
  'owwwwwwwwo.',
  'owwwwwooooo',
  'owwowwo....',
  'owo.owwo...',
  'oo..owwo...',
  'o....owwo..',
  '.....owwo..',
  '......oo...',
];

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** 文件夹轮廓；tab 不为空时右上角带标签页 */
function folderShape(w: number, h: number, r: number, tab?: { w: number; h: number }) {
  const s = new THREE.Shape();
  const l = -w / 2;
  const rt = w / 2;
  const top = tab ? h + tab.h : h;
  s.moveTo(l + r, 0);
  s.lineTo(rt - r, 0);
  s.quadraticCurveTo(rt, 0, rt, r);
  s.lineTo(rt, top - r);
  s.quadraticCurveTo(rt, top, rt - r, top);
  if (tab) {
    const tx = rt - tab.w;
    s.lineTo(tx + 0.22, top);
    s.bezierCurveTo(tx + 0.1, top, tx + 0.1, h, tx - 0.04, h);
  }
  s.lineTo(l + r, h);
  s.quadraticCurveTo(l, h, l, h - r);
  s.lineTo(l, r);
  s.quadraticCurveTo(l, 0, l + r, 0);
  return s;
}

/** 让正面盖帽贴满整张贴图，背面与侧边取贴图角落的纯色 */
function extrudePanel(shape: THREE.Shape, w: number, fullH: number) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 4,
    curveSegments: 10,
  });
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    if (nor.getZ(i) > 0.9) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / fullH);
    else uv.setXY(i, 0.04, 0.04);
  }
  uv.needsUpdate = true;
  return geo;
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
}

function canvasTexture(cv: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function drawLogoPill(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.08);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 9 * scale;
  roundRectPath(ctx, -120 * scale, -52 * scale, 240 * scale, 104 * scale, 52 * scale);
  ctx.stroke();
  ctx.font = `800 ${74 * scale}px "Archivo", "Arial Rounded MT Bold", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('itzy.', 0, 4 * scale);
  ctx.restore();
}

/** 正面：从上到下奶黄渐变 + 浮雕 logo（bump 贴图负责凹凸，颜色贴图给一点高光） */
function createPanelTextures(kind: 'front' | 'back') {
  const fullH = kind === 'front' ? FRONT_H : H + TAB_H;
  const cw = 1024;
  const ch = Math.round((cw * fullH) / W);
  const [color, c] = makeCanvas(cw, ch);
  const g = c.createLinearGradient(0, 0, 0, ch);
  if (kind === 'front') {
    g.addColorStop(0, '#f4e27c');
    g.addColorStop(0.65, '#f6ea95');
    g.addColorStop(1, '#fbf4bf');
  } else {
    g.addColorStop(0, '#efd667');
    g.addColorStop(1, '#f2df80');
  }
  c.fillStyle = g;
  c.fillRect(0, 0, cw, ch);

  const [bump, b] = makeCanvas(cw, ch);
  b.fillStyle = '#000';
  b.fillRect(0, 0, cw, ch);
  b.filter = 'blur(3px)';

  if (kind === 'front') {
    const lx = cw * 0.24;
    const ly = ch * 0.42;
    drawLogoPill(b, lx, ly, 1, '#fff');
    c.globalAlpha = 0.35;
    drawLogoPill(c, lx - 2, ly - 2, 1, '#fffbe0');
    c.globalAlpha = 1;
  } else {
    const tx = cw * (1 - (TAB_W * 0.5) / W);
    const ty = (TAB_H * 0.5 * ch) / fullH;
    b.font = '800 34px "Archivo", Arial, sans-serif';
    b.textAlign = 'center';
    b.textBaseline = 'middle';
    b.fillStyle = '#fff';
    b.fillText('ITZY FILES', tx, ty + 6);
    c.font = b.font;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = 'rgba(255,252,225,0.75)';
    c.fillText('ITZY FILES', tx - 1, ty + 5);
  }

  return { map: canvasTexture(color), bumpMap: new THREE.CanvasTexture(bump) };
}

function createShadowTexture() {
  const [cv, c] = makeCanvas(256, 256);
  const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(120,40,90,0.38)');
  g.addColorStop(0.5, 'rgba(120,40,90,0.14)');
  g.addColorStop(1, 'rgba(120,40,90,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(cv);
}

/** 透明底文字贴片，贴在物件表面 */
function textPlane(text: string, w: number, h: number, draw: (c: CanvasRenderingContext2D, cw: number, ch: number) => void) {
  const cw = 512;
  const ch = Math.round((cw * h) / w);
  const [cv, c] = makeCanvas(cw, ch);
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  draw(c, cw, ch);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: canvasTexture(cv), transparent: true, roughness: 0.5, depthWrite: false }),
  );
  mesh.name = text;
  return mesh;
}

function drawPixelText(c: CanvasRenderingContext2D, text: string, cw: number, ch: number, color: string) {
  const cols = text.length * 6 - 1;
  const px = Math.floor(Math.min(cw / (cols + 4), ch / 11));
  let x = Math.round((cw - cols * px) / 2);
  const y = Math.round((ch - 7 * px) / 2);
  c.fillStyle = color;
  for (const ch2 of text) {
    const glyph = PIXEL_FONT[ch2];
    if (glyph)
      glyph.forEach((row, gy) =>
        [...row].forEach((bit, gx) => {
          if (bit === '1') c.fillRect(x + gx * px, y + gy * px, px, px);
        }),
      );
    x += 6 * px;
  }
}

/* —— 七件小物：照参考视频的品类重做，文字换成 ITZY 主题 —— */
function buildItems() {
  const font = new FontLoader().parse(helvetikerBold as unknown as THREE.Font['data']);
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xe9ecf2, metalness: 1, roughness: 0.14, clearcoat: 0.6 });
  const darkChrome = new THREE.MeshPhysicalMaterial({ color: 0x8c919c, metalness: 1, roughness: 0.28 });
  const gloss = (color: string, extra: THREE.MeshPhysicalMaterialParameters = {}) =>
    new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, ...extra });

  const paperclip = () => {
    const pts: THREE.Vector3[] = [];
    const line = (x0: number, y0: number, x1: number, y1: number) => {
      for (let i = 0; i <= 8; i++) pts.push(new THREE.Vector3(x0 + ((x1 - x0) * i) / 8, y0 + ((y1 - y0) * i) / 8, 0));
    };
    const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
      for (let i = 1; i <= 16; i++) {
        const a = a0 + ((a1 - a0) * i) / 16;
        pts.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0));
      }
    };
    line(0.07, -0.18, 0.07, 0.24);
    arc(0, 0.24, 0.07, 0, Math.PI);
    line(-0.07, 0.24, -0.07, -0.32);
    arc(0.035, -0.32, 0.105, Math.PI, Math.PI * 2);
    line(0.14, -0.32, 0.14, 0.34);
    arc(0, 0.34, 0.14, 0, Math.PI);
    line(-0.14, 0.34, -0.14, 0.02);
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 260, 0.024, 10), chrome);
    m.scale.setScalar(1.25);
    g.add(m);
    return g;
  };

  const windowCard = () => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.68, 0.14, 4, 0.07), gloss('#eef0f3', { roughness: 0.35 })));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14), gloss('#2fbf71'));
    dot.position.set(0.25, 0.21, 0.07);
    const pill = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.16, 6, 16), gloss('#ff6fae'));
    pill.rotation.z = Math.PI / 2;
    pill.position.set(0.45, 0.21, 0.07);
    const panel = new THREE.Mesh(new RoundedBoxGeometry(1.14, 0.36, 0.05, 3, 0.03), gloss('#bff7a6', { roughness: 0.4 }));
    panel.position.set(0, -0.08, 0.06);
    const label = textPlane('FOR MIDZY', 1.06, 0.3, (c, cw, ch) => drawPixelText(c, 'FOR MIDZY', cw, ch, '#173b16'));
    label.position.set(0, -0.08, 0.09);
    g.add(dot, pill, panel, label);
    return g;
  };

  const pencil = () => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.7, 6), gloss('#2f62e6', { roughness: 0.32 }));
    const wood = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.022, 0.2, 6), gloss('#f3c690', { clearcoat: 0.2, roughness: 0.6 }));
    wood.position.y = -0.45;
    const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.002, 0.06, 12), gloss('#ff8a2a', { roughness: 0.4 }));
    lead.position.y = -0.58;
    const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 24), chrome);
    ferrule.position.y = 0.4;
    const eraser = new THREE.Mesh(new THREE.CapsuleGeometry(0.083, 0.06, 6, 18), gloss('#ff8fb8', { roughness: 0.5 }));
    eraser.position.y = 0.5;
    g.add(body, wood, lead, ferrule, eraser);
    return g;
  };

  const smiley = () => {
    const g = new THREE.Group();
    const badgeMat = new THREE.MeshPhysicalMaterial({ color: 0xdfe4ec, metalness: 0.75, roughness: 0.22, clearcoat: 1 });
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 48), badgeMat);
    disc.rotation.x = Math.PI / 2;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.6, 48, 16, 0, Math.PI * 2, 0, 0.41), badgeMat);
    dome.rotation.x = Math.PI / 2;
    dome.position.z = -0.53;
    g.add(dome);
    const eyeGeo = new THREE.CapsuleGeometry(0.022, 0.05, 4, 10);
    const eyeL = new THREE.Mesh(eyeGeo, darkChrome);
    eyeL.position.set(-0.075, 0.06, 0.075);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.075;
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.02, 10, 28, Math.PI), darkChrome);
    mouth.rotation.z = Math.PI;
    mouth.position.set(0, 0.01, 0.07);
    g.add(disc, eyeL, eyeR, mouth);
    return g;
  };

  const keychain = () => {
    const g = new THREE.Group();
    const geo = new TextGeometry('ITZY', {
      font,
      size: 0.32,
      depth: 0.08,
      curveSegments: 8,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.035,
      bevelSegments: 5,
    });
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    geo.translate(-(bb.max.x + bb.min.x) / 2, -(bb.max.y + bb.min.y) / 2, -(bb.max.z + bb.min.z) / 2);
    const word = new THREE.Mesh(geo, gloss('#ff79b4', { roughness: 0.3, sheen: 0.5, sheenColor: new THREE.Color('#ffd1e6') }));
    word.position.y = 0.1;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.017, 12, 32), chrome);
    ring.position.set(-0.52, 0.28, 0);
    ring.rotation.y = 0.9;
    const tag = new THREE.Group();
    tag.add(new THREE.Mesh(new RoundedBoxGeometry(0.17, 0.6, 0.04, 3, 0.03), darkChrome));
    const tagText = textPlane('NOT SHY', 0.14, 0.52, (c, cw, ch) => {
      c.translate(cw / 2, ch / 2);
      c.rotate(Math.PI / 2);
      c.fillStyle = '#ffffff';
      c.font = `800 ${Math.round(cw * 0.55)}px "Archivo", Arial, sans-serif`;
      c.fillText('NOT SHY', 0, 4);
    });
    tagText.position.z = 0.025;
    tag.add(tagText);
    tag.position.set(0.18, -0.36, -0.03);
    tag.rotation.z = 0.55;
    g.add(word, ring, tag);
    return g;
  };

  const clover = () => {
    const s = new THREE.Shape();
    const N = 160;
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      const r = 0.15 + 0.15 * Math.pow(Math.abs(Math.cos(2 * a)), 0.7);
      const x = Math.cos(a + Math.PI / 4) * r;
      const y = Math.sin(a + Math.PI / 4) * r;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.035,
      bevelSegments: 5,
    });
    geo.translate(0, 0, -0.03);
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geo, gloss('#2c9b5c', { roughness: 0.18, sheen: 0.4, sheenColor: new THREE.Color('#8ff0b3') })));
    return g;
  };

  const bubble = () => {
    const s = new THREE.Shape();
    const hw = 0.375;
    const r = 0.2;
    s.moveTo(-0.3, -r);
    s.lineTo(hw, -r);
    s.absarc(hw, 0, r, -Math.PI / 2, Math.PI / 2, false);
    s.lineTo(-hw, r);
    s.absarc(-hw, 0, r, Math.PI / 2, Math.PI * 1.25, false);
    s.lineTo(-0.52, -0.38);
    s.lineTo(-0.3, -r);
    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.07,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 4,
      curveSegments: 24,
    });
    geo.translate(0, 0, -0.035);
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geo, gloss('#2454d8', { roughness: 0.25 })));
    const label = textPlane('MIDZY', 0.96, 0.32, (c, cw, ch) => {
      c.fillStyle = '#ffffff';
      c.font = `800 ${Math.round(ch * 0.62)}px "Archivo", "Arial Black", Arial, sans-serif`;
      c.fillText('MIDZY', cw / 2, ch / 2 + 4);
    });
    label.position.z = 0.07;
    g.add(label);
    return g;
  };

  return [paperclip(), windowCard(), pencil(), smiley(), keychain(), clover(), bubble()];
}

type Tween = {
  fromP: THREE.Vector3;
  fromQ: THREE.Quaternion;
  fromS: number;
  ctrl: THREE.Vector3 | null;
  start: number;
  dur: number;
  done: boolean;
};

const easeInOutCubic = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const isInsideState = (s: FolderState) => s === 'closed';

export function createFolderScene(opts: FolderSceneOptions): FolderSceneHandle {
  const { container, dprCap = 1.75 } = opts;
  let width = Math.max(1, container.clientWidth);
  let height = Math.max(1, container.clientHeight);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  renderer.domElement.style.display = 'block';

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
  camera.position.set(0, 0.5, 20);
  camera.lookAt(0, 0.3, 0);

  scene.add(new THREE.HemisphereLight(0xcfe8ff, 0xffb3d6, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-3, 6, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -4;
  key.shadow.radius = 6;
  key.shadow.bias = -0.0005;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd6ec, 0.6);
  rim.position.set(4, 2, -3);
  scene.add(rim);

  /* —— 文件夹 —— */
  const world = new THREE.Group();
  world.position.set(0, -2.6, 0);
  world.scale.setScalar(FOLDER_SCALE);
  scene.add(world);
  const folder = new THREE.Group();
  world.add(folder);

  const backTex = createPanelTextures('back');
  const frontTex = createPanelTextures('front');
  const panelMat = (t: { map: THREE.Texture; bumpMap: THREE.Texture }) =>
    new THREE.MeshPhysicalMaterial({
      map: t.map,
      bumpMap: t.bumpMap,
      bumpScale: 2.2,
      roughness: 0.55,
      clearcoat: 0.25,
      clearcoatRoughness: 0.5,
      sheen: 0.4,
      sheenColor: new THREE.Color('#fff6c8'),
      envMapIntensity: 0.55,
    });
  const back = new THREE.Mesh(extrudePanel(folderShape(W, H, 0.12, { w: TAB_W, h: TAB_H }), W, H + TAB_H), panelMat(backTex));
  back.position.z = -0.06;
  back.castShadow = true;
  back.receiveShadow = true;
  folder.add(back);

  // 底部折边，把前后板连成一个有厚度的夹层
  const spine = new THREE.Mesh(
    new RoundedBoxGeometry(W - 0.02, 0.08, GAP + 0.06, 3, 0.035),
    new THREE.MeshPhysicalMaterial({ color: '#f6e89a', roughness: 0.55, clearcoat: 0.25, envMapIntensity: 0.55 }),
  );
  spine.position.set(0, 0.0, INNER_Z - 0.02);
  spine.castShadow = true;
  folder.add(spine);

  const frontPivot = new THREE.Group();
  frontPivot.position.z = GAP;
  folder.add(frontPivot);
  const front = new THREE.Mesh(extrudePanel(folderShape(W, FRONT_H, 0.12), W, FRONT_H), panelMat(frontTex));
  front.castShadow = true;
  front.receiveShadow = true;
  frontPivot.add(front);

  /* —— 物件 —— */
  const items = buildItems().map((model, i) => {
    model.scale.setScalar(FOLDER_ITEMS[i].size * ITEM_BOOST);
    const g = new THREE.Group();
    g.add(model);
    g.userData.itemIndex = i;
    g.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    folder.add(g);
    return g;
  });

  /* —— 像素 3D 光标 —— */
  const cursor = new THREE.Group();
  const cursorInner = new THREE.Group();
  cursor.add(cursorInner);
  const PX = 0.062;
  const outlineCells: [number, number][] = [];
  const fillCells: [number, number][] = [];
  CURSOR_ART.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === 'o') outlineCells.push([x, y]);
      else if (ch === 'w') fillCells.push([x, y]);
    }),
  );
  const voxelGeo = new THREE.BoxGeometry(PX, PX, PX * 1.6);
  const makeVoxels = (cells: [number, number][], mat: THREE.Material) => {
    const inst = new THREE.InstancedMesh(voxelGeo, mat, cells.length);
    const m = new THREE.Matrix4();
    cells.forEach(([x, y], i) => {
      m.makeTranslation(x * PX + PX / 2, -y * PX - PX / 2, 0);
      inst.setMatrixAt(i, m);
    });
    inst.castShadow = true;
    return inst;
  };
  cursorInner.add(
    makeVoxels(outlineCells, new THREE.MeshStandardMaterial({ color: 0x55575c, roughness: 0.35, metalness: 0.5 })),
    makeVoxels(fillCells, new THREE.MeshStandardMaterial({ color: 0xf2f3f5, roughness: 0.3, metalness: 0.15 })),
  );
  cursorInner.rotation.set(0.15, -0.35, 0.08);
  scene.add(cursor);

  const ripple = new THREE.Mesh(
    new THREE.RingGeometry(0.1, 0.14, 40),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }),
  );
  scene.add(ripple);
  let rippleT = 1;

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 3),
    new THREE.MeshBasicMaterial({ map: createShadowTexture(), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -2.85, 0.3);
  shadow.scale.setScalar(FOLDER_SCALE);
  scene.add(shadow);

  /* —— 状态与补间 —— */
  let state: FolderState = 'closed';
  let focus = 0;
  let elapsed = 0;
  let auto = opts.autoPlay ?? true;
  const flap = { angle: 0, vel: 0 };
  let shakeT = 1;

  const tmpP = new THREE.Vector3();
  const tmpQ = new THREE.Quaternion();
  const tmpE = new THREE.Euler();

  /** 目标姿态随时间变化（漂浮、自转），补间始终追向这个动态目标 */
  const targetPose = (s: FolderState, i: number, t: number, outP: THREE.Vector3, outQ: THREE.Quaternion) => {
    const def = FOLDER_ITEMS[i];
    if (s === 'closed') {
      const pop = shakeT < 1 ? Math.sin(Math.min(1, shakeT * 1.4) * Math.PI) * (0.3 + (i % 3) * 0.08) : 0;
      outP.set(def.closed.x, def.closed.y + pop, INNER_Z);
      outQ.setFromEuler(tmpE.set(0, 0, def.closed.rz));
      return INSIDE_SCALE;
    }
    if (s === 'open') {
      outP.set(spreadX(def.open.x), spreadY(def.open.y) + Math.sin(t * 2 + i * 1.3) * 0.035, INNER_Z + 0.06);
      outQ.setFromEuler(tmpE.set(0, Math.sin(t * 1.1 + i) * 0.12, def.open.rz + Math.sin(t * 1.6 + i) * 0.04));
      return 0.9;
    }
    const isFocus = s === 'focus' && i === focus;
    const ph = t * 0.9 + i * 1.7;
    if (isFocus) {
      outP.set(0.25, 4.4 + Math.sin(t * 1.2) * 0.05, 3.0);
      outQ.setFromEuler(tmpE.set(-0.05 + Math.sin(t * 0.8) * 0.06, -BASE_POSE.y + Math.sin(t * 0.9) * 0.45, 0));
      return 1.45;
    }
    const back = s === 'focus' ? -0.5 : 0;
    outP.set(spreadX(def.out.x), spreadY(def.out.y) + Math.sin(ph) * 0.07, def.out.z * 1.2 + back);
    const ry = def.spin === 'y' ? t * 1.3 + i : -BASE_POSE.y * 0.7 + Math.sin(ph * 0.7) * 0.3;
    outQ.setFromEuler(tmpE.set(Math.sin(ph * 0.6) * 0.08, ry, def.out.rz + Math.sin(ph * 0.8) * 0.07));
    return s === 'focus' ? 0.85 : 1;
  };

  const tweens: Tween[] = items.map((g, i) => {
    const s = targetPose('closed', i, 0, tmpP, tmpQ);
    g.position.copy(tmpP);
    g.quaternion.copy(tmpQ);
    g.scale.setScalar(s);
    return { fromP: g.position.clone(), fromQ: g.quaternion.clone(), fromS: s, ctrl: null, start: 0, dur: 0, done: true };
  });
  const order = [6, 3, 5, 1, 4, 2, 0];
  let lastLandAt = 0;

  const setState = (s: FolderState, f = focus) => {
    const nf = ((f % items.length) + items.length) % items.length;
    if (s === state && nf === focus) return;
    const wasInside = isInsideState(state);
    const willInside = isInsideState(s);
    state = s;
    focus = nf;
    const crossing = wasInside !== willInside;
    lastLandAt = 0;
    items.forEach((g, i) => {
      const tw = tweens[i];
      tw.fromP.copy(g.position);
      tw.fromQ.copy(g.quaternion);
      tw.fromS = g.scale.x;
      const rank = order.indexOf(i);
      // 出夹层：先竖直升到边沿以上再横移；回夹层：先横移到开口正上方再竖直落入
      tw.ctrl = null;
      if (crossing) {
        targetPose(s, i, elapsed, tmpP, tmpQ);
        const def = FOLDER_ITEMS[i];
        tw.ctrl = willInside
          ? new THREE.Vector3(def.closed.x, THREE.MathUtils.clamp(g.position.y, H + 0.5, H + 1.4), INNER_Z)
          : new THREE.Vector3(g.position.x, THREE.MathUtils.clamp(tmpP.y, H + 0.5, H + 1.3), INNER_Z);
      }
      tw.dur = crossing ? 1.05 : s === 'focus' || state === 'focus' ? 0.75 : 0.6;
      const stagger = crossing ? (willInside ? items.length - 1 - rank : rank) * 0.07 : 0;
      tw.start = elapsed + stagger;
      tw.done = false;
      lastLandAt = Math.max(lastLandAt, tw.start + tw.dur);
    });
    opts.onStateChange?.(state, focus);
  };

  /* —— 自动演示脚本：光标移动 → 点击 → 切换状态 —— */
  type Step = { to: [number, number, number]; hold: number; act?: () => void };
  const script: Step[] = [
    { to: [2.6, -0.9, 2.2], hold: 0.9, act: () => setState('closed') },
    { to: [-0.4, 0.75, 0.8], hold: 1.5, act: () => setState('open') },
    { to: [spreadX(0.1), spreadY(2.6), 0.7], hold: 2.6, act: () => setState('fan') },
    { to: [spreadX(0.5), spreadY(4.0), 1.8], hold: 1.8, act: () => setState('focus', 2) },
    { to: [1.2, 3.6, 3.7], hold: 1.6, act: () => setState('focus', 4) },
    { to: [1.2, 3.6, 3.7], hold: 1.6, act: () => setState('focus', 1) },
    { to: [-0.4, 0.75, 0.8], hold: 1.8, act: () => setState('closed') },
  ];
  let scriptIdx = 0;
  let scriptT = 0;
  let arrived = false;
  let pressT = 1;
  const cursorTarget = new THREE.Vector3(3, -2, 2);
  const tmpV = new THREE.Vector3();

  const click = () => {
    pressT = 0;
    rippleT = 0;
    ripple.position.copy(cursor.position);
  };

  const stepAuto = (dt: number) => {
    const s = script[scriptIdx];
    tmpV.set(...s.to);
    folder.localToWorld(tmpV);
    cursorTarget.copy(tmpV);
    scriptT += dt;
    if (!arrived && (cursor.position.distanceTo(cursorTarget) < 0.06 || scriptT > 1.4)) {
      arrived = true;
      scriptT = 0;
      if (s.act) {
        click();
        s.act();
      }
    }
    if (arrived && scriptT > s.hold) {
      arrived = false;
      scriptT = 0;
      scriptIdx = (scriptIdx + 1) % script.length;
    }
  };

  /* —— 交互：真实指针驱动像素光标，点击文件夹 / 物件 —— */
  const pointer = new THREE.Vector2(0, 0);
  const tilt = { x: 0, y: 0 };
  const raycaster = new THREE.Raycaster();
  const cursorPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -1.6);

  const updatePointer = (e: PointerEvent) => {
    const r = container.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const itemIndexOf = (o: THREE.Object3D | undefined) => {
    for (let p = o; p; p = p.parent ?? undefined) {
      if (typeof p.userData.itemIndex === 'number') return p.userData.itemIndex as number;
    }
    return undefined;
  };
  const onMove = (e: PointerEvent) => {
    updatePointer(e);
    if (auto) return;
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(cursorPlane, cursorTarget);
  };
  const onDown = (e: PointerEvent) => {
    updatePointer(e);
    if (auto) {
      auto = false;
      opts.onUserInteract?.();
    }
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(cursorPlane, cursorTarget);
    cursor.position.copy(cursorTarget);
    click();
    const hit = raycaster.intersectObjects([...items, back, front, spine], true)[0];
    const idx = itemIndexOf(hit?.object);
    if (idx !== undefined && state !== 'closed') {
      if (state === 'open') setState('fan');
      else if (state === 'fan') setState('focus', idx);
      else if (idx === focus) setState('fan');
      else setState('focus', idx);
    } else if (hit) {
      setState(state === 'closed' ? 'open' : 'closed');
    } else if (state === 'focus') {
      setState('fan');
    }
  };
  container.addEventListener('pointermove', onMove);
  container.addEventListener('pointerdown', onDown);

  const fitCamera = (aspect: number) => {
    const halfTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const needW = 4.8;
    const needH = 8.5;
    camera.position.z = Math.max(needH / (2 * halfTan), needW / (2 * halfTan * aspect));
  };
  fitCamera(width / height);

  const ro = new ResizeObserver(() => {
    width = Math.max(1, container.clientWidth);
    height = Math.max(1, container.clientHeight);
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    fitCamera(camera.aspect);
  });
  ro.observe(container);

  const clock = new THREE.Clock();
  let raf = 0;
  const damp = THREE.MathUtils.damp;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;
    const t = elapsed;

    if (auto) stepAuto(dt);

    // 合上时等物件全部落回夹层再关盖，避免盖板扫过物件
    const flapTarget =
      state === 'closed' ? (t > lastLandAt - 0.15 ? 0 : 0.5) : state === 'open' ? 0.5 : 0.36;
    flap.vel += ((flapTarget - flap.angle) * 60 - flap.vel * 10) * dt;
    flap.angle += flap.vel * dt;
    frontPivot.rotation.x = flap.angle;

    tilt.x = damp(tilt.x, auto ? 0 : -pointer.y * 0.1, 3, dt);
    tilt.y = damp(tilt.y, auto ? 0 : pointer.x * 0.2, 3, dt);
    shakeT = Math.min(1, shakeT + dt / 0.8);
    const shake = Math.sin(shakeT * Math.PI * 6) * (1 - shakeT) * 0.1;
    folder.rotation.set(
      BASE_POSE.x + Math.sin(t * 0.5) * 0.03 + tilt.x,
      BASE_POSE.y + Math.sin(t * 0.37) * 0.07 + tilt.y,
      BASE_POSE.z + shake,
    );
    const bob = Math.sin(t * 1.1) * 0.07;
    folder.position.y = bob;
    shadow.scale.setScalar((1 - bob * 0.6) * FOLDER_SCALE);
    (shadow.material as THREE.MeshBasicMaterial).opacity = 0.9 - bob * 1.5;

    items.forEach((g, i) => {
      const tw = tweens[i];
      const s = targetPose(state, i, t, tmpP, tmpQ);
      if (tw.done) {
        g.position.copy(tmpP);
        g.quaternion.copy(tmpQ);
        g.scale.setScalar(s);
        return;
      }
      const u = THREE.MathUtils.clamp((t - tw.start) / tw.dur, 0, 1);
      const e = easeInOutCubic(u);
      if (tw.ctrl) {
        const a = (1 - e) * (1 - e);
        const b = 2 * (1 - e) * e;
        const c = e * e;
        g.position.set(
          a * tw.fromP.x + b * tw.ctrl.x + c * tmpP.x,
          a * tw.fromP.y + b * tw.ctrl.y + c * tmpP.y,
          a * tw.fromP.z + b * tw.ctrl.z + c * tmpP.z,
        );
      } else {
        g.position.lerpVectors(tw.fromP, tmpP, e);
      }
      g.quaternion.slerpQuaternions(tw.fromQ, tmpQ, e);
      g.scale.setScalar(THREE.MathUtils.lerp(tw.fromS, s, e));
      if (u >= 1) tw.done = true;
    });

    const follow = auto ? 4.5 : 18;
    cursor.position.x = damp(cursor.position.x, cursorTarget.x, follow, dt);
    cursor.position.y = damp(cursor.position.y, cursorTarget.y, follow, dt);
    cursor.position.z = damp(cursor.position.z, cursorTarget.z, follow, dt);
    pressT = Math.min(1, pressT + dt / 0.28);
    cursorInner.scale.setScalar(1 - Math.sin(pressT * Math.PI) * 0.2);

    rippleT = Math.min(1, rippleT + dt / 0.5);
    ripple.scale.setScalar(0.4 + rippleT * 2.6);
    (ripple.material as THREE.MeshBasicMaterial).opacity = (1 - rippleT) * 0.9;
    ripple.quaternion.copy(camera.quaternion);

    renderer.render(scene, camera);
  };
  tick();

  return {
    setAuto: (on) => {
      auto = on;
      if (on) {
        scriptIdx = 0;
        scriptT = 0;
        arrived = false;
      }
    },
    setState: (s, f) => setState(s, f),
    next: () => {
      if (state === 'focus') setState('focus', focus + 1);
      else setState('focus', state === 'fan' ? focus : 0);
    },
    shake: () => {
      if (state !== 'closed') setState('closed');
      shakeT = 0;
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerdown', onDown);
      const textures = new Set<THREE.Texture>();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          const mm = m as THREE.MeshPhysicalMaterial;
          [mm.map, mm.bumpMap].forEach((tx) => tx && textures.add(tx));
          m.dispose();
        });
      });
      textures.forEach((tx) => tx.dispose());
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
