import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import ticketBgUrl from '@/assets/ticket-bg.png';
import { fragmentShader, vertexShader } from './shaders';

type Item = {
  el: HTMLElement;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
};

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

function isMobile() {
  return window.matchMedia?.('(max-width: 768px)')?.matches ?? false;
}

function makePaperTextureUrl(seed: number) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 640;
  const ctx = c.getContext('2d');
  if (!ctx) return ticketBgUrl;
  ctx.fillStyle = '#f1f1f1';
  ctx.fillRect(0, 0, c.width, c.height);
  const g = ctx.createLinearGradient(0, 0, c.width, c.height);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.45, '#eaeaea');
  g.addColorStop(1, '#d6d6d6');
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);

  // brutalist black blocks
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#0a0a0a';
  for (let i = 0; i < 10; i++) {
    const w = 40 + ((seed * 97 + i * 31) % 140);
    const h = 6 + ((seed * 41 + i * 29) % 22);
    const x = ((seed * 53 + i * 79) % (c.width - w)) | 0;
    const y = ((seed * 67 + i * 47) % (c.height - h)) | 0;
    ctx.fillRect(x, y, w, h);
  }

  // noise
  const img = ctx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = ((Math.sin(i * 0.00001 + seed) + 1) * 0.5 * 22) | 0;
    img.data[i] = Math.min(255, img.data[i] + n);
    img.data[i + 1] = Math.min(255, img.data[i + 1] + n);
    img.data[i + 2] = Math.min(255, img.data[i + 2] + n);
  }
  ctx.putImageData(img, 0, 0);

  return c.toDataURL('image/png');
}

function makeDisplacementMaskUrl(seed: number) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (!ctx) return ticketBgUrl;

  const img = ctx.createImageData(c.width, c.height);
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4;
      const nx = x / c.width;
      const ny = y / c.height;
      // reveal order map, shaped like letter paper:
      // start from one corner (bottom-right), expand like book opening.
      const dx = 1 - nx;
      const dy = 1 - ny;
      const d = Math.sqrt(dx * dx + dy * dy); // 0 at corner, ~1.41 farthest
      let g = Math.max(0, Math.min(1, d / 1.22));

      // fold corner impression (a diagonal band)
      const fold = Math.abs((nx + ny) - 1.78);
      const foldBand = Math.max(0, Math.min(1, 1 - fold * 26));
      g = Math.max(0, Math.min(1, g * (0.94 + foldBand * 0.14)));

      // tiny fiber noise so edge isn't perfectly uniform
      const n =
        Math.sin((nx * 17.0 + seed * 0.7) * Math.PI) * 0.06 +
        Math.sin((ny * 19.0 + seed * 1.3) * Math.PI) * 0.05 +
        Math.sin((nx * 31.0 + ny * 23.0 + seed * 2.1) * Math.PI) * 0.04;
      g = Math.max(0, Math.min(1, g + n));

      // push values so early progress only reveals a corner
      g = Math.pow(g, 0.92);
      const v = (g * 255) | 0;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // soften edges a bit
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);

  return c.toDataURL('image/png');
}

function clamp01(n: number) {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function computeViewportProgress(r: DOMRect, vh: number) {
  // 0 when element is below viewport, 1 when fully inside, then back to 0 as it leaves
  const enter = clamp01((vh - r.top) / Math.max(1, vh));
  const leave = clamp01((r.bottom) / Math.max(1, vh));
  // keep a peak around middle
  const p = Math.min(enter, leave);
  // remap so it hits 1 sooner and holds longer
  return clamp01(p * 1.35);
}

export default function WebGLOverlay({
  selector = '[data-webgl-media]',
  getScrollVelocity,
}: {
  selector?: string;
  getScrollVelocity: () => number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const itemsRef = useRef<Item[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  const textureUrls = useMemo(() => [makePaperTextureUrl(1), makePaperTextureUrl(2), ticketBgUrl], []);
  const maskUrls = useMemo(() => [makeDisplacementMaskUrl(7), makeDisplacementMaskUrl(11)], []);

  useEffect(() => {
    if (prefersReducedMotion() || isMobile()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -2000, 2000);
    scene.add(camera);

    const loader = new THREE.TextureLoader();
    const textures = textureUrls.map((u) => {
      const t = loader.load(u);
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      return t;
    });
    const masks = maskUrls.map((u) => {
      const t = loader.load(u);
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      return t;
    });

    const geo = new THREE.PlaneGeometry(1, 1, 32, 32);

    const rebuild = () => {
      // cleanup old
      for (const it of itemsRef.current) {
        it.mesh.geometry.dispose();
        it.mesh.material.dispose();
        scene.remove(it.mesh);
      }
      itemsRef.current = [];

      const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
      els.forEach((el, idx) => {
        const mat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: {
            uTexture: { value: textures[idx % textures.length] },
            uMask: { value: masks[idx % masks.length] },
            uTime: { value: 0 },
            uScroll: { value: 0 },
            uVelocity: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uProgress: { value: 0 },
          },
          vertexShader,
          fragmentShader,
        });
        const mesh = new THREE.Mesh(geo.clone(), mat);
        scene.add(mesh);
        itemsRef.current.push({ el, mesh });
      });
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
    };

    const updateMeshes = (t: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      const v = getScrollVelocity();
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const it of itemsRef.current) {
        const r = it.el.getBoundingClientRect();
        const x = r.left + r.width / 2 - w / 2;
        const y = h / 2 - (r.top + r.height / 2);
        it.mesh.position.set(x, y, 0);
        it.mesh.scale.set(r.width, r.height, 1);

        const mat = it.mesh.material;
        mat.uniforms.uTime.value = t;
        mat.uniforms.uVelocity.value = v;
        mat.uniforms.uMouse.value.set(mx, my);
        mat.uniforms.uProgress.value = computeViewportProgress(r, h);
      }

      renderer.render(scene, camera);
    };

    const onMouse = (e: MouseEvent) => {
      const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      mouseRef.current.x = nx;
      mouseRef.current.y = -ny;
    };

    const tick = (ms: number) => {
      const t = ms * 0.001;
      updateMeshes(t);
      rafRef.current = requestAnimationFrame(tick);
    };

    resize();
    rebuild();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouse);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
      rebuild();
      renderer.dispose();
      textures.forEach((t) => t.dispose());
      masks.forEach((t) => t.dispose());
    };
  }, [getScrollVelocity, maskUrls, selector, textureUrls]);

  return <canvas className="pf-webgl" ref={canvasRef} />;
}

