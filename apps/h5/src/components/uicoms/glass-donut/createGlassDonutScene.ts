import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

export type GlassDonutSceneOptions = {
  container: HTMLElement;
  dprCap?: number;
};

export type GlassDonutSceneHandle = {
  dispose: () => void;
  setPaused: (paused: boolean) => void;
};

/** 彩虹环境贴图，供玻璃透射拾色（类似棱镜折射背景） */
function createPrismEnvTexture(): THREE.CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    fallback.mapping = THREE.EquirectangularReflectionMapping;
    return fallback;
  }

  const bands: [number, string][] = [
    [0, '#1a0a2e'],
    [0.08, '#ff2d6a'],
    [0.22, '#ffb800'],
    [0.38, '#3dff9a'],
    [0.52, '#00c8ff'],
    [0.66, '#8b5cff'],
    [0.82, '#ff6ec7'],
    [1, '#0d1020'],
  ];

  const grad = ctx.createLinearGradient(0, 0, w, h * 0.6);
  for (const [stop, color] of bands) grad.addColorStop(stop, color);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 12; i++) {
    const x = (w * (0.1 + (i * 0.73) % 0.8)) | 0;
    const y = (h * (0.15 + (i * 0.41) % 0.55)) | 0;
    const r = 40 + (i % 5) * 28;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const hues = ['#ffffff', '#88eeff', '#ff88cc', '#ffff88'];
    g.addColorStop(0, hues[i % hues.length]);
    g.addColorStop(0.35, `${hues[i % hues.length]}88`);
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uAmount: { value: 0.0018 },
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
      float dist = length(dir);
      vec2 off = dir * uAmount * dist;
      float r = texture2D(tDiffuse, vUv + off).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - off).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
};

export function createGlassDonutScene({
  container,
  dprCap = 2,
}: GlassDonutSceneOptions): GlassDonutSceneHandle {
  const width = Math.max(container.clientWidth, 1);
  const height = Math.max(container.clientHeight, 1);
  const dpr = () => Math.min(window.devicePixelRatio, dprCap);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr());
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x050508, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const envMap = createPrismEnvTexture();
  scene.environment = envMap;
  scene.background = new THREE.Color(0x050508);

  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
  camera.position.set(0, 0.15, 4.2);

  const donutGroup = new THREE.Group();

  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(1.05, 0.42, 128, 256),
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffffff),
      metalness: 0,
      roughness: 0.04,
      transmission: 1,
      thickness: 1.35,
      ior: 1.52,
      specularIntensity: 1,
      specularColor: new THREE.Color(0xffffff),
      envMapIntensity: 1.85,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      transparent: true,
      side: THREE.DoubleSide,
    }),
  );
  donutGroup.add(torus);

  const innerGlow = new THREE.Mesh(
    new THREE.TorusGeometry(1.02, 0.36, 64, 128),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.04,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  donutGroup.add(innerGlow);

  scene.add(donutGroup);

  const lightRig = new THREE.Group();
  const makeLight = (color: number, intensity: number) => {
    const l = new THREE.PointLight(color, intensity, 12, 2);
    lightRig.add(l);
    return l;
  };
  const lights = [
    makeLight(0xff4488, 2.4),
    makeLight(0x44ccff, 2.2),
    makeLight(0xffee55, 1.8),
    makeLight(0xaa66ff, 2.0),
  ];
  scene.add(lightRig);
  scene.add(new THREE.AmbientLight(0x404060, 0.35));

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(dpr());
  composer.setSize(width, height);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.35, 0.25, 0.72);
  composer.addPass(bloom);
  const chroma = new ShaderPass(ChromaticAberrationShader);
  composer.addPass(chroma);
  composer.addPass(new OutputPass());

  const pointer = { x: 0, y: 0 };
  const onPointerMove = (e: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };
  container.addEventListener('pointermove', onPointerMove);

  let paused = false;
  let raf = 0;
  const clock = new THREE.Clock();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (paused) return;

    const t = clock.getElapsedTime();
    const spin = reducedMotion ? 0.4 : t;

    donutGroup.rotation.x = spin * 0.42 + pointer.y * 0.12;
    donutGroup.rotation.y = spin * 0.58 + pointer.x * 0.18;
    donutGroup.rotation.z = Math.sin(spin * 0.31) * 0.08;

    for (let i = 0; i < lights.length; i++) {
      const a = spin * (0.55 + i * 0.11) + i * (Math.PI / 2);
      const r = 2.8 + (i % 2) * 0.4;
      lights[i].position.set(Math.cos(a) * r, Math.sin(a * 0.7) * 1.2, Math.sin(a) * r);
    }
    lightRig.rotation.y = spin * 0.15;

    camera.position.x = pointer.x * 0.35;
    camera.position.y = 0.15 + pointer.y * 0.2;
    camera.lookAt(0, 0, 0);

    chroma.uniforms.uAmount.value = 0.0012 + Math.sin(spin * 0.5) * 0.0004;
    composer.render();
  };
  tick();

  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
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
    container.removeEventListener('pointermove', onPointerMove);
    torus.geometry.dispose();
    (torus.material as THREE.Material).dispose();
    innerGlow.geometry.dispose();
    (innerGlow.material as THREE.Material).dispose();
    envMap.dispose();
    bloom.dispose();
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
