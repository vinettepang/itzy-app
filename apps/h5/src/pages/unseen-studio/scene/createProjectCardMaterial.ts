import * as THREE from 'three';

type CardMatOpts = {
  map?: THREE.Texture | null;
  color?: THREE.ColorRepresentation;
  fogColor?: THREE.ColorRepresentation;
  fogNear?: number;
  fogFar?: number;
  heightOffset?: number;
  bendPoint?: THREE.Vector2;
};

const VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorldPos;
varying float zPos;

uniform float u_time;
uniform float u_random;
uniform float u_heightOffset;
uniform vec2 u_bendPoint;

void main() {
  vUv = uv;
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;

  float noise = sin((vWorldPos.x - vWorldPos.y * 0.1) * 0.03 + -u_time * 1.1 + cos(vWorldPos.z * 0.04) * 10.) * 50.;
  float noise2 = sin((vWorldPos.x + vWorldPos.y * 0.1) * 0.01 + -u_time * 0.4) * 0.5;

  vec3 transformedPos = position;

  float ripple = sin((vWorldPos.x - vWorldPos.y) * 0.02 + -u_time * 2.) * 12.;
  transformedPos.z += ripple;

  float bend = smoothstep(u_bendPoint.x, u_bendPoint.y, vWorldPos.y);
  transformedPos.z -= 1200. * bend;
  transformedPos.z -= noise * bend;
  transformedPos.y -= (1.5 - noise2) * smoothstep(u_bendPoint.x * 1.1, u_bendPoint.y * 0.7, vWorldPos.y) * u_heightOffset;

  zPos = ripple;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPos, 1.0);
}
`;

const FRAG = /* glsl */ `
vec2 backgroundCoverUv(vec2 screenSize, vec2 imageSize, vec2 uv) {
  float screenRatio = screenSize.x / max(screenSize.y, 0.0001);
  float imageRatio = imageSize.x / max(imageSize.y, 0.0001);
  vec2 newSize = screenRatio < imageRatio
    ? vec2(imageSize.x * (screenSize.y / imageSize.y), screenSize.y)
    : vec2(screenSize.x, imageSize.y * (screenSize.x / imageSize.x));
  vec2 newOffset = (screenRatio < imageRatio
    ? vec2((newSize.x - screenSize.x) / 2.0, 0.0)
    : vec2(0.0, (newSize.y - screenSize.y) / 2.0)) / newSize;
  return uv * screenSize / newSize + newOffset;
}

varying vec2 vUv;
varying float zPos;

uniform sampler2D uTexture;
uniform int u_hasMap;
uniform vec3 u_fallbackColor;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
uniform vec2 u_imageSize;
uniform vec2 u_meshSize;
uniform float u_innerScale;
uniform float u_opacity;

void main() {
  vec2 scaleOrigin = vec2(0.5, 0.5);
  vec4 imageColor;

  if (u_hasMap == 1) {
    vec2 uv = backgroundCoverUv(u_meshSize, u_imageSize, vUv);
    uv = (uv - scaleOrigin) / u_innerScale + scaleOrigin;
    imageColor = texture2D(uTexture, uv);
  } else {
    imageColor = vec4(u_fallbackColor, 1.0);
  }

  imageColor.rgb += smoothstep(0., 10., zPos * 0.3) * 0.3;
  gl_FragColor = imageColor;

  float depth = gl_FragCoord.z / gl_FragCoord.w;
  gl_FragColor.a *= smoothstep(2000., 1500., depth);

  float fogFactor = smoothstep(fogNear, fogFar, depth);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
  gl_FragColor.a *= u_opacity;
}
`;

/**
 * SOURCE-shaped · theme `Ts`/`Ss` project card materials (bend + cover UV + hover scale).
 */
export function createProjectCardMaterial({
  map = null,
  color = 0xffffff,
  fogColor = 0xe5e5e5,
  fogNear = 500,
  fogFar = 4500,
  heightOffset = 1,
  bendPoint,
}: CardMatOpts) {
  const fallback = new THREE.Color(color);
  const avg = (fallback.r + fallback.g + fallback.b) / 3;
  if (avg > 0.82) fallback.offsetHSL(0, 0.04, -0.12);

  const blank = new THREE.Texture();
  const imageSize = new THREE.Vector2(1, 1);
  if (map?.image && (map.image as HTMLImageElement).width) {
    const img = map.image as HTMLImageElement;
    imageSize.set(img.width || 1, img.height || 1);
  }

  const uniforms = {
    uTexture: { value: map ?? blank },
    u_hasMap: { value: map ? 1 : 0 },
    u_fallbackColor: { value: fallback.clone() },
    fogColor: { value: new THREE.Color(fogColor) },
    fogNear: { value: fogNear },
    fogFar: { value: fogFar },
    u_imageSize: { value: imageSize },
    u_meshSize: { value: new THREE.Vector2(820, 430) },
    u_innerScale: { value: 1 },
    u_opacity: { value: 1 },
    u_time: { value: 0 },
    u_random: { value: Math.random() + 1 },
    u_heightOffset: { value: heightOffset },
    u_bendPoint: { value: bendPoint?.clone() ?? new THREE.Vector2(130, 530) },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  return {
    material,
    uniforms,
    setMap(tex: THREE.Texture | null) {
      if (tex) {
        uniforms.uTexture.value = tex;
        uniforms.u_hasMap.value = 1;
        const img = tex.image as { width?: number; height?: number } | undefined;
        if (img?.width && img?.height) {
          uniforms.u_imageSize.value.set(img.width, img.height);
        }
      } else {
        uniforms.uTexture.value = blank;
        uniforms.u_hasMap.value = 0;
      }
      material.needsUpdate = true;
    },
    setMeshSize(w: number, h: number) {
      uniforms.u_meshSize.value.set(w, h);
    },
    setBendPoint(x: number, y: number) {
      uniforms.u_bendPoint.value.set(x, y);
    },
    setInnerScale(v: number) {
      uniforms.u_innerScale.value = v;
    },
    setVelocity(_v: number) {
      /* bend is world-Y driven via u_bendPoint as the wall scrolls */
    },
    setOpacity(v: number) {
      uniforms.u_opacity.value = v;
    },
    setTime(t: number) {
      uniforms.u_time.value = t;
    },
    dispose() {
      material.dispose();
      blank.dispose();
    },
  };
}
