/** 生产环境场景参数（来自 chunk 7758f29a8aeb1c60 + 02-hero-webgl.md） */
export const SCENE_CONFIG = {
  camera: {
    fov: 42,
    position: [0, 0.12, 10.6] as const,
    near: 0.1,
    far: 200,
  },
  hello: {
    position: [-0.1, 0, 2] as const,
    scaleDesktop: 22,
    scaleMobile: 19,
    rotationStartDeg: 240,
    rotationEndDeg: 90,
    rotationExtraDeg: 4,
    scrollSync: 0.72,
    tint: { color: '#b8daf4', mix: 0.42 },
  },
  cursor: {
    positionDesktop: [11.6, -4.2, -3] as const,
    positionMobile: [6.6, -5.6, -3] as const,
    scale: 0.1,
    rotationEndDeg: 720,
    tiltDeg: 45,
    tint: { color: '#009dff', mix: 0.55 },
  },
  cnt: {
    positionYStart: -8,
    positionYEnd: -0.5,
    scaleDesktop: 19,
    scaleMobile: 14,
    tint: { color: '#64c3ff', mix: 0.45 },
  },
  /** 贴纸粒子 — production s5 */
  sticker: {
    count: 12,
    scale: 1.4,
    fallSpeed: 1.8,
    windStrength: 1.8,
    windFrequency: 0.3,
    rotationSpeed: 0.8,
    zOffset: -6,
    zDepth: 4,
    spawnHeight: 8,
    spawnWidth: 14,
    /** 3D 场景内缩放系数 */
    scale3d: 0.42,
  },
  flare: {
    hotspot: [0.76, 0.32] as const,
  },
} as const;
