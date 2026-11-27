import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

type Axis = 'x' | 'y' | 'z';
type Move = { axis: Axis; layer: -1 | 0 | 1; dir: 1 | -1; record: boolean };

export type RubikSceneOptions = {
  container: HTMLElement;
  dprCap?: number;
  autoRotate?: boolean;
  onHistoryChange?: (moves: number) => void;
};

export type RubikSceneHandle = {
  setAuto: (on: boolean) => void;
  setSpeed: (speed: number) => void;
  setExploded: (on: boolean) => void;
  scramble: (count?: number) => void;
  solve: () => void;
  dispose: () => void;
};

const AXES: Axis[] = ['x', 'y', 'z'];
const LAYERS: Move['layer'][] = [-1, 0, 1];
const BASE_SPACING = 1.0;
const EXPLODED_SPACING = 1.32;
const STICKER_SIZE = 0.92;

const PINK = '#f49ac1';
const PINK_DEEP = '#ec6fa6';
const WHITE = '#fbfbfb';

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function roundedRectShape(size: number, radius: number) {
  const s = size / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-s + radius, -s);
  shape.lineTo(s - radius, -s);
  shape.quadraticCurveTo(s, -s, s, -s + radius);
  shape.lineTo(s, s - radius);
  shape.quadraticCurveTo(s, s, s - radius, s);
  shape.lineTo(-s + radius, s);
  shape.quadraticCurveTo(-s, s, -s, s - radius);
  shape.lineTo(-s, -s + radius);
  shape.quadraticCurveTo(-s, -s, -s + radius, -s);
  return shape;
}

function heartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.35);
  ctx.bezierCurveTo(cx - s * 0.05, cy + s * 0.3, cx - s * 0.5, cy + s * 0.02, cx - s * 0.5, cy - s * 0.2);
  ctx.bezierCurveTo(cx - s * 0.5, cy - s * 0.42, cx - s * 0.3, cy - s * 0.52, cx - s * 0.15, cy - s * 0.48);
  ctx.bezierCurveTo(cx - s * 0.05, cy - s * 0.45, cx, cy - s * 0.36, cx, cy - s * 0.3);
  ctx.bezierCurveTo(cx, cy - s * 0.36, cx + s * 0.05, cy - s * 0.45, cx + s * 0.15, cy - s * 0.48);
  ctx.bezierCurveTo(cx + s * 0.3, cy - s * 0.52, cx + s * 0.5, cy - s * 0.42, cx + s * 0.5, cy - s * 0.2);
  ctx.bezierCurveTo(cx + s * 0.5, cy + s * 0.02, cx + s * 0.05, cy + s * 0.3, cx, cy + s * 0.35);
  ctx.closePath();
}

function starPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** 每面一张大图，被 9 块贴纸分割；打乱后图案随之错位 */
function createFaceTexture(index: number): THREE.CanvasTexture {
  const S = 512;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  const c = S / 2;

  switch (index) {
    case 0:
      ctx.fillStyle = PINK;
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = WHITE;
      heartPath(ctx, c, c + 20, S * 0.95);
      ctx.fill();
      break;
    case 1:
      ctx.fillStyle = WHITE;
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = PINK;
      starPath(ctx, c, c + 14, S * 0.46);
      ctx.fill();
      break;
    case 2: {
      ctx.fillStyle = PINK;
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.arc(c, c, S * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PINK_DEEP;
      ctx.beginPath();
      ctx.ellipse(c - 70, c - 50, 22, 40, 0, 0, Math.PI * 2);
      ctx.ellipse(c + 70, c - 50, 22, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = PINK_DEEP;
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(c, c + 10, 110, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      break;
    }
    case 3:
      ctx.fillStyle = WHITE;
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = PINK;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(S, 0);
      ctx.lineTo(0, S);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = PINK_DEEP;
      ctx.lineWidth = 30;
      heartPath(ctx, c + 60, c + 70, S * 0.55);
      ctx.stroke();
      break;
    case 4:
      ctx.fillStyle = WHITE;
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = PINK;
      ctx.font = '900 190px "Arial Black", "Helvetica Neue", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.save();
      ctx.translate(c, c);
      ctx.scale(0.62, 1.55);
      ctx.fillText('ITZY', 0, 6);
      ctx.restore();
      break;
    default: {
      ctx.fillStyle = WHITE;
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = PINK;
      const band = S / 6;
      for (let i = -6; i < 12; i += 2) {
        ctx.beginPath();
        ctx.moveTo(i * band, 0);
        ctx.lineTo((i + 1) * band, 0);
        ctx.lineTo((i + 1) * band - S, S);
        ctx.lineTo(i * band - S, S);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

const snapMatrix = new THREE.Matrix4();

/** 层转结束后把位置与旋转吸附回网格，避免浮点误差累积 */
function snapCubie(cubie: THREE.Object3D, spacing: number) {
  cubie.position.set(
    Math.round(cubie.position.x / spacing) * spacing,
    Math.round(cubie.position.y / spacing) * spacing,
    Math.round(cubie.position.z / spacing) * spacing,
  );
  snapMatrix.makeRotationFromQuaternion(cubie.quaternion);
  const e = snapMatrix.elements;
  for (let i = 0; i < 16; i++) e[i] = Math.round(e[i]);
  cubie.quaternion.setFromRotationMatrix(snapMatrix);
}

export function createRubikScene({
  container,
  dprCap = 2,
  autoRotate = true,
  onHistoryChange,
}: RubikSceneOptions): RubikSceneHandle {
  const width = Math.max(container.clientWidth, 1);
  const height = Math.max(container.clientHeight, 1);
  const dpr = () => Math.min(window.devicePixelRatio, dprCap);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr());
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
  camera.position.set(0, 0, 12);

  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(-3, 6, 6);
  const fill = new THREE.DirectionalLight(0xfff2f7, 0.55);
  fill.position.set(5, -1, 4);
  scene.add(key, fill, new THREE.AmbientLight(0xffffff, 0.6));

  /** 参考版式的 3/4 视角：正面为主，露出顶面与右侧面 */
  const POSE = { x: 0.42, y: -0.5, z: 0.06 };
  const root = new THREE.Group();
  root.rotation.set(POSE.x, POSE.y, POSE.z);
  scene.add(root);

  const shadowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(0,0,0,0.28)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0.1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 5.2), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -2.55;
  scene.add(shadow);
  const cubeGroup = new THREE.Group();
  root.add(cubeGroup);

  const bodyGeo = new RoundedBoxGeometry(0.98, 0.98, 0.98, 4, 0.09);
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0xf8f6f7, roughness: 0.5, clearcoat: 0.2 });
  const baseStickerGeo = new THREE.ShapeGeometry(roundedRectShape(STICKER_SIZE, 0.07), 4);
  const faceTextures = Array.from({ length: 6 }, (_, i) => createFaceTexture(i));
  const stickerMats = faceTextures.map(
    (map) =>
      new THREE.MeshPhysicalMaterial({
        map,
        roughness: 0.4,
        clearcoat: 0.45,
        clearcoatRoughness: 0.2,
        envMapIntensity: 0.45,
      }),
  );

  const half = 0.492;
  const placements: { normal: THREE.Vector3; rot: THREE.Euler; mat: number }[] = [
    { normal: new THREE.Vector3(1, 0, 0), rot: new THREE.Euler(0, Math.PI / 2, 0), mat: 0 },
    { normal: new THREE.Vector3(-1, 0, 0), rot: new THREE.Euler(0, -Math.PI / 2, 0), mat: 1 },
    { normal: new THREE.Vector3(0, 1, 0), rot: new THREE.Euler(-Math.PI / 2, 0, 0), mat: 2 },
    { normal: new THREE.Vector3(0, -1, 0), rot: new THREE.Euler(Math.PI / 2, 0, 0), mat: 3 },
    { normal: new THREE.Vector3(0, 0, 1), rot: new THREE.Euler(0, 0, 0), mat: 4 },
    { normal: new THREE.Vector3(0, 0, -1), rot: new THREE.Euler(0, Math.PI, 0), mat: 5 },
  ];

  const stickerGeos: THREE.BufferGeometry[] = [];

  /** 把贴纸 UV 映射到整面大图中对应的九宫格区域 */
  const makeStickerGeo = (grid: THREE.Vector3, rot: THREE.Euler) => {
    const lx = new THREE.Vector3(1, 0, 0).applyEuler(rot);
    const ly = new THREE.Vector3(0, 1, 0).applyEuler(rot);
    const col = Math.round(grid.dot(lx)) + 1;
    const row = Math.round(grid.dot(ly)) + 1;
    const geo = baseStickerGeo.clone();
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(
        i,
        (pos.getX(i) / STICKER_SIZE + 0.5 + col) / 3,
        (pos.getY(i) / STICKER_SIZE + 0.5 + row) / 3,
      );
    }
    uv.needsUpdate = true;
    stickerGeos.push(geo);
    return geo;
  };

  let spacing = BASE_SPACING;
  let targetSpacing = BASE_SPACING;
  const cubies: THREE.Object3D[] = [];
  for (const x of LAYERS) {
    for (const y of LAYERS) {
      for (const z of LAYERS) {
        if (x === 0 && y === 0 && z === 0) continue;
        const grid = new THREE.Vector3(x, y, z);
        const cubie = new THREE.Group();
        cubie.add(new THREE.Mesh(bodyGeo, bodyMat));
        for (const p of placements) {
          if (grid.dot(p.normal) !== 1) continue;
          const sticker = new THREE.Mesh(makeStickerGeo(grid, p.rot), stickerMats[p.mat]);
          sticker.position.copy(p.normal).multiplyScalar(half);
          sticker.rotation.copy(p.rot);
          cubie.add(sticker);
        }
        cubie.position.copy(grid).multiplyScalar(spacing);
        cubeGroup.add(cubie);
        cubies.push(cubie);
      }
    }
  }

  const pivot = new THREE.Group();
  const queue: Move[] = [];
  const history: Move[] = [];
  let current: { move: Move; progress: number; duration: number } | null = null;
  let auto = autoRotate;
  let speed = 1;
  let idleTimer = 0;
  let lastMove: Move | null = null;

  const notify = () => onHistoryChange?.(history.length);

  const randomMove = (record: boolean): Move => {
    for (;;) {
      const m: Move = {
        axis: AXES[(Math.random() * 3) | 0],
        layer: LAYERS[(Math.random() * 3) | 0],
        dir: Math.random() < 0.5 ? 1 : -1,
        record,
      };
      const undoesLast =
        lastMove && lastMove.axis === m.axis && lastMove.layer === m.layer && lastMove.dir === -m.dir;
      if (!undoesLast) return m;
    }
  };

  const startMove = (move: Move, duration: number) => {
    pivot.rotation.set(0, 0, 0);
    cubeGroup.add(pivot);
    for (const c of cubies) {
      if (Math.round(c.position[move.axis] / spacing) === move.layer) pivot.attach(c);
    }
    current = { move, progress: 0, duration };
    lastMove = move;
    if (move.record) {
      history.push(move);
      notify();
    }
  };

  const finishMove = () => {
    for (const c of [...pivot.children]) {
      cubeGroup.attach(c);
      snapCubie(c, spacing);
    }
    cubeGroup.remove(pivot);
    current = null;
  };

  const turnDuration = () => 0.5 / speed;

  const step = (dt: number) => {
    if (current) {
      current.progress += dt / current.duration;
      const p = Math.min(current.progress, 1);
      pivot.rotation[current.move.axis] = easeInOutCubic(p) * (Math.PI / 2) * current.move.dir;
      if (p >= 1) finishMove();
      return;
    }

    if (Math.abs(spacing - targetSpacing) > 0.0005) {
      const next = THREE.MathUtils.damp(spacing, targetSpacing, 7, dt);
      const ratio = next / spacing;
      for (const c of cubies) c.position.multiplyScalar(ratio);
      spacing = next;
      return;
    }
    if (spacing !== targetSpacing) {
      for (const c of cubies) c.position.multiplyScalar(targetSpacing / spacing);
      spacing = targetSpacing;
    }

    if (queue.length) {
      const fromSolve = !queue[0].record;
      startMove(queue.shift()!, fromSolve && !auto ? turnDuration() * 0.55 : turnDuration());
      idleTimer = 0;
      return;
    }

    if (!auto) return;

    // 展示循环：复原态停留 → 拧几步 → 短暂停顿 → 原路拧回，大部分时间图案完整可读
    idleTimer += dt;
    if (history.length === 0) {
      if (idleTimer > 1.8 / speed) {
        idleTimer = 0;
        const count = 2 + ((Math.random() * 3) | 0);
        for (let i = 0; i < count; i++) {
          const m = randomMove(true);
          lastMove = m;
          queue.push(m);
        }
      }
    } else if (idleTimer > 0.9 / speed) {
      idleTimer = 0;
      queueUndo();
    }
  };

  const queueUndo = () => {
    const all = [...history];
    history.length = 0;
    notify();
    for (let i = all.length - 1; i >= 0; i--) {
      const m = all[i];
      queue.push({ axis: m.axis, layer: m.layer, dir: (m.dir * -1) as Move['dir'], record: false });
    }
  };

  const drag = { active: false, x: 0, y: 0, velX: 0, velY: 0 };
  const dragOffset = { x: 0, y: 0 };
  const onPointerDown = (e: PointerEvent) => {
    drag.active = true;
    drag.x = e.clientX;
    drag.y = e.clientY;
    container.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!drag.active) return;
    drag.velY = (e.clientX - drag.x) * 0.008;
    drag.velX = (e.clientY - drag.y) * 0.008;
    dragOffset.y += drag.velY;
    dragOffset.x = THREE.MathUtils.clamp(dragOffset.x + drag.velX, -1.1, 1.1);
    drag.x = e.clientX;
    drag.y = e.clientY;
  };
  const onPointerUp = (e: PointerEvent) => {
    drag.active = false;
    if (container.hasPointerCapture(e.pointerId)) container.releasePointerCapture(e.pointerId);
  };
  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerUp);

  /** 立方体约占海报宽度的 70%（与参考版式一致） */
  const fitCamera = (aspect: number) => {
    const halfTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const needed = 6.1;
    camera.position.z = Math.max(needed / (2 * halfTan), needed / (2 * halfTan * aspect));
  };
  fitCamera(width / height);

  const clock = new THREE.Clock();
  let raf = 0;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    step(dt);

    if (!drag.active) {
      drag.velX *= 0.9;
      drag.velY *= 0.9;
      dragOffset.y += drag.velY;
      dragOffset.x = THREE.MathUtils.clamp(dragOffset.x + drag.velX, -1.1, 1.1);
      // 松手后缓慢回到展示姿态
      dragOffset.x = THREE.MathUtils.damp(dragOffset.x, 0, 1.2, dt);
      dragOffset.y = THREE.MathUtils.damp(dragOffset.y, Math.round(dragOffset.y / (Math.PI * 2)) * Math.PI * 2, 1.2, dt);
    }
    root.rotation.x = POSE.x + Math.sin(t * 0.32) * 0.08 + dragOffset.x;
    root.rotation.y = POSE.y + Math.sin(t * 0.4) * 0.32 + dragOffset.y;
    root.rotation.z = POSE.z + Math.sin(t * 0.27) * 0.03;

    const bob = Math.sin(t * 0.9) * 0.08;
    cubeGroup.position.y = bob;
    shadow.scale.setScalar(1 - bob * 0.6);
    shadowMat.opacity = 1 - bob * 1.5;

    renderer.render(scene, camera);
  };
  tick();

  const ro = new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    fitCamera(camera.aspect);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(dpr());
    renderer.setSize(w, h, false);
  });
  ro.observe(container);

  return {
    setAuto: (on) => {
      auto = on;
      idleTimer = 0;
    },
    setSpeed: (s) => {
      speed = THREE.MathUtils.clamp(s, 0.25, 4);
    },
    setExploded: (on) => {
      targetSpacing = on ? EXPLODED_SPACING : BASE_SPACING;
    },
    scramble: (count = 20) => {
      for (let i = 0; i < count; i++) {
        const m = randomMove(true);
        lastMove = m;
        queue.push(m);
      }
    },
    solve: () => {
      auto = false;
      const pending = queue.filter((m) => m.record);
      queue.length = 0;
      history.push(...pending);
      queueUndo();
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      bodyGeo.dispose();
      bodyMat.dispose();
      shadow.geometry.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      baseStickerGeo.dispose();
      for (const g of stickerGeos) g.dispose();
      for (const m of stickerMats) m.dispose();
      for (const t of faceTextures) t.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement);
    },
  };
}
