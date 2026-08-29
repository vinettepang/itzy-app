import { assetUrl } from '@/utils/assetUrl';

export const STATIC = assetUrl('/webgl-refraction-static');

export const TEXTURES = {
  matcap: `${STATIC}/textures/matcap.png`,
  lensflare: `${STATIC}/textures/lens-flare.png`,
  opacityFill: `${STATIC}/textures/fill.png`,
  fillWhite: `${STATIC}/textures/small-fill-white.png`,
  fillBlack: `${STATIC}/textures/small-fill-black.png`,
  opacityStroke: `${STATIC}/textures/outline2.png`,
  lightning: `${STATIC}/textures/lightning.png`,
  lightningAlpha: `${STATIC}/textures/lightning-alpha.png`,
  lightningMob: `${STATIC}/textures/lightning-mobile.png`,
  lightningMobAlpha: `${STATIC}/textures/lightning-mobile-alpha.png`,
  sky: `${STATIC}/textures/sky.png`,
} as const;

export const MODELS = {
  bubbleText: `${STATIC}/models/unseen-dc.glb`,
  metalText: `${STATIC}/models/metal-dc.glb`,
} as const;

export const CUBEMAP_FACES = ['px', 'nx', 'py', 'ny', 'pz', 'nz'] as const;

export function cubemapUrls(folder: 'cubemap' | 'metalCubemap') {
  return CUBEMAP_FACES.map((f) => `${STATIC}/${folder}/${f}.png`);
}
