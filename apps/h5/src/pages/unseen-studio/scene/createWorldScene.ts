import * as THREE from 'three';
import { proxiedMediaUrl, type WorldItem } from '../data/types';

export type WorldSceneHandle = {
  dispose: () => void;
  setEnabled: (on: boolean) => void;
};

type CreateOpts = {
  canvas: HTMLCanvasElement;
  items: WorldItem[];
  onSelect?: (item: WorldItem | null) => void;
};

/** Fibonacci sphere points · evenly distribute n samples on unit sphere */
function fibSphere(n: number): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i += 1) {
    const y = 1 - (i / Math.max(n - 1, 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    out.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
  }
  return out;
}

/**
 * PARTIAL · World drag globe (media cards on a sphere; production uses denser WebGL sphere).
 */
export async function createWorldScene({ canvas, items, onSelect }: CreateOpts): Promise<WorldSceneHandle> {
  let disposed = false;
  let enabled = false;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0c0c0c, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0c0c0c, 10, 32);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0.15, 11.5);

  const root = new THREE.Group();
  scene.add(root);

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  const cards: { mesh: THREE.Mesh; item: WorldItem }[] = [];
  const media = items.filter((i) => i.file);
  const radius = 6.4;
  const videoEls: HTMLVideoElement[] = [];
  const pts = fibSphere(media.length);

  await Promise.all(
    media.map(async (item, i) => {
      const dir = pts[i] ?? new THREE.Vector3(0, 1, 0);
      const w = (item.size?.[0] ?? 400) / 512;
      const h = (item.size?.[1] ?? 500) / 512;
      const geo = new THREE.PlaneGeometry(Math.min(w, 1.2) * 1.05, Math.min(h, 1.45) * 1.05);
      let map: THREE.Texture | null = null;

      if (item.type === 'video') {
        const video = document.createElement('video');
        video.src = proxiedMediaUrl(item.file);
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'metadata';
        void video.play().catch(() => undefined);
        videoEls.push(video);
        map = new THREE.VideoTexture(video);
        map.colorSpace = THREE.SRGBColorSpace;
      } else {
        const url = proxiedMediaUrl(item.file);
        map = await new Promise<THREE.Texture | null>((resolve) => {
          loader.load(
            url,
            (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
              resolve(tex);
            },
            undefined,
            () => resolve(null),
          );
        });
      }

      const mat = new THREE.MeshBasicMaterial({
        ...(map ? { map } : {}),
        color: map ? 0xffffff : new THREE.Color(item.color || '#444'),
        side: THREE.DoubleSide,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(dir).multiplyScalar(radius);
      mesh.lookAt(0, 0, 0);
      mesh.rotateY(Math.PI);
      mesh.userData.itemId = item.id;
      root.add(mesh);
      cards.push({ mesh, item });
    }),
  );

  if (disposed) {
    renderer.dispose();
    throw new Error('disposed');
  }

  const drag = { active: false, lastX: 0, lastY: 0, velX: 0, velY: 0, moved: 0 };
  let yaw = 0.4;
  let pitch = -0.12;

  const onPointerDown = (e: PointerEvent) => {
    drag.active = true;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    drag.moved = 0;
    canvas.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!drag.active) return;
    const dx = e.clientX - drag.lastX;
    const dy = e.clientY - drag.lastY;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    drag.velX = dx * 0.0045;
    drag.velY = dy * 0.003;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    yaw += drag.velX;
    pitch = THREE.MathUtils.clamp(pitch + drag.velY, -0.75, 0.75);
  };
  const onPointerUp = (e: PointerEvent) => {
    drag.active = false;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };
  const onClick = (e: MouseEvent) => {
    if (drag.moved > 8) return;
    const rect = canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(cards.map((c) => c.mesh));
    if (hits.length) {
      const id = hits[0].object.userData.itemId as string;
      const found = cards.find((c) => c.item.id === id);
      onSelect?.(found?.item ?? null);
    } else {
      onSelect?.(null);
    }
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('click', onClick);

  const onResize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  onResize();

  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!enabled) return;
    if (!drag.active) {
      yaw += drag.velX;
      pitch = THREE.MathUtils.clamp(pitch + drag.velY, -0.75, 0.75);
      drag.velX *= 0.94;
      drag.velY *= 0.94;
    }
    root.rotation.y = yaw;
    root.rotation.x = pitch;
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);
  window.addEventListener('resize', onResize);

  return {
    setEnabled(on) {
      enabled = on;
      if (on) {
        onResize();
        videoEls.forEach((v) => void v.play().catch(() => undefined));
      } else {
        videoEls.forEach((v) => v.pause());
      }
    },
    dispose() {
      disposed = true;
      enabled = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('click', onClick);
      videoEls.forEach((v) => {
        v.pause();
        v.src = '';
      });
      cards.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.map?.dispose();
        mat.dispose();
      });
      renderer.dispose();
    },
  };
}
