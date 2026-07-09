/** 生产 bundle 6687 证书场景参数 */
export const CERTIFICATE_CONFIG = {
  curl: { amount: -1, tightness: 1, origin: 0, originEdge: 0 },
  scroll: {
    positionYStart: -0.51,
    positionYStartMobile: -0.25,
    positionYEnd: 0.64,
    positionYEndMobile: 0.29,
  },
  animation: {
    scaleBase: 0.41,
    scaleTarget: 1,
    scaleTargetAt: 0.22,
    startRotation: -45,
    startRotationAt: 0.16,
    exitStart: 0.68,
    exitEnd: 1,
    exitScale: 0.58,
    exitRotation: 16,
  },
  light1: { intensity: 1.14, position: [12.92, 5, 10] as const },
  light2: { intensity: 0.8, position: [8.34, 5, 10] as const },
  materials: {
    matteRoughness: 0.25,
    reflectiveStrength: 0.37,
    bevelSize: 0.0006,
    bevelStrength: 1.6,
    foilSaturation: 0.11,
    foilOpacity: 0.44,
    foilContrast: 1.68,
  },
  camera: { fov: 20, position: [0, 0, 50] as const },
  textures: {
    map: '/virgil-static/images/certificate.png',
    foil: '/virgil-static/images/certificate_foil.png',
  },
} as const;
