import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type BalloonTextSceneOptions = {
  container: HTMLElement;
  text: string;
  color?: THREE.ColorRepresentation;
  dprCap?: number;
};

export type BalloonTextSceneHandle = {
  dispose: () => void;
  setPaused: (paused: boolean) => void;
};

const MAP_W = 1024;
const MAP_H = 320;
const PLANE_W = 6.4;
const WORLD_PER_PX = PLANE_W / MAP_W;
const DEPTH = 0.5;
const FONT_STACK = "'Arial Rounded MT Bold', 'Nunito', 'Arial Black', sans-serif";

/** 每个像素到字形外轮廓的近似距离（倒角距离变换） */
function distanceField(mask: Uint8ClampedArray, w: number, h: number): Float32Array {
  const INF = 1e6;
  const d = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) d[i] = mask[i] > 127 ? INF : 0;
  const D = Math.SQRT2;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (d[i] === 0) continue;
      let v = d[i];
      if (x > 0) v = Math.min(v, d[i - 1] + 1);
      if (y > 0) {
        v = Math.min(v, d[i - w] + 1);
        if (x > 0) v = Math.min(v, d[i - w - 1] + D);
        if (x < w - 1) v = Math.min(v, d[i - w + 1] + D);
      }
      d[i] = v;
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      if (d[i] === 0) continue;
      let v = d[i];
      if (x < w - 1) v = Math.min(v, d[i + 1] + 1);
      if (y < h - 1) {
        v = Math.min(v, d[i + w] + 1);
        if (x < w - 1) v = Math.min(v, d[i + w + 1] + D);
        if (x > 0) v = Math.min(v, d[i + w - 1] + D);
      }
      d[i] = v;
    }
  }
  return d;
}

function boxBlur(src: Float32Array, w: number, h: number, r: number): Float32Array {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const span = r * 2 + 1;
  for (let y = 0; y < h; y++) {
    let acc = 0;
    for (let x = -r; x <= r; x++) acc += src[y * w + Math.min(Math.max(x, 0), w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = acc / span;
      acc += src[y * w + Math.min(x + r + 1, w - 1)] - src[y * w + Math.max(x - r, 0)];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(Math.max(y, 0), h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / span;
      acc += tmp[Math.min(y + r + 1, h - 1) * w + x] - tmp[Math.max(y - r, 0) * w + x];
    }
  }
  return out;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 带种子的二维值噪声，返回 0..1 */
function createNoise(seed: number) {
  const hash = (x: number, y: number) => {
    let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

type LetterField = {
  /** 裁剪后的宽高（像素） */
  w: number;
  h: number;
  /** 裁剪框在整张图中的左上角 */
  x0: number;
  y0: number;
  height: Float32Array;
  /** 顶点颜色系数：边缘、折痕处更暗 */
  shade: Float32Array;
  mask: Uint8ClampedArray;
};

/**
 * 逐字母生成充气高度场：
 * - 距离场 → 圆鼓轮廓，模糊去掉骨架尖脊
 * - 每个字母不同种子的脊状噪声，在边缘带压出褶皱
 * - 轮廓按噪声轻微收缩，形成皱巴巴的边
 */
function buildLetters(text: string): LetterField[] {
  const canvas = document.createElement('canvas');
  canvas.width = MAP_W;
  canvas.height = MAP_H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  const pad = 56;
  let fontSize = 260;
  const tracking = 0.04;
  const chars = [...text];
  const advance = (size: number) =>
    chars.reduce((sum, c) => sum + ctx.measureText(c).width + size * tracking, 0) - size * tracking;
  ctx.font = `900 ${fontSize}px ${FONT_STACK}`;
  const fitW = (MAP_W - pad * 2) / advance(fontSize);
  fontSize = Math.min(fontSize * fitW, (MAP_H - pad * 2) * 1.05);
  ctx.font = `900 ${fontSize}px ${FONT_STACK}`;

  const total = advance(fontSize);
  let x = (MAP_W - total) / 2;
  const baseline = MAP_H / 2;
  const fatten = fontSize * 0.055;
  const letters: LetterField[] = [];

  chars.forEach((c, idx) => {
    ctx.clearRect(0, 0, MAP_W, MAP_H);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = fatten;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.textBaseline = 'middle';
    ctx.fillText(c, x, baseline);
    ctx.strokeText(c, x, baseline);
    x += ctx.measureText(c).width + fontSize * tracking;
    if (!c.trim()) return;

    const px = ctx.getImageData(0, 0, MAP_W, MAP_H).data;
    let minX = MAP_W;
    let minY = MAP_H;
    let maxX = -1;
    let maxY = -1;
    for (let yy = 0; yy < MAP_H; yy++) {
      for (let xx = 0; xx < MAP_W; xx++) {
        if (px[(yy * MAP_W + xx) * 4 + 3] > 127) {
          if (xx < minX) minX = xx;
          if (xx > maxX) maxX = xx;
          if (yy < minY) minY = yy;
          if (yy > maxY) maxY = yy;
        }
      }
    }
    if (maxX < 0) return;

    const m = 14;
    const x0 = Math.max(0, minX - m);
    const y0 = Math.max(0, minY - m);
    const w = Math.min(MAP_W, maxX + m + 1) - x0;
    const h = Math.min(MAP_H, maxY + m + 1) - y0;
    const src = new Uint8ClampedArray(w * h);
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) src[yy * w + xx] = px[((yy + y0) * MAP_W + xx + x0) * 4 + 3];
    }

    const rand = mulberry32(idx * 977 + text.length * 131 + 7);
    const noise = createNoise(idx * 31 + 11);
    const noiseB = createNoise(idx * 53 + 29);
    const noiseC = createNoise(idx * 71 + 41);
    const edgeCrinkle = 1 + rand() * 3;
    // 旋转 + 各向异性拉伸的脊状噪声：每个字母的折痕走向、疏密都不同
    const ridgedLayer = (
      fn: (x: number, y: number) => number,
      angle: number,
      freq: number,
      aniso: number,
      sharp: number,
    ) => {
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);
      return (xx: number, yy: number) => {
        const u = (xx * ca - yy * sa) * freq;
        const v = (xx * sa + yy * ca) * freq * aniso;
        const n = fn(u, v) * 0.8 + fn(u * 1.9 + 5.3, v * 1.9 + 1.7) * 0.2;
        return Math.pow(1 - Math.abs(n * 2 - 1), sharp);
      };
    };
    const baseAngle = rand() * Math.PI;
    const edgeFold = ridgedLayer(noise, baseAngle, 0.016 + rand() * 0.014, 1.6, 4);
    const crossFold = ridgedLayer(noiseB, baseAngle + Math.PI / 2 + (rand() - 0.5) * 0.6, 0.024 + rand() * 0.012, 2.2, 5);
    const bodyFold = ridgedLayer(noiseC, rand() * Math.PI, 0.009 + rand() * 0.006, 2.8, 7);
    const edgeAmp = 0.08 + rand() * 0.1;
    const crossAmp = 0.05 + rand() * 0.06;
    const bodyAmp = 0.04 + rand() * 0.05;

    const d = distanceField(src, w, h);
    let dmax = 1;
    for (let i = 0; i < d.length; i++) if (d[i] > dmax) dmax = d[i];

    const mask = new Uint8ClampedArray(w * h);
    let raw = new Float32Array(w * h);
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        const i = yy * w + xx;
        if (d[i] <= 0) continue;
        if (d[i] > noise(xx * 0.045, yy * 0.045) * edgeCrinkle) mask[i] = 255;
        const t = Math.min(d[i] / dmax, 1);
        raw[i] = Math.sqrt(1 - (1 - t) * (1 - t));
      }
    }
    for (let k = 0; k < 3; k++) raw = boxBlur(raw, w, h, 3);

    // 轮廓外不截断高度，避免出现被拉伸的侧壁；轮廓外由 alphaMap 裁掉
    const height = new Float32Array(w * h);
    const shade = new Float32Array(w * h);
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        const i = yy * w + xx;
        const shaped = Math.pow(raw[i], 0.75);
        const t = Math.min(Math.max(d[i] / dmax, 0), 1);
        // 边缘环带折痕最密，向中心渐弱；另有少量贯穿字身的大褶
        const edgeBand = Math.pow(Math.max(0, 1 - t / 0.6), 1.6) * Math.min(1, t * 10);
        const bodyBand = Math.min(1, t * 4) * (0.5 + 0.5 * (1 - t));
        const crease =
          edgeAmp * edgeBand * edgeFold(xx, yy) +
          crossAmp * edgeBand * crossFold(xx, yy) +
          bodyAmp * bodyBand * bodyFold(xx, yy);
        height[i] = Math.max(0, shaped - crease);
        // 边缘和折痕谷底压暗，模拟箔膜接缝处的深蓝
        const edgeDark = Math.pow(Math.min(1, t / 0.35), 0.8);
        shade[i] = Math.max(0.3, (0.42 + 0.58 * edgeDark) * (1 - Math.min(0.45, crease * 2.2)));
      }
    }

    letters.push({ w, h, x0, y0, height, shade, mask });
  });

  return letters;
}

/** 箔膜细碎皱纹法线 */
function createWrinkleNormal(seed: number): THREE.CanvasTexture {
  const size = 512;
  const rand = mulberry32(seed);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgb(128,128,255)';
  ctx.fillRect(0, 0, size, size);

  const count = 320 + Math.floor(rand() * 260);
  const bias = rand() * Math.PI;
  for (let i = 0; i < count; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const len = 8 + rand() * 50;
    const ang = bias + (rand() - 0.5) * 1.4 + (rand() < 0.4 ? Math.PI / 2 : 0);
    const dx = Math.cos(ang) * len;
    const dy = Math.sin(ang) * len;
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    const w = 1 + rand() * 2.2;
    for (const side of [-1, 1]) {
      const r = Math.round(128 + nx * side * 70);
      const g = Math.round(128 + ny * side * 70);
      ctx.strokeStyle = `rgba(${r},${g},235,${0.3 + rand() * 0.45})`;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(x + nx * side * w * 0.6, y + ny * side * w * 0.6);
      ctx.lineTo(x + dx + nx * side * w * 0.6, y + dy + ny * side * w * 0.6);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createMaskTexture(letter: LetterField): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = letter.w;
  c.height = letter.h;
  const cx = c.getContext('2d')!;
  const img = cx.createImageData(letter.w, letter.h);
  for (let i = 0; i < letter.mask.length; i++) {
    const v = letter.mask[i];
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  cx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

function createLetterGeometry(letter: LetterField): THREE.PlaneGeometry {
  const pw = letter.w * WORLD_PER_PX;
  const ph = letter.h * WORLD_PER_PX;
  const segX = Math.max(8, Math.round(letter.w * 0.4));
  const segY = Math.max(8, Math.round(letter.h * 0.4));
  const geometry = new THREE.PlaneGeometry(pw, ph, segX, segY);
  // 枢轴放在字母底部中心，便于做“不倒翁”式摆动
  geometry.translate(0, ph / 2, 0);
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const uv = geometry.attributes.uv as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const sx = Math.min(letter.w - 1, Math.round(uv.getX(i) * (letter.w - 1)));
    const sy = Math.min(letter.h - 1, Math.round((1 - uv.getY(i)) * (letter.h - 1)));
    const k = sy * letter.w + sx;
    pos.setZ(i, letter.height[k] * DEPTH);
    const s = letter.shade[k];
    colors[i * 3] = s;
    colors[i * 3 + 1] = s;
    colors[i * 3 + 2] = Math.min(1, s * 1.08);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

type LetterRig = {
  pivot: THREE.Group;
  baseX: number;
  angle: number;
  vel: number;
  stiffness: number;
  damping: number;
  phase: number;
  nextKick: number;
};

export function createBalloonTextScene({
  container,
  text,
  color = 0x2448c8,
  dprCap = 2,
}: BalloonTextSceneOptions): BalloonTextSceneHandle {
  const width = Math.max(container.clientWidth, 1);
  const heightPx = Math.max(container.clientHeight, 1);
  const dpr = () => Math.min(window.devicePixelRatio, dprCap);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr());
  renderer.setSize(width, heightPx, false);
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, width / heightPx, 0.1, 100);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environment = env;

  scene.add(new THREE.AmbientLight(0x6d7dff, 0.25));
  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(-2.5, 3.5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x7f8cff, 1.1);
  rim.position.set(3, -1, 2);
  scene.add(rim);
  const top = new THREE.PointLight(0xdfe4ff, 3.5, 12);
  top.position.set(0.5, 2.2, 2.2);
  scene.add(top);

  const letters = buildLetters(text);
  const group = new THREE.Group();
  scene.add(group);

  const disposables: { dispose: () => void }[] = [];
  const rigs: LetterRig[] = [];
  const baseColor = new THREE.Color(color);
  const planeH = MAP_H * WORLD_PER_PX;

  letters.forEach((letter, i) => {
    const rand = mulberry32(i * 4099 + 17);
    const geometry = createLetterGeometry(letter);
    const mask = createMaskTexture(letter);
    const wrinkles = createWrinkleNormal(i * 7919 + 3);
    wrinkles.repeat.set((letter.w / 340) * (0.8 + rand() * 0.6), (letter.h / 340) * (0.8 + rand() * 0.6));
    wrinkles.offset.set(rand(), rand());
    wrinkles.rotation = rand() * Math.PI;

    const tint = baseColor.clone().offsetHSL((rand() - 0.5) * 0.015, 0, (rand() - 0.5) * 0.04);
    const ns = 0.4 + rand() * 0.3;
    const material = new THREE.MeshPhysicalMaterial({
      color: tint,
      vertexColors: true,
      metalness: 0.55,
      roughness: 0.18 + rand() * 0.08,
      specularColor: new THREE.Color(0x6f8cff),
      specularIntensity: 0.6,
      normalMap: wrinkles,
      normalScale: new THREE.Vector2(ns, ns),
      alphaMap: mask,
      alphaTest: 0.5,
      clearcoat: 0.2,
      clearcoatRoughness: 0.15,
      iridescence: 0.15,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [200, 480],
      envMapIntensity: 0.9,
    });
    disposables.push(geometry, mask, wrinkles, material);

    const pivot = new THREE.Group();
    pivot.add(new THREE.Mesh(geometry, material));
    const baseX = (letter.x0 + letter.w / 2) * WORLD_PER_PX - PLANE_W / 2;
    const baseY = planeH / 2 - (letter.y0 + letter.h) * WORLD_PER_PX;
    pivot.position.set(baseX, baseY, 0);
    group.add(pivot);

    rigs.push({
      pivot,
      baseX,
      angle: 0,
      vel: 0,
      stiffness: 22 + rand() * 18,
      damping: 1.6 + rand() * 1.4,
      phase: i * 0.42 + rand() * 0.3,
      nextKick: 0.6 + rand() * 2.5,
    });
  });

  const fitCamera = (aspect: number) => {
    const halfTan = Math.tan(((camera.fov * Math.PI) / 180) / 2);
    const needW = PLANE_W * 1.15;
    const needH = planeH * 1.35;
    camera.position.set(0, 0, Math.max(needW / (2 * halfTan * aspect), needH / (2 * halfTan)));
    camera.lookAt(0, 0, 0);
  };
  fitCamera(width / heightPx);

  // 指针横向划过时，按速度给附近字母一个冲量
  let lastPointerX: number | null = null;
  const pointerNdc = new THREE.Vector3();
  const onPointerMove = (e: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    pointerNdc.set(nx, ny, 0.5).unproject(camera);
    const dir = pointerNdc.sub(camera.position).normalize();
    const wx = camera.position.x + dir.x * (-camera.position.z / dir.z);
    if (lastPointerX !== null) {
      const dx = wx - lastPointerX;
      for (const rig of rigs) {
        const falloff = Math.exp(-Math.pow((wx - rig.baseX) / 0.55, 2));
        rig.vel -= dx * falloff * 2.4;
      }
    }
    lastPointerX = wx;
  };
  const onPointerLeave = () => {
    lastPointerX = null;
  };
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerleave', onPointerLeave);

  let paused = false;
  let raf = 0;
  const clock = new THREE.Clock();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let elapsed = 0;

  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (paused) return;
    const dt = Math.min(clock.getDelta(), 1 / 30);
    elapsed += dt;
    const t = elapsed;

    if (!reducedMotion) {
      group.rotation.y = Math.sin(t * 0.4) * 0.12;
      group.rotation.x = -0.06 + Math.sin(t * 0.3) * 0.04;
      group.position.y = Math.sin(t * 0.8) * 0.035;

      for (const rig of rigs) {
        // 左右“风”作为目标角，弹簧追随产生过冲和回弹
        const target = Math.sin(t * 1.15 - rig.phase) * 0.07 + Math.sin(t * 2.3 - rig.phase * 1.7) * 0.02;
        const acc = rig.stiffness * (target - rig.angle) - rig.damping * rig.vel;
        rig.vel += acc * dt;
        rig.angle += rig.vel * dt;

        rig.nextKick -= dt;
        if (rig.nextKick <= 0) {
          rig.vel += (Math.random() - 0.5) * 0.9;
          rig.nextKick = 1.8 + Math.random() * 3.2;
        }

        const p = rig.pivot;
        p.rotation.z = rig.angle;
        p.rotation.y = -rig.angle * 0.8;
        p.position.x = rig.baseX - rig.angle * 0.12;
        // 速度越大越“压扁拉宽”，像气球被甩动
        const squash = Math.min(Math.abs(rig.vel) * 0.06, 0.08);
        const breathe = Math.sin(t * 1.6 + rig.phase * 3) * 0.015;
        p.scale.set(1 + squash + breathe, 1 - squash * 0.8 - breathe, 1 + breathe * 2);
      }
    }
    renderer.render(scene, camera);
  };
  tick();

  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    fitCamera(camera.aspect);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(dpr());
    renderer.setSize(w, h, false);
  };
  const ro = new ResizeObserver(onResize);
  ro.observe(container);

  return {
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      disposables.forEach((d) => d.dispose());
      pmrem.dispose();
      env.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    },
    setPaused: (value: boolean) => {
      paused = value;
      if (!paused) clock.getDelta();
    },
  };
}
