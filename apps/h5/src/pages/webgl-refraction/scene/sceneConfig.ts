export const SCENE_CONFIG = {
  cameraZOffset: 25,
  mouseMoveAngle: { x: 0.18, y: 0.1 },
  sphereStartScale: 0.75,
  bubbleScale: { landscape: 1, portrait: 0.3 },
  preferredAspect: 1920 / 1080,
  preferredRatio: 1080 / 1920,
  holdDelayMs: 250,
} as const;

export type SceneIndex = 1 | 2;
export type Orientation = 'landscape' | 'portrait';
