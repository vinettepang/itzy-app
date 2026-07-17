import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { UNSEEN_ASSETS } from '../assetPaths';
import { proxiedMediaUrl, type ProjectItem } from '../data/types';
import { createButterflies } from './createButterflies';
import { createProjectCardMaterial } from './createProjectCardMaterial';

export type ProjectMenuHandle = {
  dispose: () => void;
  setEnabled: (on: boolean) => void;
  setFilter: (filter: string, opts?: { animate?: boolean }) => void;
  playEnter: () => void;
};

type CreateOpts = {
  canvas: HTMLCanvasElement;
  projects: ProjectItem[];
  onSelect?: (project: ProjectItem) => void;
};

const MESH_SIZE = new THREE.Vector2(820, 430);
/** SOURCE · meshSizeMultiplers */
const MESH_MULT = { default: 0.21, sm: 0.3, md: 0.28, lg: 0.35 } as const;

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * ProjectMenu scroll wall (SOURCE buildProjects / positionProjects + Ts/Ss bend).
 * FOV calibrated to z=2000 · cards at z=1000 · camera must stay near z≈2000.
 */
type CanvasWithGen = HTMLCanvasElement & { __usPMGen?: number };

export async function createProjectMenuScene({
  canvas,
  projects,
  onSelect,
}: CreateOpts): Promise<ProjectMenuHandle> {
  let disposed = false;
  let enabled = false;
  let allowControl = false;
  let enterPlayed = false;
  let filter = 'all';

  // StrictMode / remount: only the latest create may attach a WebGLRenderer to this canvas.
  const host = canvas as CanvasWithGen;
  const gen = (host.__usPMGen = (host.__usPMGen ?? 0) + 1);

  const draco = new DRACOLoader();
  draco.setDecoderPath('/draco/gltf/');
  const gltf = new GLTFLoader();
  gltf.setDRACOLoader(draco);

  // Load assets before creating a renderer so stale mounts never steal the canvas context.
  const [archGltf, floorGltf, butterflyGltf] = await Promise.all([
    new Promise<THREE.Group>((res, rej) =>
      gltf.load(`${UNSEEN_ASSETS}models/project-menu/arch-dc.glb`, (g) => res(g.scene), undefined, rej),
    ),
    new Promise<THREE.Group>((res, rej) =>
      gltf.load(`${UNSEEN_ASSETS}models/project-menu/floor-dc.glb`, (g) => res(g.scene), undefined, rej),
    ),
    new Promise<THREE.Group>((res, rej) =>
      gltf.load(`${UNSEEN_ASSETS}models/project-menu/butterfly.glb`, (g) => res(g.scene), undefined, rej),
    ),
  ]);

  if (disposed || host.__usPMGen !== gen) {
    draco.dispose();
    throw new Error('stale project-menu create');
  }

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xe5e5e5, 1);

  const ktx2 = new KTX2Loader();
  ktx2.setTranscoderPath(`${UNSEEN_ASSETS}basis/`);
  ktx2.detectSupport(renderer);
  gltf.setKTX2Loader(ktx2);

  const archTex = await new Promise<THREE.Texture>((res, rej) =>
    ktx2.load(`${UNSEEN_ASSETS}images/project-menu/arch.ktx2`, res, undefined, rej),
  );

  if (disposed || host.__usPMGen !== gen) {
    archTex.dispose();
    renderer.dispose();
    ktx2.dispose();
    draco.dispose();
    throw new Error('stale project-menu create');
  }

  archTex.colorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe5e5e5);
  scene.fog = new THREE.Fog(0xe5e5e5, 500, 4500);

  // SOURCE · initialCameraPos=2000; FOV from that z (1wu≈1css-px at d=camZ)
  // Cards at z=1000 → d=1000 when camera rests at 2000 → magnification ×2 (matches theme layout).
  const INITIAL_CAM_Z = 2000;
  const CARD_Z = 1000;
  /** SOURCE rest · calibrated card scale (world→projects uses Z; home→projects uses Y). */
  const REST_Z_OFFSET = 0;
  /** SOURCE Highway homeContact→projectMenu · cameraYOffset from 2*vh → 0 over ~3s */
  const ENTER_Y_VH = 2;
  const ENTER_DURATION = 3;
  const easePower4InOut = (t: number) => {
    const x = THREE.MathUtils.clamp(t, 0, 1);
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
  };
  const camera = new THREE.PerspectiveCamera(42, 1, 80, 4500);
  const fovFromZ = (h: number, z: number) => (2 * Math.atan(h / 2 / z) * 180) / Math.PI;
  camera.fov = fovFromZ(window.innerHeight, INITIAL_CAM_Z);
  camera.position.set(0, 0, INITIAL_CAM_Z);
  camera.updateProjectionMatrix();
  camera.lookAt(0, 0, 0);

  const root = new THREE.Group();
  scene.add(root);

  const matcapColor = new THREE.Color(0xe5e5e5);
  const archMat = new THREE.MeshBasicMaterial({ map: archTex, color: matcapColor });
  let archGeo: THREE.BufferGeometry | null = null;
  archGltf.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!archGeo && m.isMesh) archGeo = m.geometry;
  });
  const arches = archGeo ? new THREE.InstancedMesh(archGeo, archMat, 5) : null;
  if (arches) {
    const dummy = new THREE.Object3D();
    dummy.scale.setScalar(300);
    dummy.rotation.set(0, THREE.MathUtils.degToRad(90), 0);
    const archLength = 2 * 300;
    for (let i = 0; i < 5; i += 1) {
      dummy.position.set(0, 300, -archLength * i);
      dummy.updateMatrix();
      arches.setMatrixAt(i, dummy.matrix);
    }
    arches.position.z = 200;
    root.add(arches);
  }

  const floorMat = new THREE.MeshBasicMaterial({
    color: 0xd4cdc4,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  let floorGeo: THREE.BufferGeometry | null = null;
  floorGltf.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!floorGeo && m.isMesh) floorGeo = m.geometry;
  });
  const floor = floorGeo ? new THREE.InstancedMesh(floorGeo, floorMat, 3) : null;
  if (floor && floorGeo) {
    floorGeo.rotateY(THREE.MathUtils.degToRad(-90));
    const dummy = new THREE.Object3D();
    dummy.scale.setScalar(300);
    floorGeo.computeBoundingBox();
    const bb = floorGeo.boundingBox!;
    const floorLength = (-bb.min.z + bb.max.z) * 300 * 2 - 70;
    for (let i = 0; i < 3; i += 1) {
      dummy.position.set(0, -300, -0.5 * floorLength * i);
      dummy.rotation.set(0, THREE.MathUtils.degToRad(180) * (i % 2), 0);
      dummy.updateMatrix();
      floor.setMatrixAt(i, dummy.matrix);
    }
    floor.position.z = 0.3 * floorLength;
    root.add(floor);
  }

  let butterflyGeo: THREE.BufferGeometry | null = null;
  butterflyGltf.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!butterflyGeo && m.isMesh && m.geometry) butterflyGeo = m.geometry;
  });
  const butterflies = butterflyGeo ? createButterflies({ geometry: butterflyGeo, count: 40 }) : null;
  if (butterflies) root.add(butterflies.mesh);

  const projectsGroup = new THREE.Group();
  scene.add(projectsGroup);

  const texLoader = new THREE.TextureLoader();
  texLoader.setCrossOrigin('anonymous');

  type CardMat = ReturnType<typeof createProjectCardMaterial>;
  type Card = {
    group: THREE.Group;
    item: ProjectItem;
    imageMesh: THREE.Mesh;
    labelMesh: THREE.Mesh;
    bbox: THREE.Box3;
    cardMat: CardMat;
    labelMat: CardMat;
    labelTex: THREE.CanvasTexture;
    innerScale: number;
    innerScaleTarget: number;
    baseX: number;
    baseY: number;
    stagger: number;
    enter: number;
  };
  const cards: Card[] = [];

  const makeLabelTexture = (title: string, desc: string) => {
    const c = document.createElement('canvas');
    c.width = 820;
    c.height = 74;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = '600 26px "Neue Montreal", sans-serif';
    ctx.fillText(title, 0, 0);
    ctx.font = '400 26px "Neue Montreal", sans-serif';
    ctx.fillText(desc, 0, 32);
    ctx.fillRect(0, c.height - 1.5, c.width, 1.5);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  // SOURCE · PlaneGeometry(1,1,12,12) + Ts/Ss bend shaders
  projects.forEach((item, index) => {
    const group = new THREE.Group();
    group.name = item.title;
    group.userData.projectId = item.id;

    const cardMat = createProjectCardMaterial({
      map: null,
      color: item.bg || '#c8bfb6',
      fogColor: 0xe5e5e5,
      fogNear: 500,
      fogFar: 4500,
      heightOffset: 1,
    });
    cardMat.setOpacity(0);
    const imageMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 12, 12), cardMat.material);
    imageMesh.renderOrder = index;
    imageMesh.frustumCulled = false;
    group.add(imageMesh);

    const labelTex = makeLabelTexture(item.title, item.description);
    const labelMat = createProjectCardMaterial({
      map: labelTex,
      fogColor: 0xe5e5e5,
      fogNear: 500,
      fogFar: 4500,
      heightOffset: 430 / 74,
    });
    labelMat.setOpacity(0);
    const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 12, 12), labelMat.material);
    labelMesh.renderOrder = index + 1;
    labelMesh.frustumCulled = false;
    group.add(labelMesh);

    cards.push({
      group,
      item,
      imageMesh,
      labelMesh,
      bbox: new THREE.Box3(),
      cardMat,
      labelMat,
      labelTex,
      innerScale: 1,
      innerScaleTarget: 1,
      baseX: 0,
      baseY: 0,
      stagger: index * 0.055,
      enter: 0,
    });
    projectsGroup.add(group);

    if (item.image) {
      texLoader.load(
        proxiedMediaUrl(item.image),
        (tex) => {
          if (disposed) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          cardMat.setMap(tex);
        },
        undefined,
        () => undefined,
      );
    }
  });

  let projectsHeight = 0;

  const meshMultForWidth = () => {
    const w = window.innerWidth;
    if (w >= 1366) return MESH_MULT.lg;
    if (w >= 1024) return MESH_MULT.md;
    if (w >= 768) return MESH_MULT.sm;
    return MESH_MULT.default;
  };

  const positionProjects = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const mult = meshMultForWidth();
    // SOURCE · sceneScale = w/2150; boost only lg/xlg
    const sceneScale = w / 2150;
    let c = 1;
    if (w >= 1921) c = sceneScale + 0.2;
    else if (w >= 1366) c = sceneScale + 0.3;

    const cols = w >= 1024 ? 2 : 1;
    const gap = (w >= 1024 ? 20 : 10) * c;
    const r = MESH_SIZE.clone().multiplyScalar(mult * c);

    // Fit guard · FOV mag ≈ INITIAL/(INITIAL-CARD_Z-REST) when camera rests near z=2000
    const mag = INITIAL_CAM_Z / Math.max(INITIAL_CAM_Z - CARD_Z - REST_Z_OFFSET, 1);
    const maxCardW = cols > 1 ? (w * 0.78 - gap) / 2 : w * 0.7;
    const apparent = r.x * mag;
    const fit = apparent > maxCardW && apparent > 1 ? maxCardW / apparent : 1;
    r.multiplyScalar(fit);
    const labelMult = mult * c * fit;
    const rowH = r.y + 24;

    // SOURCE · bendPoint bands (positionProjects)
    const bend = new THREE.Vector2();
    if (w >= 1024) bend.set(100, 700).multiplyScalar(h / 1100);
    else if (w >= 768) bend.set(100, 500);
    else bend.set(100, 600);

    let u = 0;
    projectsHeight = 0;

    cards.forEach((card) => {
      const cats = card.item.categories ?? [];
      if (filter === 'all') {
        card.group.visible = cats.length === 0 || !cats.includes('experiment');
      } else {
        card.group.visible = cats.includes(filter);
      }
      if (!card.group.visible) {
        card.cardMat.setOpacity(0);
        card.labelMat.setOpacity(0);
        return;
      }

      card.group.userData.baseScaleX = r.x;
      card.group.userData.baseScaleY = r.y;
      card.imageMesh.scale.set(r.x, r.y, 1);
      card.cardMat.setMeshSize(r.x, r.y);
      card.cardMat.setBendPoint(bend.x, bend.y);
      const lw = 820 * labelMult;
      const lh = 74 * labelMult;
      card.labelMesh.scale.set(lw, lh, 1);
      card.labelMat.setMeshSize(820, 74);
      card.labelMat.setBendPoint(bend.x, bend.y);
      card.labelMesh.position.set(0.5 * -r.x + 0.5 * lw, 0.5 * -r.y - 0.5 * lh - 6, 2);

      let x = (u % cols) * r.x;
      let y = Math.floor(u / cols) * rowH - h * 0.15;
      x += (u % cols) * gap;
      y += Math.floor(u / cols) * gap;
      if (cols > 1) x -= 0.5 * (r.x + gap);

      card.baseX = x;
      card.baseY = -y;
      card.stagger = u * 0.055;
      card.group.position.set(x, -y, CARD_Z);
      if (u % cols === 0) projectsHeight += rowH;
      card.bbox.setFromObject(card.group);
      u += 1;
    });

    projectsHeight = Math.max(0, projectsHeight - rowH + 250 + 0.1 * h);
  };

  positionProjects();

  let scrollPos = 0;
  let smoothScrollPos = 0;
  let scrollDelta = 0;
  let smoothScrollDelta = 0;
  let scrollVelocity = 0;
  let cameraZOffset = REST_Z_OFFSET;
  // Park wall below viewport until route-triggered playEnter (SOURCE 2*vh)
  let cameraYOffset = ENTER_Y_VH * window.innerHeight;
  let enterClock = -1; // seconds since playEnter; -1 = idle
  let enterAnimActive = false;
  let waterfallActive = false;

  const clampScroll = () => {
    scrollPos = THREE.MathUtils.clamp(scrollPos, 0, Math.max(0, projectsHeight));
  };

  const onWheel = (e: WheelEvent) => {
    if (!enabled || !allowControl) return;
    e.preventDefault();
    scrollPos += e.deltaY;
    clampScroll();
  };

  const drag = { active: false, lastY: 0, moved: 0 };
  const onPointerDown = (e: PointerEvent) => {
    if (!allowControl) return;
    drag.active = true;
    drag.lastY = e.clientY;
    drag.moved = 0;
    canvas.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!drag.active || !allowControl) return;
    const dy = e.clientY - drag.lastY;
    drag.lastY = e.clientY;
    drag.moved += Math.abs(dy);
    scrollPos += 1.5 * -dy;
    clampScroll();
  };
  const onPointerUp = (e: PointerEvent) => {
    drag.active = false;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  let hovered: Card | null = null;

  const onClick = (e: MouseEvent) => {
    if (!allowControl || drag.moved > 10) return;
    const rect = canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, camera);
    const meshes = cards.filter((c) => c.group.visible).map((c) => c.imageMesh);
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
      const card = cards.find((c) => c.imageMesh === hits[0].object);
      if (card?.item.link) onSelect?.(card.item);
    }
  };

  const onHoverMove = (e: PointerEvent) => {
    if (!allowControl || drag.active) return;
    const rect = canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, camera);
    const meshes = cards.filter((c) => c.group.visible).map((c) => c.imageMesh);
    const hits = raycaster.intersectObjects(meshes);
    const next = hits.length ? cards.find((c) => c.imageMesh === hits[0].object) ?? null : null;
    if (hovered !== next) {
      if (hovered) hovered.innerScaleTarget = 1;
      hovered = next;
      if (hovered) hovered.innerScaleTarget = 1.1;
      canvas.style.cursor = next ? 'pointer' : 'grab';
    }
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointermove', onHoverMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('click', onClick);

  const onResize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    camera.aspect = w / Math.max(h, 1);
    camera.fov = fovFromZ(h, INITIAL_CAM_Z);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    const sceneScale = w / 2150;
    if (arches) arches.scale.set(sceneScale, sceneScale * (w >= 768 ? 1 : 1.75), 1);
    if (floor) floor.scale.set(sceneScale, sceneScale * (w >= 768 ? 1 : 1.75), 1);
    positionProjects();
    clampScroll();
  };
  onResize();

  let raf = 0;
  const clock = new THREE.Clock();

  const studioEntered = () => !!document.querySelector('.unseen-studio.is-entered');

  const playEnterInternal = () => {
    if (disposed) return;
    enterPlayed = true;
    enabled = true;
    // SOURCE · fromTo(cameraYOffset, 2*window.h → 0, duration 3, power4.inOut)
    cameraYOffset = ENTER_Y_VH * window.innerHeight;
    cameraZOffset = REST_Z_OFFSET;
    scrollPos = 0;
    smoothScrollPos = 0;
    scrollVelocity = 0;
    allowControl = false;
    enterAnimActive = true;
    waterfallActive = false;
    enterClock = 0;
    positionProjects();
    cards.forEach((c) => {
      c.enter = 1;
      if (!c.group.visible) {
        c.cardMat.setOpacity(0);
        c.labelMat.setOpacity(0);
        return;
      }
      c.cardMat.setOpacity(1);
      c.labelMat.setOpacity(1);
      c.group.position.set(c.baseX, c.baseY, CARD_Z);
      c.group.rotation.set(0, 0, 0);
    });
    window.dispatchEvent(new CustomEvent('us-projects-enter-ui'));
  };

  const ensureEntered = () => {
    if (disposed) return;
    if (!studioEntered()) return;
    if (!enabled) enabled = true;
    // Enter animation is owned by RouteTransition / ProjectMenuCanvas (`us-projects-enter`)
  };

  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (disposed) return;

    // Survive React remount races: DOM is the source of truth for Enter.
    ensureEntered();
    if (!enabled) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // SOURCE home→projects · cameraYOffset 2vh → 0 over 3s (power4.inOut)
    if (enterAnimActive) {
      enterClock = Math.max(0, enterClock) + dt;
      const p = easePower4InOut(enterClock / ENTER_DURATION);
      cameraYOffset = (1 - p) * ENTER_Y_VH * window.innerHeight;
      if (enterClock >= ENTER_DURATION) {
        cameraYOffset = 0;
        enterAnimActive = false;
        allowControl = true;
      } else if (enterClock > 0.55) {
        allowControl = true;
      }
    }

    camera.position.set(0, 0, INITIAL_CAM_Z);
    camera.lookAt(0, 0, 0);
    camera.translateZ(-cameraZOffset);
    // SOURCE updateCamera · += tweenParams.cameraYOffset / cameraZOffset
    camera.position.y += cameraYOffset;
    camera.position.z += 0;
    // Scroll lean
    camera.position.y += scrollVelocity * 160;
    camera.position.x += scrollVelocity * 55;

    smoothScrollPos += 0.05 * (scrollPos - smoothScrollPos);
    scrollDelta = 5e-4 * (scrollPos - smoothScrollPos);
    smoothScrollDelta = THREE.MathUtils.lerp(scrollDelta, 0, 0.01);
    scrollVelocity += 0.075 * (smoothScrollDelta - scrollVelocity);
    projectsGroup.position.y = smoothScrollPos;
    // Soft lean — primary warp is GPU bend via world-Y + bendPoint
    projectsGroup.rotation.x = scrollVelocity * 0.18;
    projectsGroup.position.z = Math.abs(scrollVelocity) * 22;

    if (waterfallActive && !enterAnimActive) {
      if (enterClock < 0) enterClock = 0;
      enterClock += dt;
    }

    cards.forEach((card, i) => {
      if (!card.group.visible) return;

      let p = 1;
      if (waterfallActive && !enterAnimActive) {
        const local = THREE.MathUtils.clamp((enterClock - card.stagger) / 0.6, 0, 1);
        p = easeOutExpo(local);
        card.enter = p;
      } else {
        card.enter = 1;
        p = 1;
      }

      // Filter-change cascade only (home enter uses camera Y slide)
      const yOff = (1 - p) * (200 + (i % 5) * 28);
      const zOff = (1 - p) * 360;
      const xOff = (1 - p) * ((i % 2 === 0 ? -1 : 1) * 36);
      const rotXEnter = (1 - p) * 0.18;

      card.group.rotation.x = rotXEnter;
      card.group.rotation.y = 0;
      card.group.position.set(card.baseX + xOff, card.baseY - yOff, CARD_Z + zOff);

      const opacity = Math.max(0.001, easeOutCubic(p));
      card.cardMat.setOpacity(opacity);
      card.labelMat.setOpacity(opacity);
      card.cardMat.setTime(t);
      card.labelMat.setTime(t);

      card.innerScale += (card.innerScaleTarget - card.innerScale) * 0.14;
      card.cardMat.setInnerScale(card.innerScale);
      const bx = (card.group.userData.baseScaleX as number) || card.imageMesh.scale.x;
      const by = (card.group.userData.baseScaleY as number) || card.imageMesh.scale.y;
      card.imageMesh.scale.set(bx, by, 1);
    });

    if (waterfallActive && !enterAnimActive && enterClock > cards.length * 0.055 + 0.85) {
      waterfallActive = false;
    }

    if (arches) arches.position.y = smoothScrollPos * 0.16;
    if (floor) floor.position.y = smoothScrollPos * 0.09;
    if (butterflies) {
      butterflies.mesh.position.y = smoothScrollPos * 0.12;
      butterflies.update(t);
    }

    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);
  window.addEventListener('resize', onResize);
  window.addEventListener('wheel', onWheel, { passive: false });

  const onStudioEntered = () => {
    if (disposed) return;
    ensureEntered();
  };
  window.addEventListener('us-studio-entered', onStudioEntered);
  // If Enter already happened while we were loading assets
  ensureEntered();

  const debug = () => ({
    gen,
    disposed,
    enabled,
    enterPlayed,
    allowControl,
    waterfallActive,
    enterAnimActive,
    enterClock,
    cameraYOffset,
    cameraZOffset,
    cardCount: cards.length,
    visible: cards.filter((c) => c.group.visible).length,
    sample: cards
      .filter((c) => c.group.visible)
      .slice(0, 4)
      .map((c) => ({
        title: c.item.title,
        op: c.cardMat.uniforms.u_opacity.value,
        pos: c.group.position.toArray(),
        base: [c.baseX, c.baseY],
        scale: c.imageMesh.scale.toArray(),
        rot: [c.group.rotation.x, c.group.rotation.y],
      })),
  });
  (window as unknown as { __usPM?: () => ReturnType<typeof debug> }).__usPM = debug;

  return {
    setEnabled(on) {
      if (disposed) return;
      if (on) {
        enabled = true;
        onResize();
        ensureEntered();
        renderer.render(scene, camera);
      } else if (!studioEntered()) {
        // Only park the scene while the loader is still up
        enabled = false;
        allowControl = false;
        waterfallActive = false;
        enterAnimActive = false;
        enterClock = -1;
        enterPlayed = false;
        cameraZOffset = REST_Z_OFFSET;
        cameraYOffset = ENTER_Y_VH * window.innerHeight;
        scrollPos = 0;
        smoothScrollPos = 0;
        scrollVelocity = 0;
      }
    },
    setFilter(next, opts) {
      filter = next;
      scrollPos = 0;
      smoothScrollPos = 0;
      positionProjects();
      clampScroll();
      if (opts?.animate !== false && enterPlayed && !enterAnimActive) {
        waterfallActive = true;
        enterClock = 0;
        cards.forEach((c) => {
          c.enter = 0;
          c.cardMat.setOpacity(0);
          c.labelMat.setOpacity(0);
        });
      } else if (!enterPlayed) {
        // Park off-screen until route-triggered playEnter
        cameraYOffset = ENTER_Y_VH * window.innerHeight;
        cards.forEach((c) => {
          c.enter = 1;
          if (c.group.visible) {
            c.cardMat.setOpacity(1);
            c.labelMat.setOpacity(1);
            c.group.position.set(c.baseX, c.baseY, CARD_Z);
          }
        });
      } else {
        cards.forEach((c) => {
          if (!c.group.visible) return;
          c.enter = 1;
          c.cardMat.setOpacity(1);
          c.labelMat.setOpacity(1);
          c.group.position.set(c.baseX, c.baseY, CARD_Z);
        });
      }
    },
    playEnter() {
      playEnterInternal();
    },
    dispose() {
      disposed = true;
      enabled = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('us-studio-entered', onStudioEntered);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointermove', onHoverMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('click', onClick);
      butterflies?.dispose();
      cards.forEach((c) => {
        c.imageMesh.geometry.dispose();
        c.labelMesh.geometry.dispose();
        c.cardMat.dispose();
        c.labelTex.dispose();
        c.labelMat.dispose();
      });
      const win = window as unknown as { __usPM?: () => ReturnType<typeof debug> };
      if (win.__usPM === debug) delete win.__usPM;
      renderer.dispose();
      ktx2.dispose();
      draco.dispose();
      archTex.dispose();
    },
  };
}
