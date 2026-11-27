import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import helvetikerBold from 'three/examples/fonts/helvetiker_bold.typeface.json';
import {
  drawPosterCanvas,
  POSTER_ASPECT,
  type PosterCanvasLayout,
  type PosterDrawOptions,
} from './drawPosterCanvas';

/** 自定义玻璃背后的平面；传入后替代黑白海报，并按帧重绘（time 为秒） */
export type PanterBackdrop = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => void;

export type PanterVisionSceneOptions = {
  container: HTMLElement;
  dprCap?: number;
  poster?: Partial<PosterDrawOptions>;
  /** 前景玻璃字，默认 ITZY */
  glassText?: string;
  backdrop?: PanterBackdrop;
  /** stagger：逐字错相摆动（默认）；together：整词作为一个整体旋转 */
  motion?: PanterMotion;
  /** 背景海报版面：默认 framed；全屏页可用 fullBleed */
  posterLayout?: PosterCanvasLayout;
  /** 左右留白比例（0.15 = 各 15% 黑边） */
  posterHorizontalInset?: number;
  /** 背景海报内容区占容器宽度比例（如 0.75）；不影响玻璃字缩放 */
  posterContentWidthRatio?: number;
};

export type PanterMotion = 'stagger' | 'together';

export type PanterVisionSceneHandle = {
  dispose: () => void;
  setPaused: (paused: boolean) => void;
};

const ChromaticShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uAmount: { value: 0.0012 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uAmount;
    varying vec2 vUv;
    void main() {
      vec2 dir = vUv - 0.5;
      vec2 off = dir * uAmount * length(dir);
      float r = texture2D(tDiffuse, vUv + off).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - off).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
};

/**
 * 默认：黑底 + 白色柔光箱条纹，玻璃表面会反射出参考图里的黑白长条高光。
 * light：浅色底 + 白 / 蓝 / 柠檬绿条纹，用于浅色背景，避免侧面反射出黑影。
 */
function createStudioEnvTexture(light = false): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  if (light) {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#bcd6ee');
    bg.addColorStop(0.5, '#6f90b2');
    bg.addColorStop(1, '#a9c86a');
    ctx.fillStyle = bg;
  } else {
    ctx.fillStyle = '#000';
  }
  ctx.fillRect(0, 0, w, h);

  const softbox = (x: number, y: number, bw: number, bh: number, alpha = 1, rgb = '255,255,255') => {
    const g = ctx.createLinearGradient(x, 0, x + bw, 0);
    g.addColorStop(0, `rgba(${rgb},0)`);
    g.addColorStop(0.15, `rgba(${rgb},${alpha})`);
    g.addColorStop(0.85, `rgba(${rgb},${alpha})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, bw, bh);
  };

  softbox(60, 90, 70, 330);
  softbox(250, 40, 36, 420, 0.9);
  softbox(420, 150, 150, 46);
  softbox(610, 70, 52, 380);
  softbox(760, 120, 26, 300, 0.85);
  softbox(860, 60, 90, 400);
  softbox(300, 470, 420, 20, 0.6);
  softbox(150, 8, 600, 16, 0.7);
  if (light) {
    softbox(150, 60, 80, 380, 0.7, '42,160,255');
    softbox(500, 260, 90, 220, 0.65, '205,255,30');
    softbox(700, 40, 60, 360, 0.55, '120,200,255');
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

type GlassLetter = { geometry: THREE.BufferGeometry; width: number };

/** 每个字母单独成网格并以自身中心为原点，便于逐字错相摆动 */
function createGlassLetters(text: string): { letters: GlassLetter[]; height: number } {
  const font = new FontLoader().parse(helvetikerBold as unknown as THREE.Font['data']);
  const letters: GlassLetter[] = [];
  let height = 0;
  for (const char of text) {
    const raw = new TextGeometry(char, {
      font,
      size: 3,
      depth: 0.5,
      curveSegments: 32,
      bevelEnabled: true,
      bevelThickness: 0.6,
      bevelSize: 0.3,
      bevelOffset: -0.2,
      bevelSegments: 16,
    });
    const geometry = toCreasedNormals(raw, Math.PI / 2.4);
    raw.dispose();
    geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    geometry.boundingBox!.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);
    geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    geometry.boundingBox!.getSize(size);
    letters.push({ geometry, width: size.x });
    height = Math.max(height, size.y);
  }
  return { letters, height: height || 1 };
}

function planeSizeForCamera(cam: THREE.PerspectiveCamera, distance: number) {
  const vFov = (cam.fov * Math.PI) / 180;
  const height = 2 * Math.tan(vFov / 2) * distance;
  return { width: height * cam.aspect, height };
}

export async function createPanterVisionScene({
  container,
  dprCap = 2,
  poster,
  glassText = 'ITZY',
  backdrop,
  motion = 'stagger',
  posterLayout = 'framed',
  posterHorizontalInset = 0,
  posterContentWidthRatio = 0,
}: PanterVisionSceneOptions): Promise<PanterVisionSceneHandle> {
  const width = Math.max(container.clientWidth, 1);
  const height = Math.max(container.clientHeight, 1);
  const dpr = () => Math.min(window.devicePixelRatio, dprCap);

  const posterCanvas = document.createElement('canvas');
  const paintPoster = (w: number, h: number, time: number) => {
    if (!backdrop) {
      drawPosterCanvas(
        posterCanvas,
        w,
        h,
        poster,
        posterLayout,
        posterHorizontalInset,
        posterContentWidthRatio,
      );
      return;
    }
    const pr = Math.min(window.devicePixelRatio, 1.5);
    const cw = Math.max(1, Math.floor(w * pr));
    const ch = Math.max(1, Math.floor(h * pr));
    if (posterCanvas.width !== cw || posterCanvas.height !== ch) {
      posterCanvas.width = cw;
      posterCanvas.height = ch;
    }
    const ctx = posterCanvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(pr, 0, 0, pr, 0, 0);
    backdrop(ctx, w, h, time);
  };
  paintPoster(width, height, 0);
  const posterTex = new THREE.CanvasTexture(posterCanvas);
  posterTex.colorSpace = THREE.SRGBColorSpace;
  posterTex.minFilter = THREE.LinearFilter;
  posterTex.magFilter = THREE.LinearFilter;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr());
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping = backdrop ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 80);
  const posterDistance = 6.5;
  const cameraZ = posterDistance + 3.2;
  camera.position.set(0, 0, cameraZ);

  const { width: planeW, height: planeH } = planeSizeForCamera(camera, cameraZ + posterDistance);
  const posterPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(planeW, planeH),
    new THREE.MeshBasicMaterial({ map: posterTex, toneMapped: false }),
  );
  posterPlane.position.z = -posterDistance;
  scene.add(posterPlane);

  const { letters, height: wordHeight } = createGlassLetters(glassText);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const studioTex = createStudioEnvTexture(!!backdrop);
  const envTex = pmrem.fromEquirectangular(studioTex).texture;
  studioTex.dispose();

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.02,
    transmission: 1,
    thickness: 1.6,
    ior: 1.7,
    dispersion: 7,
    specularIntensity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMap: envTex,
    envMapIntensity: 1.6,
    side: THREE.DoubleSide,
    attenuationColor: new THREE.Color(0xf4f6ff),
    attenuationDistance: 6,
  });

  const glassPivot = new THREE.Group();
  const word = new THREE.Group();
  const gap = wordHeight * 0.02;
  const wordWidth = letters.reduce((sum, l) => sum + l.width, 0) + gap * (letters.length - 1);
  let cursorX = -wordWidth / 2;
  const letterMeshes = letters.map((l) => {
    const mesh = new THREE.Mesh(l.geometry, glassMat);
    mesh.position.x = cursorX + l.width / 2;
    cursorX += l.width + gap;
    word.add(mesh);
    return mesh;
  });
  glassPivot.add(word);
  scene.add(glassPivot);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 4, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.4);
  rim.position.set(-5, -2, 2);
  scene.add(rim);

  const composerTarget = new THREE.WebGLRenderTarget(width * dpr(), height * dpr(), {
    type: THREE.HalfFloatType,
    samples: 4,
  });
  const composer = new EffectComposer(renderer, composerTarget);
  composer.setPixelRatio(dpr());
  composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  const chroma = new ShaderPass(ChromaticShader);
  composer.addPass(chroma);
  composer.addPass(new OutputPass());

  const pointer = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0 };
  const onPointerMove = (e: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };
  container.addEventListener('pointermove', onPointerMove);

  let paused = false;
  let raf = 0;
  let layoutKey = '';
  let posterKey = '';
  const clock = new THREE.Clock();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const layoutScene = (w: number, h: number) => {
    const pr = dpr();
    const k = `${w}x${h}@${pr}`;
    if (k === layoutKey) return;
    layoutKey = k;

    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const plane = planeSizeForCamera(camera, cameraZ + posterDistance);
    posterPlane.geometry.dispose();
    posterPlane.geometry = new THREE.PlaneGeometry(plane.width, plane.height);

    const visible = planeSizeForCamera(camera, cameraZ);
    const layoutFrameW = Math.min(visible.width, visible.height * POSTER_ASPECT);
    const fit = motion === 'together' ? 0.8 : 1.02;
    const scale = Math.min((layoutFrameW * fit) / wordWidth, (visible.height * 0.55) / wordHeight);
    word.scale.setScalar(scale);
    glassPivot.position.set(0, 0, 0);
    glassPivot.userData.baseY = visible.height * 0.04;

    composer.setPixelRatio(pr);
    composer.setSize(w, h);
  };

  const render = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;

    const t = reducedMotion ? 0.6 : clock.getElapsedTime();
    const pk = `${w}x${h}`;
    if (pk !== posterKey || (backdrop && !reducedMotion)) {
      posterKey = pk;
      paintPoster(w, h, t);
      posterTex.needsUpdate = true;
    }
    layoutScene(w, h);

    smooth.x += (pointer.x - smooth.x) * 0.06;
    smooth.y += (pointer.y - smooth.y) * 0.06;

    if (motion === 'together') {
      word.rotation.y = Math.sin(t * 0.5) * 0.5 + smooth.x * 0.35;
      word.rotation.x = Math.sin(t * 0.37 + 0.8) * 0.16 - smooth.y * 0.22;
      word.rotation.z = -0.04 + Math.sin(t * 0.29) * 0.04;
    } else {
      letterMeshes.forEach((mesh, i) => {
        const phase = i * 0.7;
        mesh.rotation.y = Math.sin(t * 0.6 + phase) * 0.55 + smooth.x * 0.3;
        mesh.rotation.x = Math.sin(t * 0.42 + phase + 0.8) * 0.22 - smooth.y * 0.2;
        mesh.position.y = Math.sin(t * 0.9 + phase) * wordHeight * 0.03;
      });
      word.rotation.y = smooth.x * 0.12;
      word.rotation.z = -0.06 + Math.sin(t * 0.29) * 0.04;
    }
    glassPivot.position.y = (glassPivot.userData.baseY ?? 0) + Math.sin(t * 0.8) * 0.04;

    camera.position.x = smooth.x * 0.3;
    camera.position.y = smooth.y * 0.22;
    camera.lookAt(0, 0, 0);

    composer.render();
  };

  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!paused) render();
  };
  tick();

  const ro = new ResizeObserver(() => render());
  ro.observe(container);

  const dispose = () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    container.removeEventListener('pointermove', onPointerMove);
    for (const l of letters) l.geometry.dispose();
    glassMat.dispose();
    posterPlane.geometry.dispose();
    (posterPlane.material as THREE.Material).dispose();
    posterTex.dispose();
    envTex.dispose();
    pmrem.dispose();
    chroma.dispose();
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
