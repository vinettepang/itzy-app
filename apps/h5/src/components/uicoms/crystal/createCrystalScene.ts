import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export type CrystalSceneOptions = {
  container: HTMLElement;
  dprCap?: number;
};

export type CrystalSceneHandle = {
  dispose: () => void;
  setPaused: (paused: boolean) => void;
};

/** 拼字目标：中心 (x, y)、长度、z 轴角度 */
type BarTarget = { x: number; y: number; length: number; angle: number };

const BAR_W = 0.32;
const BAR_D = 0.28;
const LETTER_H = 1.6;
const DEG = Math.PI / 180;

function diag(x1: number, y1: number, x2: number, y2: number, extend = 0.1): BarTarget {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
    length: Math.hypot(dx, dy) + extend,
    angle: Math.atan2(dy, dx),
  };
}

const TOP = LETTER_H / 2 - BAR_W / 2;

const ITZY_BARS: BarTarget[] = [
  // I
  { x: -2.1, y: 0, length: LETTER_H, angle: 90 * DEG },
  // T
  { x: -0.95, y: TOP, length: 1.1, angle: 0 },
  { x: -0.95, y: -BAR_W / 2, length: LETTER_H - BAR_W, angle: 90 * DEG },
  // Z
  { x: 0.35, y: TOP, length: 1.0, angle: 0 },
  diag(-0.1, -TOP + 0.1, 0.8, TOP - 0.1, 0.12),
  { x: 0.35, y: -TOP, length: 1.0, angle: 0 },
  // Y
  diag(1.1, LETTER_H / 2, 1.65, 0),
  diag(2.2, LETTER_H / 2, 1.65, 0),
  { x: 1.65, y: -0.4, length: 0.8 + BAR_W / 2, angle: 90 * DEG },
];

const CYCLE = { tumble: 2.2, assemble: 2.0, hold: 3.2, disperse: 1.6 };
const CYCLE_LEN = CYCLE.tumble + CYCLE.assemble + CYCLE.hold + CYCLE.disperse;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** 当前周期内的拼合进度 0（散开翻滚）→ 1（拼成 ITZY） */
function assembleProgress(cycleT: number): number {
  const { tumble, assemble, hold } = CYCLE;
  if (cycleT < tumble) return 0;
  if (cycleT < tumble + assemble) return easeInOutCubic((cycleT - tumble) / assemble);
  if (cycleT < tumble + assemble + hold) return 1;
  return 1 - easeInOutCubic((cycleT - tumble - assemble - hold) / CYCLE.disperse);
}

type TumbleState = {
  origin: THREE.Vector3;
  drift: THREE.Vector3;
  baseQuat: THREE.Quaternion;
  axis: THREE.Vector3;
  spin: number;
  phase: number;
};

function randomTumble(): TumbleState {
  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  return {
    origin: new THREE.Vector3(rand(-3, 3), rand(-1.4, 1.4), rand(-1.5, 1)),
    drift: new THREE.Vector3(rand(-0.3, 0.3), rand(-0.3, 0.3), rand(-0.3, 0.3)),
    baseQuat: new THREE.Quaternion().setFromEuler(
      new THREE.Euler(rand(0, Math.PI * 2), rand(0, Math.PI * 2), rand(0, Math.PI * 2)),
    ),
    axis: new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize(),
    spin: rand(1.2, 2.8) * (Math.random() < 0.5 ? -1 : 1),
    phase: rand(0, Math.PI * 2),
  };
}

const vertexShader = /* glsl */ `
  varying vec3 vLocalPos;
  varying vec3 vLocalNormal;
  varying vec3 vViewNormal;
  varying vec3 vViewPos;

  void main() {
    vLocalPos = position;
    vLocalNormal = normal;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uSize;
  uniform float uTime;
  uniform float uEdge;
  uniform float uSeed;

  varying vec3 vLocalPos;
  varying vec3 vLocalNormal;
  varying vec3 vViewNormal;
  varying vec3 vViewPos;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // 物体空间坐标换算到真实尺寸，边宽不受非等比缩放影响
    vec3 q = vLocalPos * uSize;
    vec3 an = abs(vLocalNormal);
    vec3 halfSize = uSize * 0.5;

    // 当前面上到最近棱的距离
    float d = 1e3;
    if (an.x < 0.5) d = min(d, halfSize.x - abs(q.x));
    if (an.y < 0.5) d = min(d, halfSize.y - abs(q.y));
    if (an.z < 0.5) d = min(d, halfSize.z - abs(q.z));

    // 沿长轴的霜纹 + 面内颗粒，接近磨砂玻璃
    vec3 nseed = vec3(uSeed, uSeed * 1.7, uSeed * 0.37);
    float stretch = fbm(vec3(q.x * 5.5, q.y * 32.0, q.z * 32.0) + nseed + uTime * 0.04);
    float blotch = fbm(vec3(q.x * 1.6, q.y * 3.2, q.z * 3.2) + nseed * 2.1);
    float grit = fbm(q * 78.0 + nseed);
    float frost = stretch * 0.62 + blotch * 0.38;

    // 宽面上的暗槽：中心更透、更暗，靠近棱更亮
    vec2 face = q.yz;
    vec2 faceHalf = halfSize.yz;
    if (an.y > 0.5) {
      face = q.xz;
      faceHalf = halfSize.xz;
    } else if (an.x > 0.5) {
      face = q.yz;
      faceHalf = halfSize.yz;
    }
    float insetA = smoothstep(0.06, 0.28, (faceHalf.x - abs(face.x)) / max(faceHalf.x, 0.001));
    float insetB = smoothstep(0.1, 0.42, (faceHalf.y - abs(face.y)) / max(faceHalf.y, 0.001));
    float cavity = insetA * insetB;

    float body = 0.1 + pow(frost, 1.35) * 0.62 + grit * 0.08;
    body *= mix(1.0, 0.55, cavity);

    float rim = 1.0 - smoothstep(0.0, uEdge * 0.85, d);
    float lip = 1.0 - smoothstep(uEdge, uEdge * 3.2, d);
    float glow = exp(-d * d / max(uEdge * uEdge * 6.0, 1e-4));
    float b = mix(body, 0.55 + frost * 0.2, lip);
    b = mix(b, 1.2 + grit * 0.25, pow(rim, 1.1));
    b += glow * 0.18;

    vec3 V = normalize(-vViewPos);
    float fres = pow(1.0 - abs(dot(normalize(vViewNormal), V)), 3.2);
    b += fres * 0.06;

    vec3 col = vec3(b) * vec3(0.96, 0.98, 1.0);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createCrystalScene({ container, dprCap = 2 }: CrystalSceneOptions): CrystalSceneHandle {
  const width = Math.max(container.clientWidth, 1);
  const height = Math.max(container.clientHeight, 1);
  const dpr = () => Math.min(window.devicePixelRatio, dprCap);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr());
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
  camera.position.set(0, 0, 4.4);

  const timeUniform = { value: 0 };
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const materials: THREE.ShaderMaterial[] = [];

  const crystal = new THREE.Group();
  const bars: {
    mesh: THREE.Mesh;
    targetPos: THREE.Vector3;
    targetQuat: THREE.Quaternion;
    tumble: TumbleState;
  }[] = [];

  ITZY_BARS.forEach((bar, i) => {
    const size: [number, number, number] = [bar.length, BAR_W, BAR_D];
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uSize: { value: new THREE.Vector3(...size) },
        uTime: timeUniform,
        uEdge: { value: 0.07 },
        uSeed: { value: i * 13.37 },
      },
      transparent: false,
      depthWrite: true,
      depthTest: true,
      side: THREE.FrontSide,
      blending: THREE.NormalBlending,
      polygonOffset: true,
      polygonOffsetFactor: (i + 1) * 2,
      polygonOffsetUnits: (i + 1) * 4,
    });
    materials.push(material);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(...size);
    mesh.renderOrder = i;
    crystal.add(mesh);

    bars.push({
      mesh,
      targetPos: new THREE.Vector3(bar.x, bar.y, (i - (ITZY_BARS.length - 1) / 2) * 0.02),
      targetQuat: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), bar.angle),
      tumble: randomTumble(),
    });
  });
  crystal.position.y = 0.1;
  scene.add(crystal);

  const spinQuat = new THREE.Quaternion();
  const tumbleQuat = new THREE.Quaternion();
  const tumblePos = new THREE.Vector3();
  let lastCycle = -1;

  const layoutBars = (t: number, p: number) => {
    for (const bar of bars) {
      const s = bar.tumble;
      tumblePos
        .copy(s.origin)
        .addScaledVector(s.drift, Math.sin(t * 0.6 + s.phase));
      spinQuat.setFromAxisAngle(s.axis, s.spin * t + s.phase);
      tumbleQuat.copy(s.baseQuat).multiply(spinQuat);

      bar.mesh.position.lerpVectors(tumblePos, bar.targetPos, p);
      bar.mesh.quaternion.slerpQuaternions(tumbleQuat, bar.targetQuat, p);
    }
  };

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(dpr());
  composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.18, 0.12, 0.92);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let paused = false;
  let raf = 0;
  const clock = new THREE.Clock();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (paused) return;

    const t = clock.getElapsedTime();
    timeUniform.value = t;

    if (reducedMotion) {
      layoutBars(0, 1);
    } else {
      const cycle = Math.floor(t / CYCLE_LEN);
      if (cycle !== lastCycle) {
        if (lastCycle !== -1) for (const bar of bars) bar.tumble = randomTumble();
        lastCycle = cycle;
      }
      const p = assembleProgress(t - cycle * CYCLE_LEN);
      layoutBars(t, p);
      crystal.rotation.y = Math.sin(t * 0.4) * 0.22 * p;
      crystal.rotation.x = Math.sin(t * 0.3) * 0.06 * p;
    }
    composer.render();
  };
  tick();

  const fitCamera = (aspect: number) => {
    // 保证 ITZY 整体宽度（约 5.4）在窄屏也能完整显示
    const halfTan = Math.tan((camera.fov * DEG) / 2);
    camera.position.z = Math.max(4.4, 5.6 / (2 * halfTan * aspect));
  };
  fitCamera(width / height);

  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    fitCamera(camera.aspect);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(dpr());
    renderer.setSize(w, h, false);
    composer.setPixelRatio(dpr());
    composer.setSize(w, h);
    bloom.resolution.set(w, h);
  };

  const ro = new ResizeObserver(onResize);
  ro.observe(container);

  const dispose = () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    geometry.dispose();
    for (const m of materials) m.dispose();
    bloom.dispose();
    composer.dispose();
    renderer.dispose();
    if (renderer.domElement.parentElement === container) {
      container.removeChild(renderer.domElement);
    }
  };

  return {
    dispose,
    setPaused: (value: boolean) => {
      paused = value;
      if (!paused) clock.getDelta();
    },
  };
}
