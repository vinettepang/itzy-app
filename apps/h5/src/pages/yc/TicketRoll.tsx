import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type TicketRollPhase =
  | 'attached'
  | 'tension'
  | 'perforation'
  | 'chopping'
  | 'tearing'
  | 'holding'
  | 'settling'
  | 'detached';

export type TicketRollProps = {
  progressRef: React.MutableRefObject<number>;
  phase: string;
  reduced: boolean;
  name: string;
};

function splitName(name: string): string[] {
  const parts = name.toUpperCase().split(' ').filter(Boolean);
  if (parts.length <= 1) return [parts[0] || 'ANTHONY'];
  if (parts.length === 2) return parts;
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(' '), parts.slice(mid).join(' ') ];
}

function createTicketTexture(name: string, withCornerCuts = true): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1040;
  canvas.height = 560;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');

  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0, '#ffc487');
  bg.addColorStop(0.48, '#ff6b18');
  bg.addColorStop(1, '#ffb36f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(760, 170, 20, 760, 170, 440);
  glow.addColorStop(0, 'rgba(255,238,205,.92)');
  glow.addColorStop(0.46, 'rgba(255,154,74,.3)');
  glow.addColorStop(1, 'rgba(255,93,14,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#4a301d';
  ctx.font = '400 22px "Martian Mono", monospace';
  ctx.fillText('Y COMBINATOR PRESENTS', 72, 86);
  ctx.fillText('STARTUP SCHOOL 2026', 72, 121);

  const nameLines = splitName(name);
  ctx.font = '500 68px "Martian Mono", monospace';
  nameLines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, 72, nameLines.length > 1 ? 278 + 82 * i : 320);
  });

  ctx.font = '400 22px "Martian Mono", monospace';
  ctx.fillText('CHASE CENTER, SF · JULY 25–26', 72, 495);

  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.font = '500 74px "Martian Mono", monospace';
  ctx.translate(914, 52);
  ctx.rotate(Math.PI / 2);
  ctx.fillText('ADMIT ONE', 0, 0);
  ctx.restore();

  ctx.setLineDash([8, 10]);
  ctx.strokeStyle = 'rgba(74,48,29,.28)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(790, 28);
  ctx.lineTo(790, 532);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(18, 20);
  ctx.lineTo(18, 540);
  ctx.stroke();
  ctx.setLineDash([]);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 32;
    imageData.data[i] += noise;
    imageData.data[i + 1] += noise;
    imageData.data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);

  if (withCornerCuts) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    for (const [x, y, r] of [
      [0, 0, 32],
      [1040, 0, 32],
      [0, 560, 32],
      [1040, 560, 32],
      [790, 0, 28],
      [790, 560, 28],
    ] as const) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createRollTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');

  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0, '#ffd09a');
  bg.addColorStop(0.42, '#ff8734');
  bg.addColorStop(1, '#f45b16');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(73,42,25,.48)';
  ctx.font = '500 22px "Martian Mono", monospace';
  ctx.textBaseline = 'top';

  for (let i = 0; i < 2; i += 1) {
    const x = 512 * i + 44;
    ctx.fillText('Y COMBINATOR', x, 42);
    ctx.font = '500 15px "Martian Mono", monospace';
    ctx.fillText('STARTUP SCHOOL 2026', x, 80);
    ctx.fillText('ADMIT ONE  ·  07.25', x, 400);
    ctx.setLineDash([5, 7]);
    ctx.strokeStyle = 'rgba(73,42,25,.25)';
    ctx.beginPath();
    ctx.moveTo(x - 30, 0);
    ctx.lineTo(x - 30, 512);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '500 22px "Martian Mono", monospace';
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 34;
    imageData.data[i] += noise;
    imageData.data[i + 1] += noise;
    imageData.data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function createCardboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');

  ctx.fillStyle = '#ee9a61';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const center = canvas.width / 2;
  ctx.beginPath();
  for (let i = 0; i <= 6200; i += 1) {
    const t = i / 6200;
    const angle = 62 * t * Math.PI * 2;
    const radius = 168 + 342 * t + 0.7 * Math.sin(0.73 * angle);
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(100,49,27,.24)';
  ctx.lineWidth = 1.25;
  ctx.stroke();

  for (let r = 176; r < 507; r += 18) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,214,169,.08)';
    ctx.lineWidth = 1;
    ctx.arc(center, center, r, 0, 2 * Math.PI);
    ctx.stroke();
  }

  for (let i = 0; i < 1200; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 168 + 342 * Math.random();
    ctx.fillStyle = `rgba(78,38,20,${0.12 * Math.random()})`;
    ctx.fillRect(
      center + Math.cos(angle) * radius,
      center + Math.sin(angle) * radius,
      1 + 2 * Math.random(),
      1,
    );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createExtendedTicketTexture(source: THREE.CanvasTexture): THREE.CanvasTexture {
  const image = source.image as HTMLCanvasElement;
  const canvas = document.createElement('canvas');
  canvas.width = 4 * image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');

  for (let i = 0; i < 4; i += 1) {
    ctx.drawImage(image, i * image.width, 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function buildRibbonGeometry(rows: number): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array((rows + 1) * 9 * 3);
  const uvs = new Float32Array((rows + 1) * 9 * 2);
  const indices: number[] = [];

  for (let row = 0; row <= rows; row += 1) {
    const u = row / rows;
    for (let col = 0; col <= 8; col += 1) {
      const v = col / 8;
      const idx = 9 * row + col;
      uvs[2 * idx] = u;
      uvs[2 * idx + 1] = v;
      if (row < rows && col < 8) {
        const next = idx + 8 + 1;
        indices.push(idx, next, idx + 1, idx + 1, next, next + 1);
      }
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

export function TicketRoll({ progressRef, phase, reduced, name }: TicketRollProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId = 0;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 40);
    camera.position.set(5.4, 6.1, 9.4);
    camera.lookAt(-0.45, 0.82, 0.45);

    scene.add(new THREE.HemisphereLight(16767416, 2364428, 2.2));

    const dirLight = new THREE.DirectionalLight(16769994, 4.8);
    dirLight.position.set(-3, 9, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.left = -8;
    dirLight.shadow.camera.right = 8;
    dirLight.shadow.camera.top = 8;
    dirLight.shadow.camera.bottom = -8;
    dirLight.shadow.bias = -0.00025;
    dirLight.shadow.normalBias = 0.035;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(16738816, 8.5, 12);
    pointLight.position.set(4, 2, 4);
    scene.add(pointLight);

    const shadowMat = new THREE.ShadowMaterial({ color: 0, opacity: 0.26, transparent: true });
    const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(30, 24), shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.015;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const ticketTexture = createTicketTexture(name);
    const rollTexture = createRollTexture();
    rollTexture.wrapS = THREE.RepeatWrapping;
    rollTexture.wrapT = THREE.ClampToEdgeWrapping;
    rollTexture.repeat.set(1, 1);

    const cardboardTexture = createCardboardTexture();

    const rollGroup = new THREE.Group();
    rollGroup.position.set(-2.8, 1.08, 0);
    scene.add(rollGroup);

    const rollMat = new THREE.MeshStandardMaterial({
      map: rollTexture,
      color: 0xffffff,
      roughness: 0.97,
      metalness: 0,
      side: THREE.DoubleSide,
    });

    const cylinderGeo = new THREE.CylinderGeometry(1.34, 1.34, 2.16, 128, 18, true);
    const cylinderPos = cylinderGeo.attributes.position;
    for (let i = 0; i < cylinderPos.count; i += 1) {
      const x = cylinderPos.getX(i);
      const y = cylinderPos.getY(i);
      const z = cylinderPos.getZ(i);
      const r = Math.hypot(x, z);
      const angle = Math.atan2(z, x);
      const v = (y + 1.08) / 2.16;
      const scale =
        (r + (0.009 * Math.sin(7 * angle + 2.2 * v) + 0.0045 * Math.sin(19 * angle - 5.4 * v))) / r;
      cylinderPos.setXYZ(i, x * scale, y, z * scale);
    }
    cylinderPos.needsUpdate = true;
    cylinderGeo.computeVertexNormals();

    const rollMesh = new THREE.Mesh(cylinderGeo, rollMat);
    rollMesh.castShadow = true;
    rollGroup.add(rollMesh);

    const ringInnerMat = new THREE.MeshStandardMaterial({ color: 16228454, roughness: 0.9, side: THREE.DoubleSide });
    const ringOuterMat = new THREE.MeshStandardMaterial({
      map: cardboardTexture,
      color: 0xffffff,
      roughness: 1,
      side: THREE.DoubleSide,
    });
    const hubMat = new THREE.MeshStandardMaterial({ color: 3744536, roughness: 0.95, side: THREE.DoubleSide });

    for (const side of [-1, 1] as const) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.46, 1.42, 96), side > 0 ? ringOuterMat : ringInnerMat);
      ring.position.y = 1.085 * side;
      ring.rotation.x = side * (Math.PI / 2);
      rollGroup.add(ring);

      const hub = new THREE.Mesh(new THREE.CircleGeometry(0.46, 64), hubMat);
      hub.position.y = side > 0 ? 0.61 : -1.09;
      hub.rotation.x = side * (Math.PI / 2);
      rollGroup.add(hub);
    }

    const coreMat = new THREE.MeshStandardMaterial({ color: 5913129, roughness: 1, side: THREE.DoubleSide });
    const coreGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.48, 64, 1, true);
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 0.85;
    rollGroup.add(coreMesh);

    const grooveMats: THREE.MeshBasicMaterial[] = [];
    for (let i = 0; i < 22; i += 1) {
      const mat = new THREE.MeshBasicMaterial({
        color: 8077863,
        transparent: true,
        opacity: 0.12 + (i % 4 === 0 ? 0.05 : 0),
      });
      grooveMats.push(mat);
      const groove = new THREE.Mesh(new THREE.TorusGeometry(0.49 + 0.042 * i, 0.0035, 5, 128), mat);
      groove.position.y = 1.098 + 0.0015 * Math.sin(1.7 * i);
      groove.rotation.x = Math.PI / 2;
      rollGroup.add(groove);
    }

    const tapeMat = new THREE.MeshBasicMaterial({ color: 7289892, transparent: true, opacity: 0.25 });
    const tapeMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.012), tapeMat);
    tapeMesh.position.set(0.88, 1.102, 0);
    tapeMesh.rotation.x = -Math.PI / 2;
    rollGroup.add(tapeMesh);

    const lipMat = new THREE.MeshStandardMaterial({ color: 6965815, roughness: 0.98 });
    const lipMesh = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.035, 10, 96), lipMat);
    lipMesh.position.y = 1.107;
    lipMesh.rotation.x = Math.PI / 2;
    rollGroup.add(lipMesh);

    const ticketWidth = (18 / 1040) * 5.2;

    const stubGeometry = buildRibbonGeometry(72);
    const stubMat = new THREE.MeshStandardMaterial({
      map: ticketTexture,
      transparent: true,
      alphaTest: 0.025,
      roughness: 0.72,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const stubMesh = new THREE.Mesh(stubGeometry, stubMat);
    stubMesh.castShadow = true;
    stubMesh.receiveShadow = false;

    const detachedGroup = new THREE.Group();
    detachedGroup.position.set(-2.8, 1.08, 0);
    detachedGroup.add(stubMesh);
    detachedGroup.visible = false;
    scene.add(detachedGroup);

    const extendedTexture = createExtendedTicketTexture(ticketTexture);
    const ribbonGeometry = buildRibbonGeometry(288);
    const ribbonMat = new THREE.MeshStandardMaterial({
      map: extendedTexture,
      transparent: false,
      alphaTest: 0.025,
      roughness: 0.72,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeometry, ribbonMat);
    ribbonMesh.castShadow = true;
    ribbonMesh.receiveShadow = false;

    const ribbonGroup = new THREE.Group();
    ribbonGroup.position.set(-2.8, 1.08, 0);
    ribbonGroup.add(ribbonMesh);
    scene.add(ribbonGroup);

    const fxGroup = new THREE.Group();
    const perfMats: THREE.MeshBasicMaterial[] = [];
    const perfGeos: THREE.PlaneGeometry[] = [];

    for (let i = 0; i < 11; i += 1) {
      const geo = new THREE.PlaneGeometry(0.035, 0.105);
      const mat = new THREE.MeshBasicMaterial({
        color: 5648671,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0.025, -0.9072 + 0.18144 * i, 1.455);
      fxGroup.add(mesh);
      perfMats.push(mat);
      perfGeos.push(geo);
    }

    const slashMatA = new THREE.MeshBasicMaterial({
      color: 15661311,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const slashMatB = new THREE.MeshBasicMaterial({
      color: 16774111,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const slashGeoA = new THREE.PlaneGeometry(0.12, 1.02);
    const slashGeoB = new THREE.PlaneGeometry(0.02, 1.08);
    const slashMeshA = new THREE.Mesh(slashGeoA, slashMatA);
    const slashMeshB = new THREE.Mesh(slashGeoB, slashMatB);
    slashMeshB.position.z = 0.006;

    const slashGroup = new THREE.Group();
    slashGroup.add(slashMeshA, slashMeshB);
    slashGroup.position.set(0.025, 1.404, 1.48);
    slashGroup.rotation.z = -0.14;
    fxGroup.add(slashGroup);

    const chipGeo = new THREE.PlaneGeometry(0.07, 0.025);
    const chipMat = new THREE.MeshBasicMaterial({
      color: 16761229,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const chipSpecs = [
      { x: -0.02, y: 0.16, vx: -0.42, vy: 0.38, spin: -4.2 },
      { x: 0.02, y: 0.05, vx: 0.48, vy: 0.28, spin: 3.4 },
      { x: -0.01, y: -0.08, vx: -0.36, vy: -0.18, spin: 5.1 },
      { x: 0.03, y: -0.2, vx: 0.4, vy: -0.3, spin: -3.8 },
      { x: 0, y: 0.28, vx: 0.22, vy: 0.48, spin: 4.6 },
      { x: -0.02, y: -0.3, vx: -0.2, vy: -0.4, spin: -5.4 },
    ] as const;

    const chipMeshes = chipSpecs.map(() => {
      const mesh = new THREE.Mesh(chipGeo, chipMat);
      mesh.position.z = 1.49;
      fxGroup.add(mesh);
      return mesh;
    });

    const shardGeo = new THREE.TetrahedronGeometry(0.052, 0);
    const shardMats = [16775404, 16765608].map(
      (color) =>
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0,
          depthTest: false,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
    );

    const shardSpecs = [
      { x: -0.02, y: 0.72, vx: -0.42, vy: 0.5, vz: 0.22, rx: 4.8, ry: -3.2, rz: 5.5, scale: 0.72 },
      { x: 0.01, y: 0.58, vx: 0.5, vy: 0.36, vz: 0.3, rx: -5.2, ry: 4.4, rz: -3.8, scale: 1 },
      { x: -0.01, y: 0.42, vx: -0.65, vy: 0.2, vz: 0.18, rx: 3.6, ry: 5.1, rz: 4.2, scale: 0.82 },
      { x: 0.02, y: 0.27, vx: 0.72, vy: 0.28, vz: 0.24, rx: -4.3, ry: -3.8, rz: 5.8, scale: 0.68 },
      { x: 0, y: 0.12, vx: -0.52, vy: 0.1, vz: 0.34, rx: 5.7, ry: 3.1, rz: -4.6, scale: 1.08 },
      { x: -0.01, y: -0.02, vx: 0.58, vy: 0.18, vz: 0.26, rx: -3.9, ry: 5.6, rz: 4.9, scale: 0.76 },
      { x: 0.02, y: -0.17, vx: -0.76, vy: -0.06, vz: 0.2, rx: 4.5, ry: -5.2, rz: -3.4, scale: 0.88 },
      { x: 0, y: -0.3, vx: 0.68, vy: -0.12, vz: 0.36, rx: -5.5, ry: 3.7, rz: 5.2, scale: 0.64 },
      { x: -0.02, y: -0.44, vx: -0.46, vy: -0.28, vz: 0.28, rx: 3.4, ry: 4.8, rz: -5.7, scale: 0.94 },
      { x: 0.01, y: -0.59, vx: 0.54, vy: -0.38, vz: 0.22, rx: -4.7, ry: -3.5, rz: 4.1, scale: 0.74 },
      { x: 0, y: -0.72, vx: -0.34, vy: -0.5, vz: 0.3, rx: 5.1, ry: 4.2, rz: -4.8, scale: 0.62 },
      { x: 0.01, y: 0.36, vx: 0.34, vy: 0.66, vz: 0.42, rx: -3.2, ry: 5.8, rz: 3.9, scale: 0.58 },
      { x: -0.01, y: -0.36, vx: -0.28, vy: -0.62, vz: 0.38, rx: 4.2, ry: -4.9, rz: 5.4, scale: 0.7 },
      { x: 0.02, y: 0, vx: 0.82, vy: 0.02, vz: 0.16, rx: -5.8, ry: 3.3, rz: -4.3, scale: 0.56 },
    ] as const;

    const shardMeshes = shardSpecs.map((spec, i) => {
      const mesh = new THREE.Mesh(shardGeo, shardMats[i % shardMats.length]);
      mesh.position.set(spec.x, spec.y, 1.5);
      mesh.scale.setScalar(0);
      fxGroup.add(mesh);
      return mesh;
    });

    const burstGeo = new THREE.CircleGeometry(0.18, 6);
    const burstMat = new THREE.MeshBasicMaterial({
      color: 16775401,
      transparent: true,
      opacity: 0,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const burstMesh = new THREE.Mesh(burstGeo, burstMat);
    burstMesh.position.set(0, 0, 1.493);
    burstMesh.scale.setScalar(0);
    fxGroup.add(burstMesh);

    const detachShardMats = [16775662, 16763291].map(
      (color) =>
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0,
          depthTest: false,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
    );

    const detachShardSpecs = [
      { x: -2.2, y: 0.86, vx: -0.38, vy: 0.28, vz: 0.25, rx: 4.8, ry: -3.5, rz: 5.1, scale: 0.72 },
      { x: -0.95, y: 1.02, vx: -0.18, vy: 0.42, vz: 0.32, rx: -4.2, ry: 5.2, rz: -3.8, scale: 0.58 },
      { x: 0.72, y: 1.02, vx: 0.15, vy: 0.45, vz: 0.28, rx: 5.4, ry: 3.8, rz: 4.6, scale: 0.66 },
      { x: 2.18, y: 0.78, vx: 0.42, vy: 0.3, vz: 0.36, rx: -5.1, ry: -4.3, rz: 3.9, scale: 0.82 },
      { x: 2.42, y: 0.14, vx: 0.5, vy: 0.04, vz: 0.22, rx: 3.7, ry: 5.6, rz: -4.8, scale: 0.56 },
      { x: 2.2, y: -0.8, vx: 0.4, vy: -0.32, vz: 0.3, rx: -4.9, ry: 3.4, rz: 5.5, scale: 0.74 },
      { x: 0.9, y: -1.02, vx: 0.18, vy: -0.46, vz: 0.34, rx: 5.2, ry: -5.1, rz: -3.6, scale: 0.62 },
      { x: -0.72, y: -1.02, vx: -0.15, vy: -0.43, vz: 0.24, rx: -3.8, ry: 4.7, rz: 5.2, scale: 0.68 },
      { x: -2.18, y: -0.8, vx: -0.42, vy: -0.3, vz: 0.38, rx: 4.5, ry: 3.9, rz: -5.4, scale: 0.78 },
      { x: -2.42, y: -0.08, vx: -0.52, vy: -0.02, vz: 0.27, rx: -5.6, ry: -3.7, rz: 4.1, scale: 0.54 },
    ] as const;

    const detachShardMeshes = detachShardSpecs.map((spec, i) => {
      const mesh = new THREE.Mesh(shardGeo, detachShardMats[i % detachShardMats.length]);
      mesh.position.set(spec.x, spec.y, 0.07);
      mesh.scale.setScalar(0);
      detachedGroup.add(mesh);
      return mesh;
    });

    ribbonGroup.add(fxGroup);

    const tailTexture = extendedTexture.clone();
    tailTexture.needsUpdate = true;
    tailTexture.repeat.set(0.75, 1);
    tailTexture.offset.set(0, 0);

    const tailMat = new THREE.MeshStandardMaterial({
      map: tailTexture,
      transparent: false,
      opacity: 1,
      alphaTest: 0.025,
      roughness: 0.76,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    const tailGeometry = ribbonGeometry.clone();
    const tailMesh = new THREE.Mesh(tailGeometry, tailMat);
    tailMesh.castShadow = true;
    tailMesh.receiveShadow = false;

    const tailGroup = new THREE.Group();
    tailGroup.position.set(-2.8, 1.08, 0);
    tailGroup.add(tailMesh);
    tailGroup.visible = false;
    scene.add(tailGroup);

    const identityQuat = new THREE.Quaternion();
    const lookTarget = new THREE.Object3D();
    lookTarget.position.set(0, 1.05, 1.15);
    lookTarget.lookAt(camera.position);
    const lookQuat = lookTarget.quaternion.clone();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    const parent = canvas.parentElement;
    const resizeObserver = parent ? new ResizeObserver(resize) : null;
    if (parent && resizeObserver) {
      resizeObserver.observe(parent);
    }
    resize();

    let tearStart = 0;
    let chopStart = 0;
    let perfStart = 0;
    let prevPhase = phaseRef.current;

    const animate = (time: number) => {
      const progress = reduced ? 0.68 : progressRef.current;
      const pullEase = THREE.MathUtils.smoothstep(progress, 0.74, 1);
      const currentPhase = phaseRef.current;
      const isDetached = currentPhase === 'detached';
      const isPerf = currentPhase === 'perforation';
      const isChop = currentPhase === 'chopping';
      const isTear = currentPhase === 'tearing';
      const isHold = currentPhase === 'holding';
      const isFly = isTear || isHold || currentPhase === 'settling';
      const showPerfFx = currentPhase === 'attached' && progress > 0.74;

      if (currentPhase === 'attached' && prevPhase !== 'attached') {
        chopStart = 0;
      }
      if (isPerf && prevPhase !== 'perforation') {
        perfStart = time;
      }
      if (isChop && prevPhase !== 'chopping') {
        chopStart = time;
      }
      if (isTear && prevPhase !== 'tearing') {
        tearStart = time;
      }
      prevPhase = currentPhase;

      const perfT = isPerf ? Math.min(1, (time - perfStart) / 480) : 0;
      const chopElapsed = chopStart > 0 ? time - chopStart : Number.POSITIVE_INFINITY;
      const chopActive = chopElapsed >= 0 && chopElapsed < 220 && (isChop || isTear);
      const chopT = chopActive ? Math.min(1, chopElapsed / 220) : 0;
      const holdElapsed = chopElapsed - 62;
      const holdActive = holdElapsed >= 0 && holdElapsed < 310 && (isChop || isTear || isHold);
      const holdT = holdActive ? Math.min(1, holdElapsed / 310) : 0;
      const flyElapsed = isFly ? Math.max(0, time - tearStart) : isDetached ? 990 : 0;
      const flyP = Math.max(0, Math.min(1, (flyElapsed - 130 - 240) / 620));
      const flyK = THREE.MathUtils.smootherstep(flyP, 0, 0.48);
      const flyE = THREE.MathUtils.smootherstep(flyP, 0, 1);
      const unroll = isFly || isDetached ? 6.76 : 0.9 + 5.86 * progress;

      const ribbonPos = ribbonGeometry.attributes.position.array as Float32Array;
      for (let row = 0; row <= 288; row += 1) {
        const t = (row / 288) * 20.8 - (20.8 - unroll);
        const radius =
          1.435 - Math.min(0.065, Math.max(0, -t) / (2 * Math.PI)) * 0.018;
        const inner = t < 0 ? t / 1.435 : 0;
        const outer = t > 0 ? t / Math.max(unroll, 0.001) : 0;
        const x = t >= 0 ? t + pullEase * Math.pow(outer, 2) * 0.11 : radius * Math.sin(inner);
        const z = t >= 0 ? 1.435 : radius * Math.cos(inner);
        const sag = 0.17 * Math.pow(outer, 1.65) * (1 - 0.72 * pullEase);

        for (let col = 0; col <= 8; col += 1) {
          const v = col / 8;
          const idx = 3 * (9 * row + col);
          const width = (v - 0.5) * 2.16;
          ribbonPos[idx] = x;
          ribbonPos[idx + 1] = Math.max(-1.062, width - sag);
          ribbonPos[idx + 2] = z;
        }
      }
      ribbonGeometry.attributes.position.needsUpdate = true;
      ribbonGeometry.computeVertexNormals();

      const stubPos = stubGeometry.attributes.position.array as Float32Array;
      for (let row = 0; row <= 72; row += 1) {
        const t = row / 72;
        const x = 5.2 * t;
        const wave = Math.sin(Math.PI * t) * Math.sin(Math.PI * flyP) * 0.008;
        for (let col = 0; col <= 8; col += 1) {
          const v = col / 8;
          const idx = 3 * (9 * row + col);
          const width = (v - 0.5) * 2.16;
          stubPos[idx] = x - 2.6;
          stubPos[idx + 1] = width;
          stubPos[idx + 2] = wave;
        }
      }
      stubGeometry.attributes.position.needsUpdate = true;
      stubGeometry.computeVertexNormals();

      const tailPos = tailGeometry.attributes.position.array as Float32Array;
      for (let row = 0; row <= 288; row += 1) {
        const t = (row / 288) * 15.6 - 14.04;
        const radius = 1.435 - Math.min(0.05, Math.max(0, -t) / (2 * Math.PI)) * 0.018;
        const inner = t < 0 ? t / 1.435 : 0;
        const outer = t > 0 ? t / 1.56 : 0;
        const x = t >= 0 ? t : radius * Math.sin(inner);
        const z = t >= 0 ? 1.435 : radius * Math.cos(inner);
        const sag = 0.05 * Math.pow(outer, 1.65);

        for (let col = 0; col <= 8; col += 1) {
          const v = col / 8;
          const idx = 3 * (9 * row + col);
          const width = (v - 0.5) * 2.16;
          tailPos[idx] = x;
          tailPos[idx + 1] = Math.max(-1.062, width - sag);
          tailPos[idx + 2] = z;
        }
      }
      tailGeometry.attributes.position.needsUpdate = true;
      tailGeometry.computeVertexNormals();

      rollMesh.rotation.z = 0;
      rollGroup.visible = !isDetached;
      rollGroup.position.x = -2.8 - 10 * flyE;
      rollGroup.position.y = 1.08;
      rollGroup.position.z = 0 - 0.22 * flyE;
      rollGroup.rotation.x = 0;
      rollGroup.rotation.z = 0;
      rollGroup.rotation.y = -(unroll - 0.9) / 1.435;

      const fxParent = isFly || isDetached ? detachedGroup : ribbonGroup;
      if (fxGroup.parent !== fxParent) {
        fxParent.add(fxGroup);
      }
      fxGroup.visible = showPerfFx || isPerf || chopActive || holdActive;
      fxGroup.position.x = isFly || isDetached ? -2.6 + ticketWidth : 1.56 + ticketWidth;
      fxGroup.position.z = isFly || isDetached ? -1.435 : 0;

      const slashFade = THREE.MathUtils.smoothstep(chopT, 0, 0.9);
      const slashPulse = chopT < 0.12 ? chopT / 0.12 : 1 - THREE.MathUtils.smoothstep(chopT, 0.62, 1);

      perfMats.forEach((mat) => {
        if (showPerfFx) {
          mat.opacity = 0.16 + 0.36 * pullEase;
        } else if (isPerf) {
          mat.opacity = 0.52 * THREE.MathUtils.smoothstep(perfT, 0, 0.38);
        } else if (chopActive) {
          mat.opacity = 0.52 * (1 - THREE.MathUtils.smoothstep(chopT, 0.58, 1));
        } else {
          mat.opacity = 0;
        }
      });

      slashMatA.opacity = chopActive ? 0.52 * slashPulse : 0;
      slashMatB.opacity = chopActive ? slashPulse : 0;
      slashGroup.position.x = 0.025;
      slashGroup.position.y = THREE.MathUtils.lerp(1.404, -1.404, slashFade);
      slashGroup.scale.set(1, 0.86 + 0.18 * slashPulse, 1);

      const chipT = Math.max(0, Math.min(1, (chopT - 0.34) / 0.66));
      chipMat.opacity = chopActive ? 0.9 * Math.sin(Math.PI * chipT) : 0;
      chipMeshes.forEach((mesh, i) => {
        const spec = chipSpecs[i];
        mesh.position.x = spec.x + spec.vx * chipT;
        mesh.position.y = spec.y + spec.vy * chipT - 0.18 * chipT * chipT;
        mesh.position.z = 1.49 + 0.08 * Math.sin(chipT * Math.PI);
        mesh.rotation.z = spec.spin * chipT;
      });

      const shardScale = Math.min(1, 7 * holdT);
      const shardMove = 1 - Math.pow(1 - holdT, 2);
      const shardOpacity = holdActive ? shardScale * Math.pow(1 - holdT, 1.55) : 0;
      shardMats[0].opacity = shardOpacity;
      shardMats[1].opacity = 0.82 * shardOpacity;
      shardMeshes.forEach((mesh, i) => {
        const spec = shardSpecs[i];
        mesh.position.x = spec.x + spec.vx * shardMove;
        mesh.position.y = spec.y + spec.vy * shardMove - 0.34 * holdT * holdT;
        mesh.position.z = 1.5 + spec.vz * Math.sin(holdT * Math.PI * 0.84);
        mesh.rotation.set(spec.rx * holdT, spec.ry * holdT, spec.rz * holdT);
        mesh.scale.setScalar(spec.scale * shardScale * (1 - 0.52 * holdT));
      });

      burstMat.opacity = holdActive ? Math.min(1, 8 * holdT) * Math.pow(1 - holdT, 3.4) * 0.82 : 0;
      burstMesh.scale.setScalar(holdActive ? 0.35 + 1.8 * shardMove : 0);
      burstMesh.rotation.z = 0.9 * holdT;

      const detachT = Math.max(0, Math.min(1, (flyP - 0.46) / 0.5));
      const detachScale = Math.min(1, 6 * detachT);
      const detachMove = 1 - Math.pow(1 - detachT, 2);
      const detachOpacity = detachScale * Math.pow(1 - detachT, 1.45);
      detachShardMats[0].opacity = detachOpacity;
      detachShardMats[1].opacity = 0.84 * detachOpacity;
      detachShardMeshes.forEach((mesh, i) => {
        const spec = detachShardSpecs[i];
        mesh.position.x = 1.12 * spec.x + spec.vx * detachMove;
        mesh.position.y = 1.18 * spec.y + spec.vy * detachMove - 0.08 * detachT * detachT;
        mesh.position.z = 0.07 + spec.vz * Math.sin(detachT * Math.PI * 0.9);
        mesh.rotation.set(spec.rx * detachT, spec.ry * detachT, spec.rz * detachT);
        mesh.scale.setScalar(1.7 * spec.scale * detachScale * (1 - 0.48 * detachT));
      });

      tailGroup.visible = isFly && !isDetached;
      tailMat.opacity = 1;
      tailGroup.position.set(rollGroup.position.x, 1.08, rollGroup.position.z);
      tailGroup.scale.set(1, 1, 1);
      tailMesh.scale.x = 1;

      if (isFly || isDetached) {
        if (isFly) {
          ribbonGroup.visible = false;
          detachedGroup.visible = true;
          stubMat.opacity = 1 - THREE.MathUtils.smoothstep(flyP, 0.36, 0.47);
          detachedGroup.position.set(
            THREE.MathUtils.lerp(1.36 + 0.3 * (1 - Math.pow(1 - Math.min(1, flyElapsed / 130), 3)), 0, flyK),
            THREE.MathUtils.lerp(1.08, 1.05, flyK),
            THREE.MathUtils.lerp(1.435, 1.15, flyK),
          );
          detachedGroup.quaternion.slerpQuaternions(identityQuat, lookQuat, flyK);
          detachedGroup.scale.setScalar(1);
        } else {
          ribbonGroup.visible = false;
          detachedGroup.visible = false;
        }
      } else {
        ribbonGroup.visible = true;
        detachedGroup.visible = false;
        stubMat.opacity = 1;
        detachedGroup.position.set(-2.8, 1.08, 0);
        detachedGroup.quaternion.copy(identityQuat);
        detachedGroup.scale.setScalar(1);
      }

      if (reduced) {
        rollGroup.visible = false;
        ribbonGroup.visible = false;
        detachedGroup.visible = false;
        tailGroup.visible = false;
      }

      renderer.render(scene, camera);
      if (!reduced) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      renderer.dispose();
      shadowMat.dispose();
      shadowPlane.geometry.dispose();
      ticketTexture.dispose();
      rollTexture.dispose();
      cardboardTexture.dispose();
      rollMat.dispose();
      ringInnerMat.dispose();
      ringOuterMat.dispose();
      hubMat.dispose();
      coreMat.dispose();
      coreGeo.dispose();
      grooveMats.forEach((mat) => mat.dispose());
      tapeMat.dispose();
      tapeMesh.geometry.dispose();
      lipMat.dispose();
      lipMesh.geometry.dispose();
      stubMat.dispose();
      stubGeometry.dispose();
      perfMats.forEach((mat) => mat.dispose());
      perfGeos.forEach((geo) => geo.dispose());
      slashMatA.dispose();
      slashMatB.dispose();
      slashGeoA.dispose();
      slashGeoB.dispose();
      chipMat.dispose();
      chipGeo.dispose();
      shardMats.forEach((mat) => mat.dispose());
      shardGeo.dispose();
      burstMat.dispose();
      burstGeo.dispose();
      detachShardMats.forEach((mat) => mat.dispose());
      tailTexture.dispose();
      tailMat.dispose();
      tailGeometry.dispose();
      extendedTexture.dispose();
      ribbonMat.dispose();
      ribbonGeometry.dispose();
      rollMesh.geometry.dispose();
    };
  }, [progressRef, reduced, name]);

  return <canvas ref={canvasRef} className="roll-canvas" aria-hidden />;
}
