import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  FLUID_COMPOSITE_FRAG,
  FLUID_DECAY_FRAG,
  FLUID_SPLAT_FRAG,
  FLARE_FRAG,
  GLASS_DEFAULTS,
  GLASS_FRAG,
  GLASS_VERT,
  SKY_COLOR_HEX,
  SKY_FRAG,
  SKY_VERT,
  STICKER_FRAG,
  STICKER_URLS,
  STICKER_VERT,
  WORK_LAYER_FRAG,
  WORK_LAYER_VERT,
} from '../shaders';
import { HAOQI_WORK } from '../workData';
import { SCENE_CONFIG } from './sceneConfig';
import type { HaoqiSceneHandle, HaoqiSceneRefs } from './types';

const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

function centerObject3D(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  if (center.lengthSq() > 1e-12) root.position.sub(center);
}

function makeGlassMaterial(texture: THREE.Texture, tint?: { color: string; mix: number }) {
  const d = GLASS_DEFAULTS;
  const tintColor = new THREE.Color(tint?.color ?? '#ffffff');
  return new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uScreenResolutionPx: { value: new THREE.Vector2(1, 1) },
      uIorR: { value: d.uIorR },
      uIorY: { value: d.uIorY },
      uIorG: { value: d.uIorG },
      uIorC: { value: d.uIorC },
      uIorB: { value: d.uIorB },
      uIorP: { value: d.uIorP },
      uRefractPower: { value: d.uRefractPower },
      uChromaticAberration: { value: d.uChromaticAberration },
      uSaturation: { value: d.uSaturation },
      uShininess: { value: d.uShininess },
      uDiffuseness: { value: d.uDiffuseness },
      uFresnelPower: { value: d.uFresnelPower },
      uBrightness: { value: d.uBrightness },
      uContrast: { value: d.uContrast },
      uGamma: { value: d.uGamma },
      uSpecularStrength: { value: d.uSpecularStrength },
      uFresnelStrength: { value: d.uFresnelStrength },
      uFresnelSideDir: { value: new THREE.Vector3(...d.uFresnelSideDir) },
      uLight: { value: new THREE.Vector3(...d.uLight) },
      uTintColorA: { value: new THREE.Vector4(tintColor.r, tintColor.g, tintColor.b, 1) },
      uTintColorB: { value: new THREE.Vector4(tintColor.r, tintColor.g, tintColor.b, 1) },
      uTintLocalYRange: { value: new THREE.Vector2(0, 1) },
      uTintEnabled: { value: tint ? 1 : 0 },
      uTintMix: { value: tint?.mix ?? 0 },
      uTintThicknessMinAlpha: { value: 0 },
      uTintThicknessMaxAlpha: { value: 1 },
      uSceneRefractionEnabled: { value: d.uSceneRefractionEnabled },
      uRgbRefraction: { value: d.uRgbRefraction },
      uDark: { value: d.uDark },
      uLoop: { value: d.uLoop },
    },
    vertexShader: GLASS_VERT,
    fragmentShader: GLASS_FRAG,
  });
}

async function buildStickerAtlas() {
  const images = await Promise.all(
    STICKER_URLS.map(
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
  const cols = 4;
  const rows = 3;
  const cellW = Math.max(...images.map((i) => i.width));
  const cellH = Math.max(...images.map((i) => i.height));
  const canvas = document.createElement('canvas');
  canvas.width = cols * cellW;
  canvas.height = rows * cellH;
  const ctx = canvas.getContext('2d')!;
  const rects: THREE.Vector4[] = [];
  images.forEach((img, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    ctx.drawImage(img, col * cellW, row * cellH, cellW, cellH);
    rects.push(
      new THREE.Vector4(
        (col * cellW) / canvas.width,
        (row * cellH) / canvas.height,
        cellW / canvas.width,
        cellH / canvas.height,
      ),
    );
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return { texture, rects };
}

export function createHaoqiScene(mount: HTMLElement, refs: HaoqiSceneRefs): HaoqiSceneHandle {
  let disposed = false;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  mount.appendChild(renderer.domElement);

  const cfg = SCENE_CONFIG;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(cfg.camera.fov, 1, cfg.camera.near, cfg.camera.far);
  camera.position.set(...cfg.camera.position);

  const SIM = 128;
  const velA = new THREE.WebGLRenderTarget(SIM, SIM, {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });
  const velB = velA.clone();
  let velRead = velA;
  let velWrite = velB;

  const bgRT = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const compRT = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const flareRT = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });

  const postScene = new THREE.Scene();
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial());
  postScene.add(postQuad);

  const skyScene = new THREE.Scene();
  const skyCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const skyUniforms = {
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uScrollReveal: { value: 1 },
    uAccentColor: { value: new THREE.Color(SKY_COLOR_HEX.accent) },
    uStripeColorA: { value: new THREE.Color(SKY_COLOR_HEX.stripeA) },
    uStripeColorB: { value: new THREE.Color(SKY_COLOR_HEX.stripeB) },
  };
  const skyMat = new THREE.ShaderMaterial({
    uniforms: skyUniforms,
    vertexShader: SKY_VERT,
    fragmentShader: SKY_FRAG,
    depthTest: false,
    depthWrite: false,
  });
  skyScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), skyMat));

  const fluidDecayMat = new THREE.ShaderMaterial({
    uniforms: { uVelocity: { value: velRead.texture }, uDecay: { value: 0.94 } },
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: FLUID_DECAY_FRAG,
    depthTest: false,
    depthWrite: false,
  });
  const splatMat = new THREE.ShaderMaterial({
    uniforms: {
      uVelocity: { value: velRead.texture },
      uPoint: { value: new THREE.Vector2(0.5, 0.5) },
      uForce: { value: new THREE.Vector2(0, 0) },
      uRadius: { value: 0.08 },
    },
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: FLUID_SPLAT_FRAG,
    depthTest: false,
    depthWrite: false,
  });
  const fluidCompositeMat = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: bgRT.texture },
      uVelocity: { value: velRead.texture },
      uSimSize: { value: new THREE.Vector2(SIM, SIM) },
      uStrength: { value: 28 },
    },
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: FLUID_COMPOSITE_FRAG,
    depthTest: false,
    depthWrite: false,
  });
  const flareMat = new THREE.ShaderMaterial({
    uniforms: {
      tBase: { value: compRT.texture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uHotspot: { value: new THREE.Vector2(...cfg.flare.hotspot) },
    },
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: FLARE_FRAG,
    depthTest: false,
    depthWrite: false,
  });
  const bgDisplayMat = new THREE.MeshBasicMaterial({ map: flareRT.texture, depthTest: false, depthWrite: false });

  const helloGroup = new THREE.Group();
  helloGroup.position.set(...cfg.hello.position);
  helloGroup.rotation.y = THREE.MathUtils.degToRad(cfg.hello.rotationStartDeg + cfg.hello.rotationExtraDeg);
  scene.add(helloGroup);

  const cursorGroup = new THREE.Group();
  cursorGroup.position.set(...cfg.cursor.positionDesktop);
  cursorGroup.rotation.z = THREE.MathUtils.degToRad(cfg.cursor.tiltDeg);
  cursorGroup.scale.setScalar(cfg.cursor.scale);
  scene.add(cursorGroup);

  const cntGroup = new THREE.Group();
  cntGroup.position.set(0, -6, 1);
  cntGroup.rotation.x = THREE.MathUtils.degToRad(-180);
  cntGroup.visible = false;
  scene.add(cntGroup);

  const glassMat = makeGlassMaterial(compRT.texture, cfg.hello.tint);
  const glassMats: THREE.ShaderMaterial[] = [glassMat];
  const loader = new GLTFLoader();
  const texLoader = new THREE.TextureLoader();

  loader.load('/haoqi-static/model/hello.gltf', (gltf) => {
    if (disposed) return;
    centerObject3D(gltf.scene);
    helloGroup.scale.setScalar(window.innerWidth < 1024 ? cfg.hello.scaleMobile : cfg.hello.scaleDesktop);
    gltf.scene.traverse((o) => {
      if (o instanceof THREE.Mesh) o.material = glassMat;
    });
    helloGroup.add(gltf.scene);
  });

  loader.load('/haoqi-static/model/cursor.glb', (gltf) => {
    if (disposed) return;
    centerObject3D(gltf.scene);
    const mat = makeGlassMaterial(compRT.texture, cfg.cursor.tint);
    glassMats.push(mat);
    gltf.scene.traverse((o) => {
      if (o instanceof THREE.Mesh) o.material = mat;
    });
    cursorGroup.add(gltf.scene);
  });

  loader.load('/haoqi-static/model/cnt.gltf', (gltf) => {
    if (disposed) return;
    centerObject3D(gltf.scene);
    const mat = makeGlassMaterial(compRT.texture, cfg.cnt.tint);
    glassMats.push(mat);
    gltf.scene.traverse((o) => {
      if (o instanceof THREE.Mesh) o.material = mat;
    });
    cntGroup.add(gltf.scene);
  });

  const uiScene = new THREE.Scene();
  let uiCam = new THREE.OrthographicCamera(0, 1, 1, 0, -200, 200);
  const workMeshes: THREE.Mesh[] = [];
  HAOQI_WORK.forEach((item, i) => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texLoader.load(item.img) },
        mapHover: { value: texLoader.load(item.hoverImg ?? item.img) },
        uHover: { value: 0 },
        uReveal: { value: 0 },
        uCurl: { value: 0.012 },
        uTime: { value: 0 },
      },
      vertexShader: WORK_LAYER_VERT,
      fragmentShader: WORK_LAYER_FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    mesh.visible = false;
    mesh.renderOrder = 10 + i;
    uiScene.add(mesh);
    workMeshes.push(mesh);
  });

  let stickerMesh: THREE.InstancedMesh | null = null;
  const stickerStates: {
    x: number;
    y: number;
    z: number;
    vy: number;
    rot: number;
    vr: number;
    windPhase: number;
  }[] = [];

  void buildStickerAtlas().then(({ texture, rects }) => {
    if (disposed) return;
    const st = cfg.sticker;
    const count = st.count;
    const geo = new THREE.PlaneGeometry(1, 1);
    const uvRect = new THREE.InstancedBufferAttribute(new Float32Array(count * 4), 4);
    const aPhase = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
    geo.setAttribute('uvRect', uvRect);
    geo.setAttribute('aPhase', aPhase);
    const mat = new THREE.ShaderMaterial({
      uniforms: { map: { value: texture }, uTime: { value: 0 } },
      vertexShader: STICKER_VERT,
      fragmentShader: STICKER_FRAG,
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
      stickerStates.push({
        x: (Math.random() - 0.5) * st.spawnWidth,
        y: st.spawnHeight * (0.4 + Math.random() * 0.6),
        z: st.zOffset - Math.random() * st.zDepth,
        vy: -(0.012 + Math.random() * 0.008) * (st.fallSpeed / 1.8),
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * st.rotationSpeed * 0.05,
        windPhase: Math.random() * Math.PI * 2,
      });
      dummy.position.set(stickerStates[i].x, stickerStates[i].y, stickerStates[i].z);
      dummy.rotation.z = stickerStates[i].rot;
      dummy.scale.setScalar(st.scale3d * st.scale * (0.85 + Math.random() * 0.15));
      dummy.updateMatrix();
      stickerMesh.setMatrixAt(i, dummy.matrix);
    }
    stickerMesh.instanceMatrix.needsUpdate = true;
    scene.add(stickerMesh);
  });

  let lastPointer = { x: 0.5, y: 0.5 };
  const clock = new THREE.Clock();
  let raf = 0;

  const resize = () => {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    if (w < 1 || h < 1) return;
    const pr = renderer.getPixelRatio();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    bgRT.setSize(w * pr, h * pr);
    compRT.setSize(w * pr, h * pr);
    flareRT.setSize(w * pr, h * pr);
    skyUniforms.uResolution.value.set(w, h);
    flareMat.uniforms.uResolution.value.set(w * pr, h * pr);
    uiCam = new THREE.OrthographicCamera(0, w, h, 0, -200, 200);
    helloGroup.scale.setScalar(w < 1024 ? cfg.hello.scaleMobile : cfg.hello.scaleDesktop);
    glassMats.forEach((m) => m.uniforms.uScreenResolutionPx.value.set(w * pr, h * pr));
    glassMats.forEach((m) => {
      m.uniforms.uTexture.value = flareRT.texture;
    });
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(mount);

  const renderPost = (material: THREE.Material, target: THREE.WebGLRenderTarget | null) => {
    postQuad.material = material;
    renderer.setRenderTarget(target);
    renderer.render(postScene, postCam);
  };

  const updateWorkPlanes = (h: number, time: number) => {
    const root = refs.scrollRootRef.current;
    if (!root) return;
    const medias = root.querySelectorAll<HTMLElement>('.haoqi__workMedia');
    workMeshes.forEach((mesh, i) => {
      const el = medias[i];
      const mat = mesh.material as THREE.ShaderMaterial;
      if (!el) {
        mesh.visible = false;
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.bottom < 0 || rect.top > h) {
        mesh.visible = false;
        return;
      }
      mesh.visible = true;
      mesh.position.set(rect.left + rect.width / 2, h - rect.top - rect.height / 2, -i);
      mesh.scale.set(rect.width, rect.height, 1);
      mat.uniforms.uHover.value = refs.hoveredWorkRef.current === i ? 1 : 0;
      mat.uniforms.uReveal.value = refs.workRevealRef.current?.[i] ?? 0;
      mat.uniforms.uTime.value = time;
      mat.uniforms.uCurl.value = 0.008 + (refs.pointerRef.current?.active ? 0.012 : 0);
    });
  };

  const tick = () => {
    raf = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    skyUniforms.uTime.value = t;

    const bp = refs.bannerProgressRef.current ?? 0;
    const fp = refs.footerProgressRef.current ?? 0;
    const mobile = mount.clientWidth < 1024;

    helloGroup.rotation.y = THREE.MathUtils.degToRad(
      THREE.MathUtils.lerp(cfg.hello.rotationStartDeg, cfg.hello.rotationEndDeg, bp) + cfg.hello.rotationExtraDeg,
    );
    skyUniforms.uScrollReveal.value = THREE.MathUtils.lerp(1, 0.65, bp);
    cursorGroup.rotation.y = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(0, cfg.cursor.rotationEndDeg, bp));
    const cPos = mobile ? cfg.cursor.positionMobile : cfg.cursor.positionDesktop;
    cursorGroup.position.set(cPos[0], cPos[1], cPos[2]);

    cntGroup.visible = fp > 0.12;
    cntGroup.position.y = THREE.MathUtils.lerp(cfg.cnt.positionYStart, cfg.cnt.positionYEnd, fp);
    cntGroup.scale.setScalar(THREE.MathUtils.lerp(0, mobile ? cfg.cnt.scaleMobile : cfg.cnt.scaleDesktop, fp));

    const ptr = refs.pointerRef.current;
    if (ptr?.active) {
      const px = ptr.ndcX * 0.5 + 0.5;
      const py = 1.0 - (ptr.ndcY * 0.5 + 0.5);
      const dx = px - lastPointer.x;
      const dy = py - lastPointer.y;
      if (Math.abs(dx) + Math.abs(dy) > 0.0004) {
        splatMat.uniforms.uVelocity.value = velRead.texture;
        splatMat.uniforms.uPoint.value.set(px, py);
        splatMat.uniforms.uForce.value.set(dx * 14, dy * 14);
        renderPost(splatMat, velWrite);
        [velRead, velWrite] = [velWrite, velRead];
        lastPointer = { x: px, y: py };
      }
    }

    fluidDecayMat.uniforms.uVelocity.value = velRead.texture;
    renderPost(fluidDecayMat, velWrite);
    [velRead, velWrite] = [velWrite, velRead];

    renderer.setRenderTarget(bgRT);
    renderer.render(skyScene, skyCam);

    fluidCompositeMat.uniforms.tDiffuse.value = bgRT.texture;
    fluidCompositeMat.uniforms.uVelocity.value = velRead.texture;
    flareMat.uniforms.uTime.value = t;
    renderPost(fluidCompositeMat, compRT);

    flareMat.uniforms.tBase.value = compRT.texture;
    renderPost(flareMat, flareRT);

    glassMats.forEach((m) => {
      m.uniforms.uTexture.value = flareRT.texture;
    });
    bgDisplayMat.map = flareRT.texture;

    const h = mount.clientHeight;

    renderer.setRenderTarget(null);
    renderer.clear();
    renderPost(bgDisplayMat, null);
    renderer.render(scene, camera);

    if (stickerMesh) {
      (stickerMesh.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      const dummy = new THREE.Object3D();
      for (let i = 0; i < stickerStates.length; i++) {
        const s = stickerStates[i];
        const st = cfg.sticker;
        s.x += Math.sin(t * st.windFrequency + s.windPhase) * st.windStrength * 0.0018;
        s.y += s.vy;
        s.rot += s.vr;
        if (s.y < -7) {
          s.y = st.spawnHeight * (0.5 + Math.random() * 0.5);
          s.x = (Math.random() - 0.5) * st.spawnWidth;
          s.windPhase = Math.random() * Math.PI * 2;
        }
        dummy.position.set(s.x, s.y, s.z);
        dummy.rotation.z = s.rot;
        dummy.updateMatrix();
        stickerMesh.setMatrixAt(i, dummy.matrix);
      }
      stickerMesh.instanceMatrix.needsUpdate = true;
    }

    updateWorkPlanes(h, t);
    renderer.autoClear = false;
    renderer.render(uiScene, uiCam);
    renderer.autoClear = true;
  };
  tick();

  return {
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      velA.dispose();
      velB.dispose();
      bgRT.dispose();
      compRT.dispose();
      flareRT.dispose();
      skyMat.dispose();
      fluidDecayMat.dispose();
      splatMat.dispose();
      fluidCompositeMat.dispose();
      flareMat.dispose();
      bgDisplayMat.dispose();
      glassMats.forEach((m) => m.dispose());
      workMeshes.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      stickerMesh?.geometry.dispose();
      (stickerMesh?.material as THREE.Material | undefined)?.dispose?.();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    },
  };
}
