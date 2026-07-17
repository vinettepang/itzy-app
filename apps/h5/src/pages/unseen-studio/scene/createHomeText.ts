import * as THREE from 'three';

/**
 * PARTIAL · theme buildText (troika SDF → canvas texture).
 * SOURCE copy / color 0x353535 / sizes relative:
 *   eyebrow fontSize .0014 · lines .009 (troika world units inside objectsData.ho).
 * Full textFluidSim / troika deferred.
 */
export async function createHomeTextPlane() {
  try {
    await document.fonts.load('400 36px "Neue Montreal"');
    await document.fonts.load('italic 400 120px "Saol Display"');
    await document.fonts.ready;
  } catch {
    /* fallback system fonts */
  }

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#353535';

  // Eyebrow · SOURCE letterSpacing -.01
  ctx.font = '400 42px "Neue Montreal", "Helvetica Neue", sans-serif';
  ctx.letterSpacing = '-0.4px';
  ctx.fillText('A BRAND, DIGITAL & MOTION STUDIO', 1024, 280);

  // Line 1 · Saol italic · SOURCE letterSpacing -.04
  ctx.font = 'italic 400 168px "Saol Display", Georgia, serif';
  ctx.letterSpacing = '-6px';
  ctx.fillText('Creating the', 1024, 500);

  // Line 2 · Neue Montreal · SOURCE letterSpacing -.02
  ctx.font = '400 168px "Neue Montreal", "Helvetica Neue", sans-serif';
  ctx.letterSpacing = '-3px';
  ctx.fillText('unexpected', 1024, 700);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  texture.premultiplyAlpha = false;

  // Unit plane; createHomeScene scales via objectsData.ho × factor.
  const geo = new THREE.PlaneGeometry(1, 0.5);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    opacity: 0.97,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 2;
  mesh.name = 'homeText';

  return {
    mesh,
    dispose() {
      geo.dispose();
      mat.dispose();
      texture.dispose();
    },
  };
}
