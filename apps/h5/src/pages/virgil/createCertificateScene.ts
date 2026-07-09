import * as THREE from 'three';
import { CERTIFICATE_CONFIG as cfg } from './certificateConfig';
import { computeCertificateTargets } from './certificateScroll';
import { CERT_FRAG, CERT_VERT } from './certificateShaders';

export type CertificateSceneHandle = {
  dispose: () => void;
};

type CreateOpts = {
  pointer: () => { x: number; y: number };
  scrollOffsetVh?: number;
  getResetTrigger?: () => number;
};

function smoothStep(current: number, target: number, factor: number, epsilon: number) {
  const next = current + (target - current) * factor;
  return Math.abs(next - target) < epsilon ? target : next;
}

/** 生产站按纹理宽高比自适应相机距离，使证书铺满视口 */
/** 生产站按纹理宽高比自适应相机距离，使证书铺满视口 */
function fitCameraDistance(fovDeg: number, textureAspect: number, viewAspect: number) {
  const fovRad = (fovDeg * Math.PI) / 180;
  return textureAspect / (2 * Math.tan(fovRad / 2) * viewAspect);
}

function sceneViewportHeight(): number {
  const mobile = window.innerWidth <= 700;
  if (mobile) {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--initial-vh');
    const parsed = parseFloat(raw);
    return parsed > 0 ? parsed : window.innerHeight;
  }
  return window.innerHeight;
}

export async function createCertificateScene(
  mount: HTMLElement,
  opts: CreateOpts,
): Promise<CertificateSceneHandle> {
  const loader = new THREE.TextureLoader();
  const [mapTex, foilTex] = await Promise.all([
    loader.loadAsync(cfg.textures.map),
    loader.loadAsync(cfg.textures.foil),
  ]);
  mapTex.colorSpace = THREE.SRGBColorSpace;
  foilTex.colorSpace = THREE.NoColorSpace;

  const aspect = mapTex.image.width / mapTex.image.height;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(cfg.camera.fov, 1, 0.1, 200);
  camera.position.set(...cfg.camera.position);

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: mapTex },
      uFoilMap: { value: foilTex },
      matteRoughness: { value: cfg.materials.matteRoughness },
      reflectiveStrength: { value: cfg.materials.reflectiveStrength },
      uCameraPosition: { value: camera.position.clone() },
      uLight1Position: { value: new THREE.Vector3(...cfg.light1.position) },
      uLight1Intensity: { value: cfg.light1.intensity },
      uLight2Position: { value: new THREE.Vector3(...cfg.light2.position) },
      uLight2Intensity: { value: cfg.light2.intensity },
      uTime: { value: 0 },
      uScrollOffset: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uBevelSize: { value: cfg.materials.bevelSize },
      uBevelStrength: { value: cfg.materials.bevelStrength },
      uFoilSaturation: { value: cfg.materials.foilSaturation },
      uFoilOpacity: { value: cfg.materials.foilOpacity },
      uFoilContrast: { value: cfg.materials.foilContrast },
      uCurlAmount: { value: cfg.curl.amount },
      uCurlTightness: { value: cfg.curl.tightness },
      uCurlOrigin: { value: cfg.curl.origin },
      uCurlOriginEdge: { value: cfg.curl.originEdge },
      uAspect: { value: aspect },
    },
    vertexShader: CERT_VERT,
    fragmentShader: CERT_FRAG,
    transparent: true,
  });

  const geo = new THREE.PlaneGeometry(aspect, 1, 128, 128);
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  const clock = new THREE.Clock();
  let raf = 0;
  const scrollOffsetVh = opts.scrollOffsetVh ?? 0;
  const anim = cfg.animation;
  const aspectMult = window.innerWidth / window.innerHeight;
  let smoothScale: number = anim.scaleBase;
  let smoothPosY: number =
    (window.innerWidth <= 700 ? cfg.scroll.positionYStartMobile : cfg.scroll.positionYStart) *
    (1.74 / aspectMult);
  let smoothTilt: number = anim.startRotation;
  let smoothCurl: number = cfg.curl.amount;
  let lastResetTrigger = opts.getResetTrigger?.() ?? -1;

  const applyReset = () => {
    const aspectMultNow = window.innerWidth / window.innerHeight;
    smoothScale = anim.scaleBase;
    smoothPosY =
      (window.innerWidth <= 700 ? cfg.scroll.positionYStartMobile : cfg.scroll.positionYStart) *
      (1.74 / aspectMultNow);
    smoothTilt = anim.startRotation;
    smoothCurl = cfg.curl.amount;
    mount.style.opacity = '1';
  };

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
    const t = clock.getElapsedTime();
    const resetNow = opts.getResetTrigger?.() ?? 0;
    if (resetNow !== lastResetTrigger) {
      lastResetTrigger = resetNow;
      applyReset();
    }

    const targets = computeCertificateTargets(window.scrollY, scrollOffsetVh);

    smoothScale = smoothStep(smoothScale, targets.scale, 0.12, 1e-4);
    smoothPosY = smoothStep(smoothPosY, targets.positionY, 0.12, 1e-4);
    smoothTilt = smoothStep(smoothTilt, targets.tiltDeg, 0.18, 0.01);
    smoothCurl = smoothStep(smoothCurl, targets.curlAmount, 0.12, 1e-4);

    mesh.position.y = smoothPosY;
    mesh.scale.setScalar(smoothScale);
    mesh.rotation.z = THREE.MathUtils.degToRad(smoothTilt);

    const ptr = opts.pointer();
    mat.uniforms.uTime.value = t;
    mat.uniforms.uScrollOffset.value = targets.progress * 2;
    mat.uniforms.uMouse.value.set(ptr.x, ptr.y);
    mat.uniforms.uCurlAmount.value = smoothCurl;

    const certPhaseEnd = 3 * sceneViewportHeight();
    const { exitStart, exitEnd } = cfg.animation;
    if (window.scrollY > certPhaseEnd) {
      mount.style.opacity = '0';
    } else if (targets.progress >= exitStart) {
      const u =
        exitEnd > exitStart ? (targets.progress - exitStart) / (exitEnd - exitStart) : 1;
      mount.style.opacity = String(Math.max(0, 1 - u));
    } else {
      mount.style.opacity = '1';
    }

    const viewAspect =
      camera.aspect > 0 ? camera.aspect : window.innerWidth / window.innerHeight;
    const fitZ = fitCameraDistance(cfg.camera.fov, aspect, viewAspect);
    const z = fitZ * (cfg.camera.position[2] / 50);
    camera.position.set(cfg.camera.position[0], cfg.camera.position[1], z);
    camera.updateProjectionMatrix();
    mat.uniforms.uCameraPosition.value.copy(camera.position);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geo.dispose();
      mat.dispose();
      mapTex.dispose();
      foilTex.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    },
  };
}
