export const vertexShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uScroll;
uniform float uVelocity;
uniform vec2 uMouse;
uniform float uProgress;

varying vec2 vUv;

float hash(float n) { return fract(sin(n) * 43758.5453123); }

void main() {
  vUv = uv;

  vec3 pos = position;

  // wave deformation driven by scroll velocity
  float v = clamp(abs(uVelocity) * 0.02, 0.0, 1.0);
  float p = clamp(uProgress, 0.0, 1.0);
  float wave = sin((uv.y * 6.0 + uTime * 0.9) + (uv.x * 3.0)) * 14.0 * v;
  pos.z += wave;

  // subtle shear towards mouse
  vec2 m = uMouse * 0.5;
  pos.x += (uv.y - 0.5) * m.x * 18.0 * v;
  pos.y += (uv.x - 0.5) * m.y * 14.0 * v;

  // stretch on fast scroll (camera smear feeling)
  pos.y *= 1.0 + v * 0.18;

  // “letter opens like a book”: width from 60% -> 100%, with slight curl/skew
  float open = smoothstep(0.06, 0.95, p);
  float w = mix(0.60, 1.00, open);
  pos.x *= w;
  // skew to hint a page turning, then relax flat
  pos.x += (uv.y - 0.5) * (1.0 - open) * 28.0;
  pos.z += (uv.x - 0.5) * (1.0 - open) * 22.0;

  // leaving viewport feels like camera pressure (more warp near edges)
  float edge = smoothstep(0.0, 0.25, p) * smoothstep(1.0, 0.75, p);
  pos.z += (1.0 - edge) * 18.0 * (0.15 + v);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uMask;
uniform float uTime;
uniform float uVelocity;
uniform vec2 uMouse;
uniform float uProgress;

varying vec2 vUv;

void main() {
  float v = clamp(abs(uVelocity) * 0.035, 0.0, 1.0);
  float p = clamp(uProgress, 0.0, 1.0);

  // organic displacement mask (wipe)
  // move mask a bit so it feels fluid instead of static
  // keep it mostly stable (paper feel), only micro drift
  vec2 muv = vUv * 1.10 + vec2(uTime * 0.004, -uTime * 0.003);
  float m = texture2D(uMask, muv).r;

  // mask threshold driven by progress; softness increases with velocity
  float softness = 0.10 + v * 0.16;

  // reveal from corner -> unfold: progress remap makes early stage “only a corner”
  float open = smoothstep(0.02, 0.92, p);
  float pp = pow(open, 1.35);
  float wipe = smoothstep(pp - softness, pp + softness, m);

  // displacement intensity: strong near transition, calm when fully revealed
  float disp = (1.0 - smoothstep(0.72, 1.0, p)) * (0.012 + v * 0.03);
  vec2 dispDir = normalize(vec2(0.7, -0.3) + uMouse * 0.2);
  vec2 duv = (m - 0.5) * dispDir * disp;
  vec2 uv = vUv + duv;

  // chromatic aberration / RGB split
  vec2 dir = normalize(vec2(0.6, -0.8) + uMouse * 0.35);
  vec2 off = dir * (0.008 + v * 0.02);

  float r = texture2D(uTexture, uv + off).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv - off).b;

  vec3 col = vec3(r, g, b);

  // film-ish contrast
  col = pow(col, vec3(0.95));
  col = mix(col, col * 1.12, 0.18);

  // vignette
  vec2 vign = uv - 0.5;
  float vig = smoothstep(0.85, 0.25, dot(vign, vign) * 1.35);
  col *= (0.75 + 0.25 * vig);

  // avoid normal fade: alpha is purely the organic wipe
  gl_FragColor = vec4(col, wipe);
}
`;

