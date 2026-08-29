/** 玻璃色散材质 — 还原自 haoqi.design production chunk 7758f29a8aeb1c60 */
import { assetUrl } from '@/utils/assetUrl';

export const GLASS_VERT = /* glsl */ `
varying vec3 worldNormal;
varying vec3 eyeVector;
varying float modelLocalY;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
  worldNormal = normalize(mat3(modelMatrix) * normal);
  eyeVector = normalize(worldPos.xyz - cameraPosition);
  modelLocalY = position.y;
}
`;

export const GLASS_FRAG = /* glsl */ `
precision highp float;

uniform float uIorR;
uniform float uIorY;
uniform float uIorG;
uniform float uIorC;
uniform float uIorB;
uniform float uIorP;
uniform float uSaturation;
uniform float uChromaticAberration;
uniform float uRefractPower;
uniform float uFresnelPower;
uniform float uShininess;
uniform float uDiffuseness;
uniform vec3 uLight;
uniform float uBrightness;
uniform float uContrast;
uniform float uGamma;
uniform float uSpecularStrength;
uniform float uFresnelStrength;
uniform vec3 uFresnelSideDir;
uniform vec4 uTintColorA;
uniform vec4 uTintColorB;
uniform vec2 uTintLocalYRange;
uniform float uTintEnabled;
uniform float uTintMix;
uniform float uTintThicknessMinAlpha;
uniform float uTintThicknessMaxAlpha;
uniform vec2 uScreenResolutionPx;
uniform sampler2D uTexture;
uniform float uSceneRefractionEnabled;
uniform float uRgbRefraction;
uniform float uDark;
uniform int uLoop;

varying vec3 worldNormal;
varying vec3 eyeVector;
varying float modelLocalY;

float random(vec2 p) {
  return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 sat(vec3 rgb, float adjustment) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  vec3 intensity = vec3(dot(rgb, W));
  return mix(intensity, rgb, adjustment);
}

float fresnel(vec3 eyeDir, vec3 normal, float power) {
  float fresnelFactor = abs(dot(eyeDir, normal));
  return pow(1.0 - fresnelFactor, power);
}

float specular(vec3 light, vec3 normal, vec3 eyeDir, float shininess, float diffuseness) {
  vec3 lightVector = normalize(-light);
  vec3 halfVector = normalize(eyeDir + lightVector);
  float NdotL = dot(normal, lightVector);
  float NdotH = abs(dot(normal, halfVector));
  return pow(NdotH, shininess) + max(0.0, NdotL) * diffuseness;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uScreenResolutionPx.xy;
  vec3 normal = normalize(worldNormal);
  vec3 eyeDir = normalize(eyeVector);
  vec3 color;

  if (uSceneRefractionEnabled > 0.5) {
    color = vec3(0.0);
    float noise = random(uv) * 0.025;
    if (uRgbRefraction > 0.5) {
      vec3 rR = refract(eyeDir, normal, 1.0 / uIorR);
      vec3 rG = refract(eyeDir, normal, 1.0 / uIorG);
      vec3 rB = refract(eyeDir, normal, 1.0 / uIorB);
      for (int i = 0; i < 3; i++) {
        float slide = float(i) / 3.0 * 0.1 + noise;
        float offset = (uRefractPower + slide) * uChromaticAberration;
        color.r += texture2D(uTexture, uv + rR.xy * offset).r;
        color.g += texture2D(uTexture, uv + rG.xy * offset).g;
        color.b += texture2D(uTexture, uv + rB.xy * offset).b;
      }
    }
    color /= 3.0;
  } else {
    color = texture2D(uTexture, uv).rgb;
  }

  color = sat(color, uSaturation);
  color *= uBrightness;
  color = (color - 0.5) * uContrast + 0.5;
  color = pow(max(color, 0.0), vec3(1.0 / max(uGamma, 0.0001)));

  float spec = specular(uLight, normal, eyeDir, uShininess, uDiffuseness);
  color += spec * uSpecularStrength;

  float f = fresnel(eyeDir, normal, uFresnelPower);
  float sideMask = smoothstep(-0.5, 0.5, dot(normal, normalize(uFresnelSideDir)));
  color += f * sideMask * uFresnelStrength;

  if (uTintEnabled > 0.5) {
    color = mix(color, uTintColorA.rgb, clamp(uTintMix, 0.0, 1.0));
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

export const SKY_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.999, 1.0);
}
`;

/** 天空渐变 + sampleHyperspace 星芒 + 垂直光线（还原生产 chunk __11 的 2D 全屏版） */
export const SKY_FRAG = /* glsl */ `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uScrollReveal;
uniform vec3 uAccentColor;
uniform vec3 uStripeColorA;
uniform vec3 uStripeColorB;

varying vec2 vUv;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 sampleHyperspace(vec2 fragCoord) {
  vec2 R = uResolution;
  float baseScale = max(1.0, min(R.x, R.y));
  vec2 u = (fragCoord * 2.0 - R) / baseScale;
  u.x -= 0.15;

  float dur = 2.0;
  float time = mod(uTime, dur);
  float t = clamp(time / dur, 0.0, 1.0);

  const float cellDensity = 100.0;
  vec2 polar = vec2(atan(u.y, u.x) / 3.0, length(u));
  float angleCoord = (6.0 - polar.x) * cellDensity;
  float angleId = floor(angleCoord) + 0.5;
  float angleCell = abs(fract(angleCoord) - 0.5);
  float radialCoord = (6.0 - polar.y) * cellDensity;
  vec2 q = vec2(angleId, radialCoord);

  float travel = smoothstep(0.0, 1.0, t);
  float keepProbability = mix(0.18, 1.0, travel);
  float scrollSpeed = mix(0.7, 3.6, travel);
  float trailLength = mix(2.7, 0.975, travel);
  float raySeq = fract((angleId + 0.5) * 0.61803398875);
  float keepEdge = 0.025;
  float keepMask = 1.0 - smoothstep(keepProbability - keepEdge, keepProbability + keepEdge, raySeq);

  float phaseBase = (q.y * 0.02 + q.x * 0.4) * fract(q.x * 0.61);
  vec4 spark = max(
    1.0 - fract(vec4(7.0, 6.0, 4.0, 0.0) * 0.02 + phaseBase + time * scrollSpeed) * trailLength,
    0.0
  );
  float channelMix = max(max(spark.r, spark.g), spark.b);
  float edge = max(fwidth(channelMix) * 1.5, 2.0 / max(R.y, 1.0));
  float star = smoothstep(0.12 - edge, 0.12 + edge, channelMix);
  float thinEdge = max(fwidth(angleCell) * 1.5, 0.002);
  float thinMask = 1.0 - smoothstep(0.13 - thinEdge, 0.13 + thinEdge, angleCell);
  star *= thinMask * keepMask;

  float radialBoost = pow(smoothstep(0.1, 1.0, polar.y), 1.25);
  float intensity = mix(0.0, 6.5, t * 1.2);
  float stripeBlend = hash21(vec2(angleId, 19.713));
  vec3 stripeRgb = mix(uStripeColorA, uStripeColorB, stripeBlend);
  vec3 hsvA = rgb2hsv(max(uStripeColorA, vec3(1e-5)));
  vec3 hsvB = rgb2hsv(max(uStripeColorB, vec3(1e-5)));
  float dh = abs(hsvA.x - hsvB.x);
  dh = min(dh, 1.0 - dh);
  float hueBand = clamp(dh * 1.25 + 0.04, 0.07, 0.24);
  vec3 hsv = rgb2hsv(max(stripeRgb, vec3(1e-5)));
  float idHash = hash21(vec2(angleId, 6.18));
  float idHash2 = hash21(vec2(angleId, 91.7));
  float scrollPhase = time * scrollSpeed;
  float hueAnim = sin(scrollPhase * 0.52 + angleId * 0.29 + idHash * 6.2831853) * (hueBand * 0.85);
  float hueStripe = (idHash - 0.5) * hueBand * 2.0;
  hsv.x = fract(hsv.x + hueStripe + hueAnim);
  hsv.y = clamp(hsv.y * mix(0.96, 1.06, idHash2), 0.0, 1.0);
  hsv.z = clamp(hsv.z * mix(0.97, 1.05, idHash), 0.0, 1.0);
  vec3 sparkColor = hsv2rgb(hsv);
  float pulse = mix(0.78, 1.0, smoothstep(0.14, 0.5, channelMix));
  return intensity * radialBoost * sparkColor * star * pulse;
}

void main() {
  vec2 uv = vUv;
  vec2 fragCoord = uv * uResolution;

  vec3 top = vec3(0.72, 0.86, 0.96);
  vec3 bottom = vec3(0.84, 0.91, 0.96);
  vec3 base = mix(bottom, top, smoothstep(0.0, 1.0, uv.y));
  base = mix(base, uAccentColor, 0.42);

  float reveal = clamp(uScrollReveal, 0.0, 1.0);
  vec3 stripes = sampleHyperspace(fragCoord);
  float stripeLuma = dot(stripes, vec3(0.299, 0.587, 0.114));
  float darken = smoothstep(0.0, 0.88, reveal);
  vec3 darkBase = mix(uAccentColor, vec3(0.0), darken);
  float gapMask = (1.0 - smoothstep(0.035, 0.12, stripeLuma)) * reveal;
  vec3 col = darkBase + stripes * reveal * 0.85 + uAccentColor * gapMask * 0.07;

  float streak = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float x = 0.32 + fi * 0.1 + sin(uTime * 0.18 + fi * 1.4) * 0.035;
    float w = 0.016 + fi * 0.005;
    float band = exp(-pow((uv.x - x) / w, 2.0));
    band *= smoothstep(0.12, 0.8, uv.y) * smoothstep(1.0, 0.3, uv.y);
    streak += band * (0.22 + fi * 0.07);
  }
  col += vec3(1.0, 0.98, 0.96) * streak;
  col = mix(base, col, 0.82);

  gl_FragColor = vec4(col, 1.0);
}
`;

/** 生产环境蓝色调（SOURCE: tingColor / 视觉） */
export const SKY_COLOR_HEX = {
  accent: '#b8daf4',
  stripeA: '#009dff',
  stripeB: '#64c3ff',
} as const;

export const GLASS_DEFAULTS = {
  uIorR: 1.15,
  uIorY: 1.16,
  uIorG: 1.18,
  uIorC: 1.22,
  uIorB: 1.22,
  uIorP: 1.22,
  uRefractPower: 0.24,
  uChromaticAberration: 0.24,
  uSaturation: 1,
  uShininess: 40,
  uDiffuseness: 0.1,
  uFresnelPower: 6,
  uBrightness: 1,
  uContrast: 1,
  uGamma: 1,
  uSpecularStrength: 1.2,
  uFresnelStrength: 1,
  uFresnelSideDir: [-1, 0.3, 1] as const,
  uLight: [4, 9, 0.5] as const,
  uLoop: 3,
  uSceneRefractionEnabled: 1,
  uRgbRefraction: 1,
  uDark: 0,
  uTintEnabled: 0,
  uTintMix: 0,
  uTintThicknessMinAlpha: 0,
  uTintThicknessMaxAlpha: 1,
};

/** 流体位移合成 */
export const FLUID_COMPOSITE_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tDiffuse;
uniform sampler2D uVelocity;
uniform vec2 uSimSize;
uniform float uStrength;
varying vec2 vUv;
void main() {
  vec2 vel = texture2D(uVelocity, vUv).xy;
  vec2 off = vel / max(uSimSize, vec2(1.0)) * uStrength;
  vec3 col = texture2D(tDiffuse, clamp(vUv - off, 0.0, 1.0)).rgb;
  float mag = length(vel);
  col += vec3(0.2, 0.45, 0.9) * smoothstep(0.02, 0.35, mag) * 0.15;
  gl_FragColor = vec4(col, 1.0);
}
`;

/** 速度场衰减 */
export const FLUID_DECAY_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uVelocity;
uniform float uDecay;
varying vec2 vUv;
void main() {
  vec2 v = texture2D(uVelocity, vUv).xy * uDecay;
  gl_FragColor = vec4(v, 0.0, 1.0);
}
`;

/** 指针 splat */
export const FLUID_SPLAT_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uVelocity;
uniform vec2 uPoint;
uniform vec2 uForce;
uniform float uRadius;
varying vec2 vUv;
void main() {
  vec2 v = texture2D(uVelocity, vUv).xy;
  float d = distance(vUv, uPoint);
  float m = exp(-pow(d / uRadius, 2.0));
  v += uForce * m;
  gl_FragColor = vec4(v, 0.0, 1.0);
}
`;

/** Lens flare 合成 */
export const FLARE_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tBase;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uHotspot;
varying vec2 vUv;
void main() {
  vec3 base = texture2D(tBase, vUv).rgb;
  vec2 uv = vUv;
  vec2 toHot = uHotspot - uv;
  float dist = length(toHot);
  float streak = 0.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float ang = fi * 0.4 + uTime * 0.05;
    vec2 dir = vec2(cos(ang), sin(ang));
    float line = exp(-abs(dot(normalize(toHot + 1e-5), dir)) * 12.0);
    line *= exp(-dist * (2.5 + fi * 0.4));
    streak += line * (0.08 + fi * 0.03);
  }
  float glow = exp(-dist * 3.5) * 0.35;
  vec3 flare = vec3(0.75, 0.88, 1.0) * (streak + glow);
  gl_FragColor = vec4(base + flare, 1.0);
}
`;

/** 贴纸粒子 */
export const STICKER_VERT = /* glsl */ `
attribute vec4 uvRect;
attribute float aPhase;
varying vec2 vAtlasUv;
varying float vAlpha;
uniform float uTime;
void main() {
  vAtlasUv = uvRect.xy + uv * uvRect.zw;
  vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vAlpha = 0.65 + 0.35 * sin(uTime * 2.0 + aPhase);
}
`;

export const STICKER_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D map;
varying vec2 vAtlasUv;
varying float vAlpha;
void main() {
  vec4 c = texture2D(map, vAtlasUv);
  if (c.a < 0.05) discard;
  gl_FragColor = vec4(c.rgb, c.a * vAlpha);
}
`;

/** Work 图层（curl 扭曲） */
export const WORK_LAYER_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const WORK_LAYER_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D map;
uniform sampler2D mapHover;
uniform float uHover;
uniform float uReveal;
uniform float uCurl;
uniform float uTime;
varying vec2 vUv;
void main() {
  vec2 curl = vec2(
    sin(vUv.y * 12.0 + uTime * 1.2),
    cos(vUv.x * 10.0 - uTime)
  ) * uCurl * uReveal;
  vec2 uv = clamp(vUv + curl, 0.0, 1.0);
  vec3 a = texture2D(map, uv).rgb;
  vec3 b = texture2D(mapHover, uv).rgb;
  vec3 col = mix(a, b, uHover);
  col *= mix(0.72, 1.0, uReveal);
  gl_FragColor = vec4(col, uReveal);
}
`;

export const STICKER_URLS = Array.from(
  { length: 12 },
  (_, i) => `${assetUrl('/haoqi-static/sticker_img')}/s_${String(i + 1).padStart(2, '0')}.png`,
);

