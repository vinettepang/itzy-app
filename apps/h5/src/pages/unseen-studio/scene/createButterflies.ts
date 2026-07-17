import * as THREE from 'three';

type CreateButterfliesOpts = {
  geometry: THREE.BufferGeometry;
  count?: number;
};

/**
 * PARTIAL · theme butterflies InstancedMesh (GPU positionSim deferred).
 * SOURCE: geometry.scale(16,16,16) · rotateY(-90°) · flock motion approximated in CPU.
 */
export function createButterflies({ geometry, count = 48 }: CreateButterfliesOpts) {
  const geo = geometry.clone();
  geo.scale(16, 16, 16);
  geo.rotateY(THREE.MathUtils.degToRad(-90));

  const material = new THREE.MeshBasicMaterial({
    color: 0x2a2a2a,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.92,
  });

  const mesh = new THREE.InstancedMesh(geo, material, count);
  mesh.frustumCulled = false;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  type Bird = {
    phase: number;
    speed: number;
    radius: number;
    height: number;
    flap: number;
    yaw: number;
  };
  const birds: Bird[] = [];
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    birds.push({
      phase: Math.random() * Math.PI * 2,
      speed: 0.35 + Math.random() * 0.55,
      radius: 60 + Math.random() * 220,
      height: 20 + Math.random() * 140,
      flap: 4 + Math.random() * 6,
      yaw: Math.random() * Math.PI * 2,
    });
    color.setHSL(0.08 + Math.random() * 0.08, 0.15, 0.12 + Math.random() * 0.2);
    mesh.setColorAt(i, color);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  return {
    mesh,
    update(timeSec: number) {
      for (let i = 0; i < count; i += 1) {
        const b = birds[i];
        const a = b.phase + timeSec * b.speed;
        const x = Math.cos(a) * b.radius;
        const z = Math.sin(a) * b.radius * 0.55 - 40;
        const y = b.height + Math.sin(a * 2.1) * 18;
        const flap = Math.sin(timeSec * b.flap + b.phase) * 0.55;
        dummy.position.set(x, y, z);
        dummy.rotation.set(flap * 0.35, -a + Math.PI / 2, flap);
        dummy.scale.setScalar(0.85 + Math.sin(a) * 0.08);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
    dispose() {
      geo.dispose();
      material.dispose();
      mesh.dispose();
    },
  };
}
