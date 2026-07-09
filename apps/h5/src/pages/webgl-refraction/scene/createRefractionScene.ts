import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { cubemapUrls, MODELS, TEXTURES } from '../assetPaths';
import { SHADERS } from '../shaders';
import { SCENE_CONFIG, type Orientation, type SceneIndex } from './sceneConfig';
import type { RefractionMaterials, RefractionSceneHandle, RefractionSceneParams } from './types';

const LAYER_BG = 1;

type CreateOptions = {
  canvas: HTMLCanvasElement;
  onProgress?: (percent: number) => void;
  onThemeChange?: (index: SceneIndex) => void;
  onHoldChange?: (holding: boolean) => void;
};

function loadTexture(url: string) {
  return new Promise<THREE.Texture>((resolve, reject) => {
    new THREE.TextureLoader().load(url, resolve, undefined, reject);
  });
}

let gltfLoader: GLTFLoader | null = null;

function getGltfLoader() {
  if (!gltfLoader) {
    const draco = new DRACOLoader();
    draco.setDecoderPath('/draco/gltf/');
    gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(draco);
  }
  return gltfLoader;
}

function loadGltf(url: string) {
  return new Promise<THREE.Group>((resolve, reject) => {
    getGltfLoader().load(url, (g) => resolve(g.scene), undefined, reject);
  });
}

function loadCubeMap(urls: string[]) {
  return new Promise<THREE.CubeTexture>((resolve, reject) => {
    new THREE.CubeTextureLoader().load(urls, resolve, undefined, reject);
  });
}

function firstMesh(root: THREE.Object3D) {
  let mesh: THREE.Mesh | null = null;
  root.traverse((obj) => {
    if (!mesh && (obj as THREE.Mesh).isMesh) mesh = obj as THREE.Mesh;
  });
  if (!mesh) throw new Error('GLB has no mesh');
  return mesh;
}

function orientation(w: number, h: number): Orientation {
  return w > h ? 'landscape' : 'portrait';
}

export async function createRefractionScene({
  canvas,
  onProgress,
  onThemeChange,
  onHoldChange,
}: CreateOptions): Promise<RefractionSceneHandle> {
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    stencil: false,
  });
  renderer.autoClear = false;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const dpr = renderer.getPixelRatio();
  const size = () => new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr);

  const params: RefractionSceneParams = {
    bubbleTransparency: 1,
    bubbleScale: SCENE_CONFIG.sphereStartScale,
    cloudTimeMultiplier: 0,
    spriteOpacity: 1,
    maskProgress: 0,
    bubbleXPos: -1,
  };

  let sceneIndex: SceneIndex = 1;
  let holdTimer: ReturnType<typeof setTimeout> | null = null;
  let allowSpriteOpacity = false;
  let getSkyTexture = false;
  let scene2Visited = false;
  let disposed = false;

  const pointer = new THREE.Vector2();
  const smoothMouse = [new THREE.Vector2(), new THREE.Vector2()];
  const worldMousePos = new THREE.Vector3();
  const cameraLookAt = new THREE.Vector3();
  const _quaternion = new THREE.Quaternion();
  const _euler = new THREE.Euler();

  const envFbo = new THREE.WebGLRenderTarget(size().x, size().y, { depthBuffer: true });
  const skyFbo = new THREE.WebGLRenderTarget(size().x, size().y, { depthBuffer: true });

  const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = SCENE_CONFIG.cameraZOffset;
  scene.add(camera);

  const camera2 = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera2.position.z = SCENE_CONFIG.cameraZOffset;
  camera2.layers.set(LAYER_BG);
  scene.add(camera2);

  const skyCamera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
  skyCamera.position.z = SCENE_CONFIG.cameraZOffset;
  skyCamera.layers.set(LAYER_BG);
  scene.add(skyCamera);

  const textures: Record<string, THREE.Texture> = {};
  const total = 15;
  let loaded = 0;
  const tick = () => {
    loaded += 1;
    onProgress?.(Math.round((loaded / total) * 100));
  };

  const [
    matcap,
    lensflare,
    opacityFill,
    fillWhite,
    fillBlack,
    opacityStroke,
    lightning,
    lightningAlpha,
    lightningMob,
    lightningMobAlpha,
    skyTex,
    bubbleGltf,
    metalGltf,
    chromeEnv,
    metalEnv,
  ] = await Promise.all([
    loadTexture(TEXTURES.matcap).then((t) => { tick(); return t; }),
    loadTexture(TEXTURES.lensflare).then((t) => { tick(); return t; }),
    loadTexture(TEXTURES.opacityFill).then((t) => { tick(); return t; }),
    loadTexture(TEXTURES.fillWhite).then((t) => { tick(); return t; }),
    loadTexture(TEXTURES.fillBlack).then((t) => { tick(); return t; }),
    loadTexture(TEXTURES.opacityStroke).then((t) => { tick(); return t; }),
    loadTexture(TEXTURES.lightning).then((t) => { tick(); return t; }),
    loadTexture(TEXTURES.lightningAlpha).then((t) => { tick(); return t; }),
    loadTexture(TEXTURES.lightningMob).then((t) => { tick(); return t; }),
    loadTexture(TEXTURES.lightningMobAlpha).then((t) => { tick(); return t; }),
    loadTexture(TEXTURES.sky).then((t) => { tick(); return t; }),
    loadGltf(MODELS.bubbleText).then((g) => { tick(); return g; }),
    loadGltf(MODELS.metalText).then((g) => { tick(); return g; }),
    loadCubeMap(cubemapUrls('cubemap')).then((t) => { tick(); return t; }),
    loadCubeMap(cubemapUrls('metalCubemap')).then((t) => { tick(); return t; }),
  ]);

  textures.sky = skyTex;
  [opacityFill, opacityStroke, fillWhite, fillBlack].forEach((t) => {
    t.flipY = false;
  });

  const materials: RefractionMaterials = {
    sky: new THREE.ShaderMaterial({
      vertexShader: SHADERS.skyVert,
      fragmentShader: SHADERS.skyFrag,
      uniforms: {
        uResolution: { value: size() },
        uTime: { value: 0 },
        uDPR: { value: dpr },
        uCloudSpeed: { value: 0.01 },
        uSkyColor: { value: new THREE.Color(0.337, 0.72, 0.854) },
        uCloudColor: { value: new THREE.Color(0.96, 0.96, 0.96) },
        uSkyTweenProgress: { value: 0 },
        uSkyTexture: { value: null },
        uTransparent: { value: 0 },
      },
      transparent: true,
    }),
    lightning: new THREE.ShaderMaterial({
      vertexShader: SHADERS.lightningVert,
      fragmentShader: SHADERS.lightningFrag,
      uniforms: {
        uResolution: { value: size() },
        uTexture: { value: lightning },
        uAlpha: { value: lightningAlpha },
        uProgress: { value: 1 },
      },
      transparent: true,
    }),
    viewportPlane: new THREE.ShaderMaterial({
      vertexShader: SHADERS.maskVert,
      fragmentShader: SHADERS.maskFrag,
      uniforms: {
        uResolution: { value: size() },
        uBaseColor: { value: new THREE.Color(0.894, 0.894, 0.894) },
        uTex1: { value: opacityFill },
        uTex2: { value: opacityStroke },
        uTime: { value: 0 },
        uMaskSwitchProgress: { value: 0 },
      },
      transparent: true,
    }),
    fillPlanes: new THREE.ShaderMaterial({
      vertexShader: SHADERS.maskVert,
      fragmentShader: SHADERS.maskFrag,
      uniforms: {
        uResolution: { value: size() },
        uBaseColor: { value: new THREE.Color(0.894, 0.894, 0.894) },
        uTex1: { value: fillWhite },
        uTex2: { value: fillBlack },
        uTime: { value: 0 },
        uMaskSwitchProgress: { value: 0 },
      },
      transparent: true,
    }),
    bubble: new THREE.ShaderMaterial({
      vertexShader: SHADERS.bubbleVert,
      fragmentShader: SHADERS.bubbleFrag,
      uniforms: {
        uResolution: { value: size() },
        uTransparent: { value: params.bubbleTransparency },
        uSceneTex: { value: envFbo.texture },
        uMatcap: { value: matcap },
        uMatcapOpacity: { value: 0.1 },
        uRefractPower: { value: 0.2 },
        uRefractEdgeMultiplier: { value: 5 },
        uRefractEdgeSize: { value: 1 },
        uBaseColor: { value: new THREE.Color(0, 0, 0) },
        uNoiseAmount: { value: 0 },
        uColorOffset: { value: new THREE.Vector3(0.6, 0.4, 0.4) },
        uYPos: { value: 1 },
        uScaleMultiplier: { value: 1 },
        uTime: { value: 0 },
        uNoiseDensity: { value: 20 },
        uNoiseStrength: { value: 0.1 },
        uColorDistort: { value: 0 },
      },
      side: THREE.DoubleSide,
      transparent: true,
    }),
    bubbleTextMat: new THREE.MeshStandardMaterial({
      envMap: chromeEnv,
      metalness: 1,
      roughness: 0.15,
      transparent: true,
    }),
    metalTextMat: new THREE.MeshStandardMaterial({
      envMap: metalEnv,
      metalness: 1,
      roughness: 0.2,
      transparent: true,
      opacity: 0,
    }),
  };

  const planeGeo = new THREE.PlaneGeometry(1, 1);
  const backgroundPlane = new THREE.Mesh(planeGeo, materials.sky);
  backgroundPlane.layers.set(LAYER_BG);
  backgroundPlane.position.z = -5;
  scene.add(backgroundPlane);

  const lightningPlane = new THREE.Mesh(planeGeo, materials.lightning);
  lightningPlane.layers.set(LAYER_BG);
  lightningPlane.position.z = -4.9;
  scene.add(lightningPlane);

  const viewportPlane = new THREE.Mesh(planeGeo, materials.viewportPlane);
  viewportPlane.layers.set(LAYER_BG);
  viewportPlane.position.z = -4.5;
  scene.add(viewportPlane);

  const fillTopLeft = new THREE.Mesh(planeGeo, materials.fillPlanes);
  fillTopLeft.layers.set(LAYER_BG);
  scene.add(fillTopLeft);

  const fillBottomRight = new THREE.Mesh(planeGeo, materials.fillPlanes);
  fillBottomRight.layers.set(LAYER_BG);
  scene.add(fillBottomRight);

  const orient = orientation(window.innerWidth, window.innerHeight);
  const bubble = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 32),
    materials.bubble,
  );
  const bubbleScale = SCENE_CONFIG.bubbleScale[orient];
  bubble.scale.setScalar(bubbleScale);
  scene.add(bubble);

  const bubbleTextMesh = firstMesh(bubbleGltf);
  bubbleTextMesh.material = materials.bubbleTextMat;
  bubbleTextMesh.layers.set(LAYER_BG);
  bubbleTextMesh.scale.setScalar(0.0067);

  const metalTextMesh = firstMesh(metalGltf);
  metalTextMesh.material = materials.metalTextMat;
  metalTextMesh.layers.set(LAYER_BG);
  metalTextMesh.visible = false;
  metalTextMesh.scale.setScalar(0.44);
  metalTextMesh.position.set(0, 0.033, -0.01);

  const boxMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
  );
  boxMesh.add(bubbleGltf);
  boxMesh.add(metalGltf);
  boxMesh.position.z = -3;
  scene.add(boxMesh);

  const spriteMat = new THREE.SpriteMaterial({ map: lensflare, depthWrite: false, depthTest: false });
  const spriteGroup = new THREE.Group();
  const spritePositions: [number, number, number][] = [
    [-0.33, 0.13, 0],
    [-0.07, 0.14, 0],
    [0.14, 0.01, 0],
    [0.5, 0.14, 0],
  ];
  spritePositions.forEach(([x, y, z]) => {
    const sp = new THREE.Sprite(spriteMat);
    sp.position.set(x, y, z);
    sp.scale.setScalar(0.2);
    sp.layers.set(LAYER_BG);
    spriteGroup.add(sp);
  });
  bubbleGltf.add(spriteGroup);

  let sceneWidth = 1;
  let sceneHeight = 1;

  function scaleBackground() {
    const dist = (camera.position.z + 5) * camera.getFilmHeight() / camera.getFocalLength();
    backgroundPlane.scale.set(dist * camera.aspect, dist);
    lightningPlane.scale.set(sceneWidth * 1.2, sceneHeight * SCENE_CONFIG.preferredRatio * 1.2);
  }

  function calculateSceneDimensions() {
    const fovRad = THREE.MathUtils.degToRad(camera.fov);
    sceneHeight = 2 * Math.tan(fovRad / 2) * SCENE_CONFIG.cameraZOffset;
    sceneWidth = sceneHeight * camera.aspect;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;
    const boxScale = sceneHeight * 1.3;

    if (aspect > SCENE_CONFIG.preferredAspect) {
      const side = (sceneWidth - sceneHeight * SCENE_CONFIG.preferredAspect) * 0.5;
      fillTopLeft.scale.set(side, sceneHeight, 1);
      fillTopLeft.position.set(-sceneWidth * 0.5 + side * 0.5, 0, 0);
      fillBottomRight.scale.set(side, sceneHeight, 1);
      fillBottomRight.position.set(sceneWidth * 0.5 - side * 0.5, 0, 0);
      viewportPlane.scale.set(sceneHeight * SCENE_CONFIG.preferredAspect * 1.18, sceneHeight * 1.18);
      lightningPlane.scale.set(sceneWidth * 1.2, sceneHeight * SCENE_CONFIG.preferredRatio * 1.2);
      boxMesh.scale.set(boxScale, boxScale, boxScale);
    } else {
      const contentW = sceneWidth * 0.7;
      const band = (sceneHeight - sceneWidth * SCENE_CONFIG.preferredRatio) * 0.5;
      fillTopLeft.scale.set(sceneWidth, band, 1);
      fillTopLeft.position.set(0, sceneHeight * 0.5 - band * 0.5, 0);
      fillBottomRight.scale.set(sceneWidth, band, 1);
      fillBottomRight.position.set(0, -sceneHeight * 0.5 + band * 0.5, 0);
      viewportPlane.scale.set(sceneWidth * 1.18, sceneWidth * SCENE_CONFIG.preferredRatio * 1.18);
      lightningPlane.scale.set(sceneHeight * SCENE_CONFIG.preferredAspect * 1.2, sceneHeight * 1.2);
      boxMesh.scale.set(contentW, contentW, contentW);
      materials.lightning.uniforms.uTexture.value = lightningMob;
      materials.lightning.uniforms.uAlpha.value = lightningMobAlpha;
    }
    scaleBackground();
  }

  calculateSceneDimensions();

  const sceneSwitchTl = gsap.timeline({ paused: true })
    .to(params, { maskProgress: 1, duration: 0.6, ease: 'expo.inOut' }, 0)
    .to(materials.viewportPlane.uniforms.uBaseColor.value, { x: 0, y: 0, z: 0, duration: 0.6, ease: 'expo.inOut' }, 0)
    .to(materials.fillPlanes.uniforms.uBaseColor.value, { x: 0, y: 0, z: 0, duration: 0.6, ease: 'expo.inOut' }, 0)
    .to(materials.sky.uniforms.uCloudColor.value, { x: 0.149, y: 0.137, z: 0.28, duration: 0.6, ease: 'expo.inOut' }, 0)
    .to(materials.sky.uniforms.uSkyTweenProgress, { value: 1, duration: 0.6, ease: 'expo.inOut' }, 0)
    .to(materials.lightning.uniforms.uProgress, { value: -2, duration: 0.8, ease: 'expo.inOut' }, 0.05)
    .to(params, { spriteOpacity: 0, duration: 0.1, ease: 'linear' }, 0.1)
    .call(() => { spriteGroup.visible = false; }, undefined, 0.2)
    .to(bubbleTextMesh.rotation, { x: THREE.MathUtils.degToRad(-360), duration: 0.6, ease: 'expo.inOut' }, 0)
    .to(metalTextMesh.rotation, { x: THREE.MathUtils.degToRad(-360), duration: 0.6, ease: 'expo.inOut' }, 0)
    .to(materials.bubbleTextMat, { opacity: 0, duration: 0.29, ease: 'linear' }, 0)
    .to(materials.metalTextMat, { opacity: 1, duration: 0.3, ease: 'linear' }, 0.29)
    .call(() => {
      bubbleTextMesh.visible = false;
      metalTextMesh.visible = true;
    }, undefined, 0.29);

  const scene1HoldTl = gsap.timeline({ paused: true })
    .to(params, { cloudTimeMultiplier: 2.5, duration: 0.65, ease: 'expo.inOut' }, 0)
    .to(bubble.scale, {
      x: bubbleScale * 1.5,
      y: bubbleScale * 1.5,
      z: bubbleScale * 1.5,
      duration: 0.65,
      ease: 'expo.inOut',
    }, 0)
    .to(materials.bubble.uniforms.uColorDistort, { value: 1, duration: 0.65 }, 0)
    .to(materials.bubble.uniforms.uMatcapOpacity, { value: 0.2, duration: 0.65 }, 0)
    .to(materials.bubble.uniforms.uRefractPower, { value: 0.1, duration: 0.65 }, 0)
    .fromTo(bubbleTextMesh.rotation, { x: 0 }, { x: THREE.MathUtils.degToRad(-360), duration: 0.65 }, 0)
    .to(params, { spriteOpacity: 0, duration: 0.1, ease: 'expo.in' }, 0.1)
    .to(params, { spriteOpacity: 1, duration: 0.1, ease: 'expo.inOut' }, 0.35)
    .to(bubbleTextMesh.scale, { x: 0.0067 * 1.12, y: 0.0067 * 1.12, z: 0.0067 * 1.12, duration: 0.65 }, 0)
    .to(spriteGroup.scale, { x: 1.12, y: 1.12, z: 1.12, duration: 0.65 }, 0);

  const scene2HoldTl = gsap.timeline({ paused: true })
    .to(metalTextMesh.scale, { x: 0.44 * 1.2, y: 0.44 * 1.2, z: 0.44 * 1.2, duration: 0.6, ease: 'expo.inOut' }, 0)
    .to(metalTextMesh.rotation, { y: THREE.MathUtils.degToRad(360), duration: 0.6, ease: 'expo.inOut' }, 0)
    .to(bubble.scale, { x: bubbleScale * 1.5, y: bubbleScale * 1.5, z: bubbleScale * 1.5, duration: 0.6 }, 0)
    .to(materials.bubble.uniforms.uRefractPower, { value: 0.4, duration: 0.6 }, 0)
    .to(materials.bubble.uniforms.uNoiseAmount, { value: 0.06, duration: 0.6 }, 0)
    .to(materials.bubble.uniforms.uNoiseStrength, { value: 0.26, duration: 0.6 }, 0)
    .to(materials.bubble.uniforms.uMatcapOpacity, { value: 0.1, duration: 0.6 }, 0)
    .to(materials.bubble.uniforms.uColorOffset.value, { x: 1, y: 3, z: 5, duration: 0.6 }, 0);

  gsap.to(params, { bubbleXPos: 1, yoyo: true, repeat: -1, ease: 'power2.inOut', duration: 6 });

  const clock = new THREE.Clock();
  let raf = 0;

  function getMouseWorld() {
    const dir = new THREE.Vector3(pointer.x, pointer.y, 1).unproject(camera).sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    worldMousePos.copy(camera.position).add(dir.multiplyScalar(dist));
  }

  function updateCamera() {
    camera.position.set(0, 0, SCENE_CONFIG.cameraZOffset);
    camera.lookAt(cameraLookAt);
    smoothMouse[0].lerp(pointer, 0.075);
    smoothMouse[1].lerp(pointer, 0.02);
    camera.translateZ(-SCENE_CONFIG.cameraZOffset);
    _euler.set(
      smoothMouse[0].y * SCENE_CONFIG.mouseMoveAngle.y,
      -smoothMouse[0].x * SCENE_CONFIG.mouseMoveAngle.x,
      0,
    );
    _quaternion.setFromEuler(_euler);
    camera.quaternion.multiply(_quaternion);
    _euler.set(0, 0, (smoothMouse[0].x - smoothMouse[1].x) * -0.05);
    _quaternion.setFromEuler(_euler);
    camera.quaternion.multiply(_quaternion);
    camera.translateZ(SCENE_CONFIG.cameraZOffset);
    camera.updateMatrixWorld();
  }

  function render() {
    if (disposed) return;
    const t = clock.getElapsedTime();
    materials.sky.uniforms.uTime.value = t * 0.1 + params.cloudTimeMultiplier;
    materials.bubble.uniforms.uTime.value = t * 0.1;
    materials.viewportPlane.uniforms.uMaskSwitchProgress.value = params.maskProgress;
    materials.fillPlanes.uniforms.uMaskSwitchProgress.value = params.maskProgress;
    materials.bubble.uniforms.uTransparent.value = params.bubbleTransparency;

    if (allowSpriteOpacity) spriteMat.opacity = params.spriteOpacity;

    getMouseWorld();
    const isTouch = 'ontouchstart' in window;
    if (isTouch) {
      bubble.position.x = THREE.MathUtils.lerp(bubble.position.x, params.bubbleXPos, 0.08);
      bubble.position.y = THREE.MathUtils.lerp(bubble.position.y, 0, 0.08);
    } else {
      bubble.position.x = THREE.MathUtils.lerp(bubble.position.x, worldMousePos.x, 0.08);
      bubble.position.y = THREE.MathUtils.lerp(bubble.position.y, worldMousePos.y, 0.08);
    }

    bubbleGltf.rotation.x = THREE.MathUtils.lerp(bubbleGltf.rotation.x, -pointer.y * 0.2, 0.06);
    bubbleGltf.rotation.y = THREE.MathUtils.lerp(bubbleGltf.rotation.y, pointer.x * 0.2, 0.06);
    metalGltf.rotation.x = THREE.MathUtils.lerp(metalGltf.rotation.x, -pointer.y * 0.2, 0.06);
    metalGltf.rotation.y = THREE.MathUtils.lerp(metalGltf.rotation.y, pointer.x * 0.2, 0.06);

    if (getSkyTexture) {
      boxMesh.visible = false;
      viewportPlane.visible = false;
      fillTopLeft.visible = false;
      fillBottomRight.visible = false;
      renderer.setRenderTarget(skyFbo);
      renderer.render(scene, skyCamera);
      if (sceneIndex === 1) {
        materials.sky.uniforms.uSkyTexture.value = skyFbo.texture;
        materials.sky.defines.USE_TEXTURE = 1;
        materials.sky.needsUpdate = true;
      } else {
        materials.sky.uniforms.uSkyTexture.value = skyTex;
        gsap.to(materials.sky.uniforms.uTransparent, {
          value: 1,
          duration: 0.5,
          ease: 'expo.inOut',
          onComplete: () => {
            materials.sky.defines.USE_TEXTURE = 1;
            materials.sky.needsUpdate = true;
          },
        });
      }
      boxMesh.visible = true;
      viewportPlane.visible = true;
      fillTopLeft.visible = true;
      fillBottomRight.visible = true;
      getSkyTexture = false;
    }

    updateCamera();

    renderer.setRenderTarget(envFbo);
    renderer.render(scene, camera2);
    renderer.setRenderTarget(null);
    renderer.clearDepth();
    renderer.render(scene, camera2);
    renderer.clearDepth();
    renderer.render(scene, camera);

    raf = requestAnimationFrame(render);
  }

  raf = requestAnimationFrame(render);

  // capture sky texture after first frames
  setTimeout(() => { getSkyTexture = true; }, 800);

  function switchToScene1() {
    if (sceneIndex === 1) return;
    sceneIndex = 1;
    allowSpriteOpacity = true;
    onThemeChange?.(1);
    sceneSwitchTl.reverse();
    sceneSwitchTl.eventCallback('onReverseComplete', () => {
      allowSpriteOpacity = false;
      spriteGroup.visible = true;
      bubbleTextMesh.visible = true;
      metalTextMesh.visible = false;
      materials.bubbleTextMat.opacity = 1;
      materials.metalTextMat.opacity = 0;
    });
  }

  function switchToScene2() {
    if (sceneIndex === 2) return;
    sceneIndex = 2;
    allowSpriteOpacity = true;
    onThemeChange?.(2);
    if (!scene2Visited) scene2Visited = true;
    sceneSwitchTl.restart();
    sceneSwitchTl.eventCallback('onComplete', () => {
      allowSpriteOpacity = false;
    });
  }

  function onPointerDown() {
    if (holdTimer) clearTimeout(holdTimer);
    holdTimer = setTimeout(() => {
      allowSpriteOpacity = true;
      onHoldChange?.(true);
      if (sceneIndex === 1) scene1HoldTl.restart();
      else scene2HoldTl.restart();
    }, SCENE_CONFIG.holdDelayMs);
  }

  function onPointerUp() {
    if (holdTimer) clearTimeout(holdTimer);
    onHoldChange?.(false);
    if (sceneIndex === 1) scene1HoldTl.reverse();
    else scene2HoldTl.reverse();
  }

  function onPointerMove(clientX: number, clientY: number) {
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    camera2.aspect = w / h;
    camera2.updateProjectionMatrix();
    skyCamera.aspect = w / h;
    skyCamera.updateProjectionMatrix();
    const res = size();
    envFbo.setSize(res.x, res.y);
    skyFbo.setSize(res.x, res.y);
    materials.sky.uniforms.uResolution.value.copy(res);
    materials.bubble.uniforms.uResolution.value.copy(res);
    materials.lightning.uniforms.uResolution.value.copy(res);
    calculateSceneDimensions();
  }

  function dispose() {
    disposed = true;
    cancelAnimationFrame(raf);
    sceneSwitchTl.kill();
    scene1HoldTl.kill();
    scene2HoldTl.kill();
    renderer.dispose();
    envFbo.dispose();
    skyFbo.dispose();
  }

  return {
    scene,
    renderer,
    params,
    materials,
    bubble,
    bubbleTextMesh,
    metalTextMesh,
    get sceneIndex() { return sceneIndex; },
    switchToScene1,
    switchToScene2,
    onPointerDown,
    onPointerUp,
    onPointerMove,
    resize,
    dispose,
    onThemeChange,
    onHoldChange,
  };
}
