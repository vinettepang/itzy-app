import { CERTIFICATE_CONFIG as cfg } from './certificateConfig';

export type CertificateTargets = {
  progress: number;
  scale: number;
  positionY: number;
  tiltDeg: number;
  curlAmount: number;
};

function viewportHeight(): number {
  const mobile = window.innerWidth <= 700;
  if (mobile) {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--initial-vh');
    const parsed = parseFloat(raw);
    return parsed > 0 ? parsed : window.innerHeight;
  }
  return window.innerHeight;
}

function aspectMultiplier(): number {
  return 1.74 / (window.innerWidth / window.innerHeight);
}

/** 还原生产站 page.js 滚动驱动证书动画 */
export function computeCertificateTargets(
  scrollY: number,
  scrollOffsetVh = 0,
): CertificateTargets {
  const mobile = window.innerWidth <= 700;
  const vh = viewportHeight();
  const adjustedY = Math.max(0, scrollY - (scrollOffsetVh / 100) * vh);
  const anim = cfg.animation;
  const scroll = cfg.scroll;
  const aspect = aspectMultiplier();

  const progress = mobile
    ? Math.max(0, Math.min(1, adjustedY / (1.5 * vh)))
    : Math.max(0, Math.min(1, adjustedY / (3 * vh)));

  const yStart = mobile ? scroll.positionYStartMobile : scroll.positionYStart;
  const yEnd = mobile ? scroll.positionYEndMobile : scroll.positionYEnd;
  const positionY = (yStart + progress * (yEnd - yStart)) * aspect;

  let scale: number;
  if (progress <= anim.scaleTargetAt) {
    const u = anim.scaleTargetAt > 0 ? progress / anim.scaleTargetAt : 1;
    scale = anim.scaleBase + (anim.scaleTarget - anim.scaleBase) * u;
  } else if (progress < anim.exitStart) {
    scale = anim.scaleTarget;
  } else if (progress <= anim.exitEnd) {
    const u =
      anim.exitEnd > anim.exitStart
        ? (progress - anim.exitStart) / (anim.exitEnd - anim.exitStart)
        : 1;
    scale = anim.scaleTarget + (anim.exitScale - anim.scaleTarget) * u;
  } else {
    scale = anim.exitScale;
  }

  let tiltDeg: number;
  if (progress <= anim.startRotationAt) {
    const u = anim.startRotationAt > 0 ? progress / anim.startRotationAt : 1;
    tiltDeg = anim.startRotation * (1 - u);
  } else if (progress < anim.exitStart) {
    tiltDeg = 0;
  } else if (progress <= anim.exitEnd) {
    const u =
      anim.exitEnd > anim.exitStart
        ? (progress - anim.exitStart) / (anim.exitEnd - anim.exitStart)
        : 1;
    tiltDeg = anim.exitRotation * u;
  } else {
    tiltDeg = anim.exitRotation;
  }

  const curlAmount =
    cfg.curl.amount * Math.max(0, 1 - progress / (anim.scaleTargetAt || 0.33));

  return { progress, scale, positionY, tiltDeg, curlAmount };
}
