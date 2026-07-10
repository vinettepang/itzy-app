import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import helvetikerBold from 'three/examples/fonts/helvetiker_bold.typeface.json';

const TEXT = 'itzy';
/** Match native width of production `unseen-dc.glb` (~168 units) */
const TARGET_WIDTH = 168;

let fontPromise: Promise<THREE.Font> | null = null;

function loadFont() {
  if (!fontPromise) {
    fontPromise = Promise.resolve(
      new FontLoader().parse(helvetikerBold as unknown as THREE.Font['data']),
    );
  }
  return fontPromise;
}

function fitMeshWidth(mesh: THREE.Mesh, targetWidth: number) {
  const box = new THREE.Box3().setFromObject(mesh);
  const width = box.max.x - box.min.x;
  if (width > 0) {
    mesh.scale.multiplyScalar(targetWidth / width);
  }
  const centered = new THREE.Box3().setFromObject(mesh);
  const center = new THREE.Vector3();
  centered.getCenter(center);
  mesh.position.sub(center);
  // Bake normalization into geometry so scene code can use production scales
  // without overwriting the width fit (setScalar would reset mesh.scale).
  mesh.geometry.scale(mesh.scale.x, mesh.scale.y, mesh.scale.z);
  mesh.scale.set(1, 1, 1);
  mesh.geometry.computeBoundingBox();
  mesh.geometry.computeVertexNormals();
}

export async function createTextGroup(): Promise<THREE.Group> {
  const font = await loadFont();
  const geometry = new TextGeometry(TEXT, {
    font,
    size: 2.8,
    depth: 0.62,
    curveSegments: 20,
    bevelEnabled: true,
    bevelThickness: 0.14,
    bevelSize: 0.08,
    bevelOffset: 0,
    bevelSegments: 8,
  });
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
  fitMeshWidth(mesh, TARGET_WIDTH);

  const group = new THREE.Group();
  group.add(mesh);
  return group;
}
