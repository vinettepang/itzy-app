import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { UNSEEN_ASSETS } from '../assetPaths';
import { assetUrl } from '@/utils/assetUrl';
import { createFluidSim } from './createFluidSim';
import { createGrass } from './createGrass';
import { createGrainPass } from './createGrainPass';
import { createHomeTextPlane } from './createHomeText';
import { createParticles } from './createParticles';
import { createWaterPlane } from './createWater';

/** SOURCE · theme.js HomeContact.load() asset maps */
const MODEL_FILES = {
  homeRoom: 'room-1.glb',
  contactRoom: 'room-2.glb',
  chair: 'chair.glb',
  pillows: 'pillows.glb',
  rocks: 'rocks.glb',
  table: 'table-3.glb',
  land: 'land-group.glb',
  grass: 'grass-simple.glb',
} as const;

const TEXTURE_FILES = {
  homeRoom: 'room-1',
  contactRoom: 'room-2',
  chair: 'chair',
  pillows: 'pillows',
  rock: 'rocks',
  table: 'table',
  pearlMatcap: 'pearl-matcap',
  particle: 'particles',
  skymap: 'skymap-tile',
  aoMap: 'ao',
} as const;

/** SOURCE · applyObjectTransforms target names in objectsData.glb */
const TRANSFORM_KEYS = {
  homeRoom: 'room-1',
  contactRoom: 'room-2',
  chair: 'chair',
  pillows: 'pillow',
  rocks: 'rock',
  table: 'table-3',
  land: 'land',
  ballContainer: 'sphere',
} as const;

export type SceneMode = 'home' | 'contact' | 'projects' | 'world';

export type HomeSceneHandle = {
  dispose: () => void;
  setEnabled: (on: boolean) => void;
  setMode: (mode: SceneMode) => void;
};

type CreateOpts = {
  canvas: HTMLCanvasElement;
  onProgress?: (pct: number) => void;
};

function makeGltfLoader(renderer: THREE.WebGLRenderer) {
  const draco = new DRACOLoader();
  // Use project decoder (same as webgl-refraction). Theme-bundled draco path throws
  // "Unexpected geometry type" with three@0.184.
  draco.setDecoderPath(assetUrl('/draco/gltf/'));

  const ktx2 = new KTX2Loader();
  ktx2.setTranscoderPath(`${UNSEEN_ASSETS}basis/`);
  ktx2.detectSupport(renderer);

  const gltf = new GLTFLoader();
  gltf.setDRACOLoader(draco);
  gltf.setKTX2Loader(ktx2);
  return { gltf, ktx2, draco };
}

function loadGltf(loader: GLTFLoader, url: string) {
  return new Promise<THREE.Group>((resolve, reject) => {
    loader.load(url, (g) => resolve(g.scene), undefined, reject);
  });
}

function loadKtx2(loader: KTX2Loader, url: string) {
  return new Promise<THREE.Texture>((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

function firstMesh(root: THREE.Object3D): THREE.Mesh | null {
  let mesh: THREE.Mesh | null = null;
  root.traverse((o) => {
    if (!mesh && (o as THREE.Mesh).isMesh) mesh = o as THREE.Mesh;
  });
  return mesh;
}

function mapObjectsData(root: THREE.Object3D) {
  const map: Record<string, THREE.Object3D> = {};
  root.children.forEach((child) => {
    if (child.name) map[child.name] = child;
  });
  // Also walk one level for cam/tgt children parents
  root.traverse((o) => {
    if (o.name && !map[o.name]) map[o.name] = o;
  });
  return map;
}

function applyObjectTransforms(
  target: THREE.Object3D,
  key: string,
  objectsData: Record<string, THREE.Object3D>,
) {
  const src = objectsData[key];
  if (!src) {
    console.warn(`[unseen-studio] missing objectsData node: ${key}`);
    return;
  }
  target.position.copy(src.position);
  target.rotation.copy(src.rotation);
  target.scale.copy(src.scale);
}

/**
 * RAW_REPLAY baseline for Home WebGL.
 * SOURCE: theme.js HomeContact buildObjects / load / applyObjectTransforms / cameraPathProgress=1
 * Deferred (documented): grass instancing, water, fluid sims, composer passes, film-grain post.
 */
export async function createHomeScene({ canvas, onProgress }: CreateOpts): Promise<HomeSceneHandle> {
  let disposed = false;
  let enabled = false;

  // SOURCE · Gl.setup WebGLRenderer({ alpha: true, antialias: false })
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const { gltf, ktx2, draco } = makeGltfLoader(renderer);

  const modelEntries = Object.entries(MODEL_FILES);
  const texEntries = Object.entries(TEXTURE_FILES);
  const total = modelEntries.length + texEntries.length + 1;
  let done = 0;
  const tick = () => {
    done += 1;
    onProgress?.(Math.round((done / total) * 100));
  };

  const models: Record<string, THREE.Object3D> = {};
  const textures: Record<string, THREE.Texture> = {};

  await Promise.all([
    ...modelEntries.map(async ([key, file]) => {
      const scene = await loadGltf(gltf, `${UNSEEN_ASSETS}models/home/${file}`);
      models[key] = scene.children[0] ?? scene;
      tick();
    }),
    ...texEntries.map(async ([key, name]) => {
      const tex = await loadKtx2(ktx2, `${UNSEEN_ASSETS}images/home/${name}.ktx2`);
      tex.colorSpace = THREE.SRGBColorSpace;
      textures[key] = tex;
      tick();
    }),
    (async () => {
      const scene = await loadGltf(gltf, `${UNSEEN_ASSETS}models/home/objectsData.glb`);
      models.objectsData = scene;
      tick();
    })(),
  ]);

  if (disposed) {
    renderer.dispose();
    throw new Error('disposed during load');
  }

  const objectsData = mapObjectsData(models.objectsData);

  // SOURCE · Gl.camera FOV convention (theme ~104511)
  const distance = 1500;
  const fov = (2 * Math.atan(window.innerHeight / 2 / distance) * 180) / Math.PI;
  const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.01, 2200);

  const scene = new THREE.Scene();
  // SOURCE · transparent clear + skysphere; cream scene.background was a GUESS wash.
  scene.background = null;

  const container = new THREE.Group();
  scene.add(container);

  const pointer = { x: 0, y: 0 };
  const smooth = { x: 0, y: 0 };

  // skymap setup SOURCE
  const skymap = textures.skymap;
  skymap.mapping = THREE.EquirectangularReflectionMapping;
  skymap.wrapS = skymap.wrapT = THREE.RepeatWrapping;
  skymap.flipY = true;
  skymap.repeat.set(6, 6);
  skymap.offset.set(0, 1.254);
  skymap.needsUpdate = true;

  const assignMap = (obj: THREE.Object3D, map: THREE.Texture, extra?: THREE.MeshBasicMaterialParameters) => {
    const mesh = firstMesh(obj) ?? (obj as THREE.Mesh);
    if (!(mesh as THREE.Mesh).isMesh) return;
    (mesh as THREE.Mesh).material = new THREE.MeshBasicMaterial({
      map,
      ...extra,
    });
  };

  // Rooms + props SOURCE materials
  assignMap(models.homeRoom, textures.homeRoom);
  applyObjectTransforms(models.homeRoom, TRANSFORM_KEYS.homeRoom, objectsData);
  models.homeRoom.matrixAutoUpdate = false;
  models.homeRoom.updateMatrix();
  container.add(models.homeRoom);

  assignMap(models.contactRoom, textures.contactRoom);
  applyObjectTransforms(models.contactRoom, TRANSFORM_KEYS.contactRoom, objectsData);
  models.contactRoom.matrixAutoUpdate = false;
  models.contactRoom.updateMatrix();
  models.contactRoom.visible = false;
  container.add(models.contactRoom);

  assignMap(models.chair, textures.chair);
  applyObjectTransforms(models.chair, TRANSFORM_KEYS.chair, objectsData);
  models.chair.matrixAutoUpdate = false;
  models.chair.updateMatrix();
  container.add(models.chair);

  assignMap(models.pillows, textures.pillows);
  applyObjectTransforms(models.pillows, TRANSFORM_KEYS.pillows, objectsData);
  models.pillows.matrixAutoUpdate = false;
  models.pillows.updateMatrix();
  container.add(models.pillows);

  assignMap(models.rocks, textures.rock);
  applyObjectTransforms(models.rocks, TRANSFORM_KEYS.rocks, objectsData);
  models.rocks.matrixAutoUpdate = false;
  models.rocks.updateMatrix();
  container.add(models.rocks);

  const tableMesh = firstMesh(models.table);
  if (tableMesh?.geometry?.attributes.uv) {
    tableMesh.geometry.setAttribute(
      'uv2',
      new THREE.BufferAttribute(tableMesh.geometry.attributes.uv.array, 2),
    );
  }
  assignMap(models.table, textures.table, {
    envMap: skymap,
    reflectivity: 1,
  });
  applyObjectTransforms(models.table, TRANSFORM_KEYS.table, objectsData);
  models.table.matrixAutoUpdate = false;
  models.table.updateMatrix();
  container.add(models.table);

  // Land: SOURCE grass land shader baseColor 0xDBACCC + fogColor 0xE0CFCF (instanced blades deferred)
  const landMesh = firstMesh(models.land);
  if (landMesh) {
    landMesh.material = new THREE.ShaderMaterial({
      uniforms: {
        u_baseColor: { value: new THREE.Color(0xdbaccc) },
        fogColor: { value: new THREE.Color(0xe0cfcf) },
        fogNear: { value: 0.29 },
        fogFar: { value: 1.09 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vWorldPosition;
        void main() {
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vWorldPosition;
        uniform vec3 u_baseColor;
        uniform vec3 fogColor;
        uniform float fogNear;
        uniform float fogFar;
        void main() {
          vec3 baseColor = u_baseColor;
          gl_FragColor = vec4(baseColor, 1.0);
          float depth = gl_FragCoord.z / gl_FragCoord.w;
          float fogFactor = smoothstep(fogNear, fogFar, depth);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
        }
      `,
    });
  }
  applyObjectTransforms(models.land, TRANSFORM_KEYS.land, objectsData);
  models.land.matrixAutoUpdate = false;
  models.land.updateMatrix();
  container.add(models.land);

  // Water SOURCE pose + PARTIAL Reflector replay
  const noiseMap = await new Promise<THREE.Texture | null>((resolve) => {
    new THREE.TextureLoader().load(
      `${UNSEEN_ASSETS}images/gradient-noise.jpg`,
      (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        resolve(tex);
      },
      undefined,
      () => resolve(null),
    );
  });
  if (textures.aoMap) {
    textures.aoMap.wrapS = textures.aoMap.wrapT = THREE.ClampToEdgeWrapping;
  }
  const water = createWaterPlane({
    renderer,
    aoMap: textures.aoMap,
    noiseMap: noiseMap ?? undefined,
  });
  container.add(water.mesh);
  // Avoid self/grass/particles in the reflection pass
  water.setIgnoreObjects([water.mesh]);

  // Fluid sim SOURCE · theme jt on water raycast UV
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const fluidPointer = new THREE.Vector2(-1, -1);
  const fluid = createFluidSim(renderer, {
    resolution: 128,
    force: 20,
    iterations: 1,
    mouseRadius: 0.2,
    getPointerUv: () => {
      ndc.set(pointer.x, pointer.y);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObject(water.mesh, true);
      if (!hits.length || !hits[0].uv) return null;
      fluidPointer.copy(hits[0].uv);
      return fluidPointer;
    },
  });
  water.setFluidMap(fluid.texture);

  // Grass SOURCE InstancedMesh on land
  const bladeMap = await new Promise<THREE.Texture | null>((resolve) => {
    new THREE.TextureLoader().load(
      `${UNSEEN_ASSETS}images/home/blade.jpg`,
      (tex) => resolve(tex),
      undefined,
      () => resolve(null),
    );
  });
  const grass = bladeMap
    ? createGrass({
        landRoot: models.land,
        bladeMap,
        noiseMap: noiseMap ?? undefined,
      })
    : null;
  if (grass) {
    applyObjectTransforms(grass.mesh, TRANSFORM_KEYS.land, objectsData);
    grass.mesh.matrixAutoUpdate = false;
    grass.mesh.updateMatrix();
    container.add(grass.mesh);
  }

  // Particles SOURCE · buildParticles
  textures.particle.flipY = false;
  textures.particle.needsUpdate = true;
  const particles = createParticles({ particleMap: textures.particle });
  container.add(particles.mesh);
  // Home text · soft in-scene mirror of DOM hero (Dom2Webgl PARTIAL)
  const homeText = await createHomeTextPlane();
  if (objectsData.ho) {
    applyObjectTransforms(homeText.mesh, 'ho', objectsData);
    homeText.mesh.scale.multiplyScalar(0.26);
  } else {
    homeText.mesh.position.set(-0.18, 0.08, -0.02);
    homeText.mesh.scale.setScalar(0.26);
  }
  // Keep for scene depth; DOM hero remains primary legible type
  homeText.mesh.visible = false;
  container.add(homeText.mesh);
  water.setIgnoreObjects([water.mesh, particles.mesh, homeText.mesh, ...(grass ? [grass.mesh] : [])]);

  // Pearl ball SOURCE
  textures.pearlMatcap.flipY = true;
  textures.pearlMatcap.needsUpdate = true;
  const ballContainer = new THREE.Group();
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(1, 20, 20),
    new THREE.MeshMatcapMaterial({ matcap: textures.pearlMatcap }),
  );
  applyObjectTransforms(ballContainer, TRANSFORM_KEYS.ballContainer, objectsData);
  ballContainer.scale.setScalar(0.01);
  ball.geometry.computeBoundingBox();
  if (ball.geometry.boundingBox) {
    ball.position.y = ball.geometry.boundingBox.max.z;
  }
  ball.matrixAutoUpdate = false;
  ball.updateMatrix();
  ballContainer.add(ball);
  container.add(ballContainer);

  // World skysphere SOURCE
  const world = new THREE.Mesh(
    new THREE.SphereGeometry(1, 6, 6),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: skymap,
      side: THREE.BackSide,
      fog: false,
    }),
  );
  // GUESS · scale large enough to envelope scene; production uses unit sphere then transforms unknown
  world.scale.setScalar(50);
  container.add(world);

  // Camera path SOURCE · cameraPathProgress=1 (home)
  const camNode = objectsData.cam;
  const tgtNode = objectsData.tgt;
  let camCurve: THREE.CatmullRomCurve3 | null = null;
  let tgtCurve: THREE.CatmullRomCurve3 | null = null;
  if (camNode?.children?.length) {
    camCurve = new THREE.CatmullRomCurve3(camNode.children.map((c) => c.position.clone()));
  }
  if (tgtNode?.children?.length) {
    tgtCurve = new THREE.CatmullRomCurve3(tgtNode.children.map((c) => c.position.clone()));
  }

  // SOURCE defaults from theme tween/options
  const options = {
    mouseMoveAngleX: 0.135,
    mouseMoveAngleY: 0.035,
    cameraZOffset: 0.1,
    cameraTranslateZ: 0,
  };
  let mode: SceneMode = 'home';
  let cameraPathProgress = 1;
  let cameraPathTarget = 1;

  const applyModeVisibility = () => {
    const showHomeProps = mode === 'home' || mode === 'projects';
    const showContact = mode === 'contact';
    models.homeRoom.visible = showHomeProps || showContact;
    models.contactRoom.visible = showContact;
    models.chair.visible = showHomeProps || showContact;
    models.pillows.visible = showHomeProps || showContact;
    models.rocks.visible = showHomeProps || showContact;
    models.table.visible = showHomeProps || showContact;
    models.land.visible = showHomeProps;
    if (grass?.mesh) grass.mesh.visible = showHomeProps;
    water.mesh.visible = showHomeProps;
    particles.mesh.visible = showHomeProps;
    // Canvas text plane reserved; DOM hero carries type (Dom2Webgl PARTIAL)
    homeText.mesh.visible = false;
  };
  applyModeVisibility();

  const updateCamera = () => {
    cameraPathProgress += (cameraPathTarget - cameraPathProgress) * 0.045;
    const progress = THREE.MathUtils.clamp(cameraPathProgress, 0, 1);
    if (camCurve && tgtCurve) {
      const pos = camCurve.getPointAt(progress);
      const tgt = tgtCurve.getPointAt(progress);
      tgt.x += smooth.x * options.mouseMoveAngleX * 0.15;
      tgt.y += -smooth.y * options.mouseMoveAngleY * 0.15;
      camera.position.copy(pos);
      camera.lookAt(tgt);
    } else if (objectsData.cam) {
      camera.position.copy(objectsData.cam.position);
      if (objectsData.tgt) camera.lookAt(objectsData.tgt.position);
    } else {
      camera.position.set(-0.15, 0.05, 0.35);
      camera.lookAt(-0.26, 0.04, -0.1);
    }
    camera.translateZ(options.cameraTranslateZ);
  };

  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  const grain = createGrainPass(renderer, {
    getFluidTexture: () => fluid.texture,
  });

  const onRouteFlash = (e: Event) => {
    const soft = Boolean((e as CustomEvent<{ soft?: boolean }>).detail?.soft);
    grain.pulse(soft ? 0.35 : 1);
  };
  window.addEventListener('us-route-flash', onRouteFlash);

  const onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.fov = (2 * Math.atan(h / 2 / distance) * 180) / Math.PI;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    water.resize();
    grain.resize();
  };
  onResize();

  let raf = 0;
  const clock = new THREE.Clock();
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!enabled) return;
    const t = clock.getElapsedTime();
    smooth.x += (pointer.x - smooth.x) * 0.06;
    smooth.y += (pointer.y - smooth.y) * 0.06;
    if (mode === 'home' || mode === 'projects') fluid.update();
    water.update(t);
    grass?.update(t);
    particles.update(t);
    updateCamera();
    grain.render(scene, camera, t);
  };
  raf = requestAnimationFrame(loop);

  window.addEventListener('pointermove', onPointer);
  window.addEventListener('resize', onResize);

  // Dump objectsData names once for analysis
  try {
    const names = Object.keys(objectsData);
    console.info('[unseen-studio] objectsData keys', names);
  } catch {
    /* ignore */
  }

  return {
    setEnabled(on: boolean) {
      enabled = on;
      if (on) {
        updateCamera();
        grain.render(scene, camera, clock.getElapsedTime());
      }
    },
    setMode(next: SceneMode) {
      mode = next;
      cameraPathTarget = next === 'contact' ? 0 : 1;
      applyModeVisibility();
    },
    dispose() {
      disposed = true;
      enabled = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('us-route-flash', onRouteFlash);
      water.dispose();
      grass?.dispose();
      particles.dispose();
      homeText.dispose();
      fluid.dispose();
      grain.dispose();
      noiseMap?.dispose();
      bladeMap?.dispose();
      renderer.dispose();
      ktx2.dispose();
      draco.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry?.dispose?.();
          const mat = m.material;
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
          else mat?.dispose?.();
        }
      });
      Object.values(textures).forEach((t) => t.dispose());
    },
  };
}
