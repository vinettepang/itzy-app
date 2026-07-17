import * as THREE from 'three';
import { createPackedMipmapper } from './createPackedMipmapper';

/** SOURCE · theme.js buildWater uniforms / pose */
export const WATER_COLOR = 0xe2e5f6;
export const WATER_POSE = {
  position: new THREE.Vector3(-0.1193, 0.007851, 0.048929),
  scale: 0.5,
  rotationXDeg: -90,
} as const;

type MakeWaterOpts = {
  renderer: THREE.WebGLRenderer;
  aoMap?: THREE.Texture;
  noiseMap?: THREE.Texture;
  fluidMap?: THREE.Texture;
};

const VERT = /* glsl */ `
varying vec4 vMirrorCoord;
varying vec2 vUv;
varying vec3 vWorldPosition;
uniform mat4 uTextureMatrix;

void main() {
  vUv = uv;
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vMirrorCoord = uTextureMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * SOURCE-shaped · theme `xs` water fragment with packedTexture2DLOD.
 */
const FRAG = /* glsl */ `
varying vec4 vMirrorCoord;
varying vec2 vUv;
varying vec3 vWorldPosition;

uniform sampler2D uTexture;
uniform sampler2D uAOTexture;
uniform sampler2D uNoiseTexture;
uniform sampler2D uFluidTexture;
uniform vec2 uMipmapTextureSize;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uBaseLod;
uniform float uTime;
uniform int u_hasAO;
uniform int u_hasNoise;
uniform int u_hasFluid;

const vec3 US_W = vec3(0.2125, 0.7154, 0.0721);

vec4 packedTexture2DLODInt(sampler2D tex, vec2 uv, int level, vec2 originalPixelSize) {
  float floatLevel = float(level);
  vec2 atlasSize = vec2(floor(originalPixelSize.x * 1.5), originalPixelSize.y);
  float maxLevel = min(floor(log2(originalPixelSize.x)), floor(log2(originalPixelSize.y)));
  floatLevel = min(floatLevel, maxLevel);
  vec2 currentPixelDimensions = floor(originalPixelSize / pow(2.0, floatLevel));
  vec2 pixelOffset = vec2(
    floatLevel > 0.0 ? originalPixelSize.x : 0.0,
    floatLevel > 0.0 ? currentPixelDimensions.y : 0.0
  );
  vec2 minPixel = pixelOffset;
  vec2 maxPixel = pixelOffset + currentPixelDimensions;
  vec2 samplePoint = mix(minPixel, maxPixel, uv) / atlasSize;
  vec2 halfPixelSize = 1.0 / (2.0 * atlasSize);
  samplePoint = min(samplePoint, maxPixel / atlasSize - halfPixelSize);
  samplePoint = max(samplePoint, minPixel / atlasSize + halfPixelSize);
  return texture2D(tex, samplePoint);
}

vec4 packedTexture2DLOD(sampler2D tex, vec2 uv, float level, vec2 originalPixelSize) {
  float ratio = fract(level);
  int minLevel = int(floor(level));
  int maxLevel = int(ceil(level));
  vec4 minValue = packedTexture2DLODInt(tex, uv, minLevel, originalPixelSize);
  vec4 maxValue = packedTexture2DLODInt(tex, uv, maxLevel, originalPixelSize);
  return mix(minValue, maxValue, ratio);
}

void main() {
  vec3 baseColor = uColor;
  float ao = u_hasAO == 1 ? texture2D(uAOTexture, vUv).r : 1.0;

  vec4 fluid = u_hasFluid == 1 ? texture2D(uFluidTexture, vUv) : vec4(0.0);
  vec2 fluidPos = u_hasFluid == 1 ? normalize(fluid.rgb + 1e-5).xy : vec2(0.0);

  float noiseTime = uTime * 0.05;
  vec2 noisePos = vec2((vUv.x + 0.5) * 6.0, vUv.y * 20.0) * 0.25;
  vec3 n1 = u_hasNoise == 1
    ? texture2D(uNoiseTexture, noisePos + vec2(0.0, 1.0 - noiseTime)).rgb - 0.5
    : vec3(0.0);

  float edgeReduce = smoothstep(0.0, uResolution.x * 0.1, gl_FragCoord.x)
    * smoothstep(uResolution.x, uResolution.x * 0.9, gl_FragCoord.x);

  vec2 reflectionUv = vMirrorCoord.xy / max(vMirrorCoord.w, 1e-5);
  reflectionUv.x += n1.x * 0.03 * edgeReduce * ao;
  reflectionUv.xy += fluidPos * 0.02 * ao * edgeReduce;

  vec2 fluidSpec = n1.xy + abs(fluidPos * 8.0);
  vec3 worldNormal = normalize(vec3(fluidSpec.x, 0.5 + fluidSpec.x, fluidSpec.y));
  vec3 specRay = reflect(normalize(vWorldPosition - cameraPosition), worldNormal);
  float spec = smoothstep(0.05, 1.0, dot(specRay, normalize(vec3(-1.0, 1.0, 1.0))));

  float lod = clamp(uBaseLod + spec * 2.0, 0.0, 4.0) * ao;
  lod += clamp(length(fluidPos.xy) * 12.0, 0.0, 2.0);

  vec3 color = packedTexture2DLOD(uTexture, reflectionUv, lod, uMipmapTextureSize).rgb;
  color *= baseColor;
  color *= mix(0.9, 1.0, n1.x) + spec * 0.2 * ao;

  float lum = dot(abs(fluid.rgb), US_W);
  color += lum * 0.7 * ao;

  gl_FragColor = vec4(color, 1.0);
}
`;

/**
 * Custom Reflector · theme xs + vs packed mip atlas.
 */
export function createWaterPlane({ renderer, aoMap, noiseMap, fluidMap }: MakeWaterOpts) {
  const dpr = Math.min(renderer.getPixelRatio(), 2);
  const textureSize = new THREE.Vector2(
    Math.max(2, Math.floor(0.5 * window.innerWidth * dpr)),
    Math.max(2, Math.floor(0.5 * window.innerHeight * dpr)),
  );

  const renderTarget = new THREE.WebGLRenderTarget(textureSize.x, textureSize.y, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: false,
  });
  const mipmapper = createPackedMipmapper();
  mipmapper.resize(textureSize);

  const uniforms = {
    uTexture: { value: renderTarget.texture },
    uTextureMatrix: { value: new THREE.Matrix4() },
    uAOTexture: { value: aoMap ?? null },
    uNoiseTexture: { value: noiseMap ?? null },
    uFluidTexture: { value: fluidMap ?? null },
    uMipmapTextureSize: { value: textureSize.clone() },
    uResolution: {
      value: new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr),
    },
    uColor: { value: new THREE.Color(WATER_COLOR) },
    uBaseLod: { value: 1 },
    uTime: { value: 0 },
    u_hasAO: { value: aoMap ? 1 : 0 },
    u_hasNoise: { value: noiseMap ? 1 : 0 },
    u_hasFluid: { value: fluidMap ? 1 : 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: false,
  });

  const geo = new THREE.PlaneGeometry(1, 1);
  const mesh = new THREE.Mesh(geo, material);
  mesh.rotation.x = THREE.MathUtils.degToRad(WATER_POSE.rotationXDeg);
  mesh.position.copy(WATER_POSE.position);
  mesh.scale.setScalar(WATER_POSE.scale);
  mesh.matrixAutoUpdate = true;
  mesh.name = 'water';

  // Reflector math (three.js Reflector / theme xs)
  const virtualCamera = new THREE.PerspectiveCamera();
  const reflectorPlane = new THREE.Plane();
  const normal = new THREE.Vector3();
  const reflectorWorldPosition = new THREE.Vector3();
  const cameraWorldPosition = new THREE.Vector3();
  const rotationMatrix = new THREE.Matrix4();
  const lookAtPosition = new THREE.Vector3(0, 0, -1);
  const clipPlane = new THREE.Vector4();
  const view = new THREE.Vector3();
  const target = new THREE.Vector3();
  const q = new THREE.Vector4();
  const textureMatrix = uniforms.uTextureMatrix.value;
  const ignoreObjects: THREE.Object3D[] = [];
  let sceneRef: THREE.Scene | null = null;
  let sceneCamera: THREE.Camera | null = null;

  const onBeforeRender = (
    _renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
  ) => {
    sceneRef = scene;
    sceneCamera = camera;

    reflectorWorldPosition.setFromMatrixPosition(mesh.matrixWorld);
    cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);
    rotationMatrix.extractRotation(mesh.matrixWorld);
    normal.set(0, 0, 1).applyMatrix4(rotationMatrix);

    view.subVectors(reflectorWorldPosition, cameraWorldPosition);
    if (view.dot(normal) > 0) return;

    view.reflect(normal).negate().add(reflectorWorldPosition);
    rotationMatrix.extractRotation(camera.matrixWorld);
    lookAtPosition.set(0, 0, -1).applyMatrix4(rotationMatrix).add(cameraWorldPosition);
    target.subVectors(reflectorWorldPosition, lookAtPosition).reflect(normal).negate().add(reflectorWorldPosition);

    virtualCamera.position.copy(view);
    virtualCamera.up.set(0, 1, 0).applyMatrix4(rotationMatrix).reflect(normal);
    virtualCamera.lookAt(target);
    virtualCamera.far = (camera as THREE.PerspectiveCamera).far ?? 2000;
    virtualCamera.updateMatrixWorld();
    virtualCamera.projectionMatrix.copy((camera as THREE.PerspectiveCamera).projectionMatrix);

    textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
    textureMatrix.multiply(virtualCamera.projectionMatrix);
    textureMatrix.multiply(virtualCamera.matrixWorldInverse);
    textureMatrix.multiply(mesh.matrixWorld);

    reflectorPlane.setFromNormalAndCoplanarPoint(normal, reflectorWorldPosition);
    reflectorPlane.applyMatrix4(virtualCamera.matrixWorldInverse);
    clipPlane.set(
      reflectorPlane.normal.x,
      reflectorPlane.normal.y,
      reflectorPlane.normal.z,
      reflectorPlane.constant,
    );

    const projectionMatrix = virtualCamera.projectionMatrix;
    q.x = (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
    q.y = (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
    q.z = -1;
    q.w = (1 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];
    clipPlane.multiplyScalar(2 / clipPlane.dot(q));
    projectionMatrix.elements[2] = clipPlane.x;
    projectionMatrix.elements[6] = clipPlane.y;
    projectionMatrix.elements[10] = clipPlane.z + 1 - 0.003;
    projectionMatrix.elements[14] = clipPlane.w;

    mesh.visible = false;
    for (const o of ignoreObjects) o.visible = false;

    const currentRT = renderer.getRenderTarget();
    const currentXrEnabled = renderer.xr.enabled;
    const currentAutoClear = renderer.autoClear;
    const prevClear = new THREE.Color();
    renderer.getClearColor(prevClear);
    const prevAlpha = renderer.getClearAlpha();
    renderer.xr.enabled = false;
    renderer.autoClear = true;
    renderer.setRenderTarget(renderTarget);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(scene, virtualCamera);

    const atlas = mipmapper.update(renderTarget.texture, renderTarget, renderer);
    uniforms.uTexture.value = atlas.texture;
    uniforms.uMipmapTextureSize.value.copy(textureSize);

    renderer.setRenderTarget(currentRT);
    renderer.setClearColor(prevClear, prevAlpha);
    renderer.autoClear = currentAutoClear;
    renderer.xr.enabled = currentXrEnabled;

    mesh.visible = true;
    for (const o of ignoreObjects) o.visible = true;
  };

  mesh.onBeforeRender = onBeforeRender;

  const resize = () => {
    const d = Math.min(renderer.getPixelRatio(), 2);
    textureSize.set(
      Math.max(2, Math.floor(0.5 * window.innerWidth * d)),
      Math.max(2, Math.floor(0.5 * window.innerHeight * d)),
    );
    renderTarget.setSize(textureSize.x, textureSize.y);
    mipmapper.resize(textureSize);
    uniforms.uMipmapTextureSize.value.copy(textureSize);
    uniforms.uResolution.value.set(window.innerWidth * d, window.innerHeight * d);
  };

  return {
    mesh,
    setFluidMap(tex: THREE.Texture | null) {
      uniforms.uFluidTexture.value = tex;
      uniforms.u_hasFluid.value = tex ? 1 : 0;
    },
    setIgnoreObjects(objs: THREE.Object3D[]) {
      ignoreObjects.length = 0;
      ignoreObjects.push(...objs);
    },
    update(timeSec: number) {
      uniforms.uTime.value = timeSec;
      void sceneRef;
      void sceneCamera;
    },
    resize,
    dispose() {
      mesh.onBeforeRender = () => undefined;
      renderTarget.dispose();
      mipmapper.dispose();
      geo.dispose();
      material.dispose();
    },
  };
}
