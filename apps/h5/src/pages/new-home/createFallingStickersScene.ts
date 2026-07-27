import * as THREE from 'three';

export type FallingStickersHandle = {
  dispose: () => void;
};

/** Larger than haoqi stickers — readable album heads in the XKM hero. */
const FALL_CONFIG = {
  count: 14,
  scale: 2.0, // was 2.35 · −15%
  scaleJitter: 0.35,
  fallSpeed: 1.65,
  windStrength: 1.6,
  windFrequency: 0.28,
  rotationSpeed: 0.55,
  zOffset: -5.5,
  zDepth: 3.5,
  spawnHeight: 8.5,
  spawnWidth: 13,
  /** Keep circles from overlapping the centered refraction too densely */
  centerClearRadius: 1.8,
} as const;

const albumModules = import.meta.glob<string>('@/assets/img/albumhead/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

const ALBUM_URLS = Object.keys(albumModules)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((k) => albumModules[k]);

const VERT = /* glsl */ `
attribute vec4 uvRect;
attribute float aPhase;
varying vec2 vAtlasUv;
varying vec2 vLocalUv;
varying float vAlpha;
uniform float uTime;
void main() {
  vLocalUv = uv;
  vAtlasUv = uvRect.xy + uv * uvRect.zw;
  vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vAlpha = 0.82 + 0.18 * sin(uTime * 1.6 + aPhase);
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D map;
varying vec2 vAtlasUv;
varying vec2 vLocalUv;
varying float vAlpha;
void main() {
  vec2 p = vLocalUv - 0.5;
  float r = length(p);
  if (r > 0.5) discard;
  float edge = smoothstep(0.5, 0.46, r);
  vec4 c = texture2D(map, vAtlasUv);
  gl_FragColor = vec4(c.rgb, c.a * vAlpha * edge);
}
`;

async function buildAlbumAtlas(urls: string[]) {
  const images = await Promise.all(
    urls.map(
      (url) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        }),
    ),
  );
  const cols = Math.ceil(Math.sqrt(images.length));
  const rows = Math.ceil(images.length / cols);
  const cell = 256;
  const canvas = document.createElement('canvas');
  canvas.width = cols * cell;
  canvas.height = rows * cell;
  const ctx = canvas.getContext('2d')!;
  const rects: THREE.Vector4[] = [];

  images.forEach((img, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const ox = col * cell;
    const oy = row * cell;
    // cover-fit into square cell (balls-style head crop)
    const src = Math.min(img.width, img.height);
    const sx = (img.width - src) / 2;
    const sy = (img.height - src) / 2;
    ctx.drawImage(img, sx, sy, src, src, ox, oy, cell, cell);
    rects.push(
      new THREE.Vector4(ox / canvas.width, oy / canvas.height, cell / canvas.width, cell / canvas.height),
    );
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return { texture, rects };
}

function spawnX(clearR: number, width: number) {
  for (let tries = 0; tries < 12; tries++) {
    const x = (Math.random() - 0.5) * width;
    if (Math.abs(x) > clearR) return x;
  }
  return (Math.random() > 0.5 ? 1 : -1) * (clearR + Math.random() * 2);
}

/**
 * Falling album-head discs (balls textures) for the new_home hero.
 */
export function createFallingStickersScene(
  mount: HTMLElement,
  opts?: { onReady?: () => void },
): FallingStickersHandle {
  let disposed = false;
  const st = FALL_CONFIG;
  const urls = ALBUM_URLS.length ? ALBUM_URLS : [];

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);
  Object.assign(renderer.domElement.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    display: 'block',
    pointerEvents: 'none',
  });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  camera.position.set(0, 0.12, 10.6);

  let stickerMesh: THREE.InstancedMesh | null = null;
  const stickerStates: {
    x: number;
    y: number;
    z: number;
    vy: number;
    rot: number;
    vr: number;
    windPhase: number;
    scale: number;
  }[] = [];

  const boot = async () => {
    if (!urls.length) {
      opts?.onReady?.();
      return;
    }
    const { texture, rects } = await buildAlbumAtlas(urls);
    if (disposed) {
      texture.dispose();
      return;
    }

    const count = Math.min(st.count, Math.max(rects.length, 8));
    const geo = new THREE.PlaneGeometry(1, 1);
    const uvRect = new THREE.InstancedBufferAttribute(new Float32Array(count * 4), 4);
    const aPhase = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
    geo.setAttribute('uvRect', uvRect);
    geo.setAttribute('aPhase', aPhase);

    const mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: texture }, uTime: { value: 0 } },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    stickerMesh = new THREE.InstancedMesh(geo, mat, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const ri = i % rects.length;
      uvRect.setXYZW(i, rects[ri].x, rects[ri].y, rects[ri].z, rects[ri].w);
      aPhase.setX(i, Math.random() * Math.PI * 2);
      const scale = st.scale * (1 - st.scaleJitter / 2 + Math.random() * st.scaleJitter);
      stickerStates.push({
        x: spawnX(st.centerClearRadius, st.spawnWidth),
        y: st.spawnHeight * (0.35 + Math.random() * 0.75),
        z: st.zOffset - Math.random() * st.zDepth,
        vy: -(0.014 + Math.random() * 0.01) * (st.fallSpeed / 1.8),
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * st.rotationSpeed * 0.04,
        windPhase: Math.random() * Math.PI * 2,
        scale,
      });
      dummy.position.set(stickerStates[i].x, stickerStates[i].y, stickerStates[i].z);
      dummy.rotation.z = stickerStates[i].rot;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      stickerMesh.setMatrixAt(i, dummy.matrix);
    }
    stickerMesh.instanceMatrix.needsUpdate = true;
    scene.add(stickerMesh);
    opts?.onReady?.();
  };

  void boot().catch((err) => {
    console.error('[new_home] falling stickers failed', err);
    opts?.onReady?.();
  });

  const clock = new THREE.Clock();
  let raf = 0;

  const resize = () => {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    if (w < 1 || h < 1) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(mount);

  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (disposed) return;
    const t = clock.getElapsedTime();
    if (stickerMesh) {
      (stickerMesh.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      const dummy = new THREE.Object3D();
      for (let i = 0; i < stickerStates.length; i++) {
        const s = stickerStates[i];
        s.x += Math.sin(t * st.windFrequency + s.windPhase) * st.windStrength * 0.0018;
        s.y += s.vy;
        s.rot += s.vr;
        if (s.y < -7.5) {
          s.y = st.spawnHeight * (0.5 + Math.random() * 0.5);
          s.x = spawnX(st.centerClearRadius, st.spawnWidth);
          s.windPhase = Math.random() * Math.PI * 2;
        }
        dummy.position.set(s.x, s.y, s.z);
        dummy.rotation.z = s.rot;
        dummy.scale.setScalar(s.scale);
        dummy.updateMatrix();
        stickerMesh.setMatrixAt(i, dummy.matrix);
      }
      stickerMesh.instanceMatrix.needsUpdate = true;
    }
    renderer.render(scene, camera);
  };
  tick();

  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      stickerMesh?.geometry.dispose();
      const mat = stickerMesh?.material as THREE.ShaderMaterial | undefined;
      mat?.uniforms.map.value?.dispose?.();
      mat?.dispose?.();
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    },
  };
}
