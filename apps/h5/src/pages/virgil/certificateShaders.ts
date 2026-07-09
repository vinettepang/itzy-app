/** 还原自生产 chunk 1203 / 158 */
export const CERT_VERT = /* glsl */ `
uniform float uCurlAmount;
uniform float uCurlTightness;
uniform float uCurlOrigin;
uniform float uCurlOriginEdge;
uniform float uAspect;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

vec3 applyCurl(vec2 p) {
  float width = uAspect;
  float height = 1.0;
  float PI = 3.14159265359;
  float apexX = (uCurlOriginEdge > 0.5) ? (width * 0.5) : (-width * 0.5);
  float apexY = mix(height * 0.5, -height * 0.5, uCurlOrigin);
  float t = uCurlOrigin;
  float amountAbs = abs(uCurlAmount);
  float thetaFlat = PI * 0.5;
  float thetaTight = 0.05 + 0.2 * (1.0 - uCurlTightness);
  float theta = mix(thetaFlat, thetaTight, amountAbs);
  float sinTheta = max(sin(theta), 0.001);

  float viX_t = apexX - p.x;
  float viY_t = apexY - p.y;
  float R_t = max(sqrt(viX_t * viX_t + viY_t * viY_t), 0.0001);
  float r_t = R_t * sin(theta);
  float beta_t = asin(clamp(viX_t / R_t, -1.0, 1.0)) / sinTheta;
  vec3 curledTop = vec3(
    apexX - r_t * sin(beta_t),
    apexY - (R_t - r_t * (1.0 - cos(beta_t)) * sin(theta)),
    (uCurlAmount >= 0.0) ? -r_t * (1.0 - cos(beta_t)) * cos(theta) : r_t * (1.0 - cos(beta_t)) * cos(theta)
  );

  float viX_b = p.x - apexX;
  float viY_b = p.y - apexY;
  float R_b = max(sqrt(viX_b * viX_b + viY_b * viY_b), 0.0001);
  float r_b = R_b * sin(theta);
  float beta_b = asin(clamp(viX_b / R_b, -1.0, 1.0)) / sinTheta;
  vec3 curledBot = vec3(
    apexX + r_b * sin(beta_b),
    apexY + (R_b - r_b * (1.0 - cos(beta_b)) * sin(theta)),
    (uCurlAmount >= 0.0) ? -r_b * (1.0 - cos(beta_b)) * cos(theta) : r_b * (1.0 - cos(beta_b)) * cos(theta)
  );

  vec3 curled = mix(curledTop, curledBot, t);
  float R = mix(R_t, R_b, t);
  float maxDist = sqrt(width * width + height * height);
  float distFactor = smoothstep(0.0, maxDist * 0.6, R);
  float amountAtVertex = amountAbs * (0.5 + 0.5 * distFactor);
  return mix(vec3(p, 0.0), curled, min(1.0, amountAtVertex));
}

void main() {
  vUv = uv;
  vec2 p = position.xy;
  vec3 pos = applyCurl(p);

  float eps = 0.001;
  float xMax = uAspect * 0.5;
  float yMax = 0.5;
  vec3 tangentX = (p.x + eps > xMax)
    ? (pos - applyCurl(p - vec2(eps, 0.0)))
    : (applyCurl(p + vec2(eps, 0.0)) - pos);
  vec3 tangentY = (p.y + eps > yMax)
    ? (pos - applyCurl(p - vec2(0.0, eps)))
    : (applyCurl(p + vec2(0.0, eps)) - pos);
  vec3 curlNormal = normalize(cross(tangentX, tangentY));
  if (dot(curlNormal, vec3(0.0, 0.0, 1.0)) < 0.0) curlNormal = -curlNormal;

  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vWorldPosition = worldPos.xyz;
  vWorldNormal = normalize((modelMatrix * vec4(curlNormal, 0.0)).xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const CERT_FRAG = /* glsl */ `
uniform sampler2D map;
uniform sampler2D uFoilMap;
uniform float matteRoughness;
uniform float reflectiveStrength;
uniform vec3 uCameraPosition;
uniform vec3 uLight1Position;
uniform float uLight1Intensity;
uniform vec3 uLight2Position;
uniform float uLight2Intensity;
uniform float uTime;
uniform float uScrollOffset;
uniform vec2 uMouse;
uniform float uBevelSize;
uniform float uBevelStrength;
uniform float uFoilSaturation;
uniform float uFoilOpacity;
uniform float uFoilContrast;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

vec3 hueToRgb(float h) {
  h = fract(h);
  float r = abs(h * 6.0 - 3.0) - 1.0;
  float g = 2.0 - abs(h * 6.0 - 2.0);
  float b = 2.0 - abs(h * 6.0 - 4.0);
  return clamp(vec3(r, g, b), 0.0, 1.0);
}

vec3 hardLight(vec3 base, vec3 blend) {
  vec3 dark = 2.0 * base * blend;
  vec3 bright = 1.0 - 2.0 * (1.0 - base) * (1.0 - blend);
  return mix(dark, bright, step(0.5, blend));
}

void main() {
  vec4 texColor = texture2D(map, vUv);
  if (texColor.a < 0.01) discard;

  vec3 N = normalize(vWorldNormal);
  vec3 V = normalize(uCameraPosition - vWorldPosition);
  vec3 L1 = normalize(uLight1Position - vWorldPosition);
  vec3 L2 = normalize(uLight2Position - vWorldPosition);

  float NdotL1 = max(dot(N, L1), 0.0);
  float NdotL2 = max(dot(N, L2), 0.0);
  float diffuse = NdotL1 * uLight1Intensity + NdotL2 * uLight2Intensity;
  diffuse = 0.5 + diffuse * 0.5;

  float matte = 1.0 - matteRoughness * 0.3;
  vec3 baseColor = texColor.rgb * matte * diffuse;

  float foilStrength = texture2D(uFoilMap, vUv).r;
  float NdotV = max(dot(N, V), 0.0);
  vec3 R = reflect(-V, N);
  float fresnel = pow(1.0 - NdotV, 2.5);

  float PI2 = 6.28318530718;
  float viewHue = fract(R.x * 2.2 + R.y * 1.6 + R.z * 0.5 + uTime * 0.04
    + uScrollOffset + uMouse.x * 0.8 + uMouse.y * 0.5);
  float g1 = sin((vUv.x * 7.0 + vUv.y * 3.0) * PI2);
  float g2 = sin((vUv.x * 2.0 - vUv.y * 6.0) * PI2);
  float g3 = sin((vUv.x * 10.0 + vUv.y * 7.0) * PI2);
  float hue = fract(viewHue + g1 * 0.18 + g2 * 0.12 + g3 * 0.05 + fresnel * 0.08);
  float isWhite = smoothstep(0.7, 0.97, foilStrength);
  float effectiveHue = fract(hue + mix(0.5, 0.0, isWhite));
  vec3 rainbow = hueToRgb(effectiveHue);
  float luma = dot(rainbow, vec3(0.299, 0.587, 0.114));
  rainbow = clamp(mix(vec3(luma), rainbow, uFoilSaturation), 0.0, 1.0);

  vec2 foilGrad = vec2(
    texture2D(uFoilMap, vUv + vec2(uBevelSize, 0.0)).r - texture2D(uFoilMap, vUv + vec2(-uBevelSize, 0.0)).r,
    texture2D(uFoilMap, vUv + vec2(0.0, uBevelSize)).r - texture2D(uFoilMap, vUv + vec2(0.0, -uBevelSize)).r
  );
  vec3 bumpN = normalize(N + vec3(foilGrad.x, foilGrad.y, 0.0) * uBevelStrength);
  float bumpD = max(dot(bumpN, L1), 0.0) * uLight1Intensity + max(dot(bumpN, L2), 0.0) * uLight2Intensity;
  float bumpDiffuse = 0.5 + bumpD * 0.5;
  float bevelMagnitude = length(foilGrad);
  float bevel = (bumpDiffuse - diffuse) * bevelMagnitude * uBevelStrength * 1.2;
  vec3 baseColorBeveled = baseColor + baseColor * bevel;

  float metalDiff = mix(0.15, 1.0, pow(diffuse, 1.8));
  float tintStr = (0.38 + fresnel * 0.52) * metalDiff * uFoilContrast;
  vec3 foilTint = mix(vec3(0.5), rainbow, tintStr);
  vec3 foilColor = hardLight(baseColorBeveled, foilTint);

  vec3 H1 = normalize(L1 + V);
  vec3 H2 = normalize(L2 + V);
  float sGlint = pow(max(dot(N, H1), 0.0), 256.0) * uLight1Intensity * 3.5
    + pow(max(dot(N, H2), 0.0), 256.0) * uLight2Intensity * 3.0;
  float sSheen = pow(max(dot(N, H1), 0.0), 20.0) * uLight1Intensity * 0.28
    + pow(max(dot(N, H2), 0.0), 20.0) * uLight2Intensity * 0.22;
  vec3 specColor = mix(rainbow, vec3(1.0), 0.6);
  foilColor += specColor * sGlint + rainbow * sSheen * 0.45;

  vec3 finalBase = mix(baseColor, baseColorBeveled, foilStrength);
  vec3 composited = mix(finalBase, foilColor, foilStrength * uFoilOpacity);

  float compLuma = dot(composited, vec3(0.299, 0.587, 0.114));
  float inShadow = 1.0 - smoothstep(0.0, 0.4, compLuma);
  composited = clamp(compLuma + (composited - compLuma) * (1.0 + inShadow * 0.22), 0.0, 1.0);

  const float GRAIN_FREQ = 3000.0;
  vec2 grainCell = floor(vUv * GRAIN_FREQ);
  vec2 grainFrac = fract(vUv * GRAIN_FREQ);
  vec2 g = grainFrac * grainFrac * (3.0 - 2.0 * grainFrac);
  float h00 = fract(sin(dot(grainCell, vec2(127.1, 311.7))) * 43758.5453);
  float h10 = fract(sin(dot(grainCell + vec2(1.0, 0.0), vec2(269.5, 183.3))) * 43758.5453);
  float h01 = fract(sin(dot(grainCell + vec2(0.0, 1.0), vec2(419.2, 371.9))) * 43758.5453);
  float h11 = fract(sin(dot(grainCell + vec2(1.0, 1.0), vec2(83.7, 97.1))) * 43758.5453);
  float grain = mix(mix(h00, h10, g.x), mix(h01, h11, g.x), g.y);
  float grainAdd = (grain - 0.5) * 0.14;
  float inDark = 1.0 - smoothstep(0.0, 0.1, compLuma);
  grainAdd = mix(grainAdd, max(0.0, grainAdd), inDark);
  composited += grainAdd;

  gl_FragColor = vec4(composited, texColor.a);
}
`;
