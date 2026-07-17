import * as THREE from 'three';

type CreateParticlesOpts = {
  particleMap: THREE.Texture;
  count?: number;
};

/**
 * SOURCE · theme.js buildParticles — InstancedMesh billboards, 300 count,
 * PlaneGeometry(0.001,0.001), particles.ktx2 atlas, baseColor 0xf4e4ef (SOURCE Ilk).
 */
export function createParticles({ particleMap, count = 300 }: CreateParticlesOpts) {
  const geo = new THREE.PlaneGeometry(0.001, 0.001);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      u_baseColor: { value: new THREE.Color(0xf4e4ef) },
      u_time: { value: 0 },
      u_particleTex: { value: particleMap },
      u_lightPos: { value: new THREE.Vector3(0.79, 0.24, 0.63) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorldPosition;
      varying vec3 vPos;
      varying vec2 vUv;
      varying float aUv;
      attribute float a_progress;
      attribute float a_uv;
      uniform float u_time;

      void main() {
        vUv = uv;
        aUv = a_uv;
        vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 billboardPos = right * position.x + up * position.y;
        vec4 mvPosition = vec4(billboardPos, 1.0);

        float progressTime = 100.0 + u_time * 0.8;
        float progress = mod(a_progress + progressTime * 0.002, 0.09);

        mvPosition = instanceMatrix * mvPosition;
        mvPosition.y -= progress;
        mvPosition.z -= progress;
        mvPosition.x += progress * 0.8;

        vWorldPosition = mvPosition.xyz;
        mvPosition = modelViewMatrix * mvPosition;
        vPos = mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vWorldPosition;
      varying vec3 vPos;
      varying vec2 vUv;
      varying float aUv;
      uniform vec3 u_baseColor;
      uniform sampler2D u_particleTex;
      uniform vec3 u_lightPos;

      vec2 rotate2d(vec2 uv, float a) {
        return mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;
      }

      void main() {
        vec4 particleColor = texture2D(u_particleTex, vec2((vUv.x + aUv) * 0.125, vUv.y * 0.5));
        vec4 particleBlur = texture2D(u_particleTex, vec2((vUv.x + aUv) * 0.125, (vUv.y + 1.0) * 0.5));
        vec4 particleMix = mix(particleBlur, particleColor, smoothstep(0.0, 1.0, (cameraPosition.z - vWorldPosition.z) * 10.0));

        vec3 normal = vec3(particleMix.rg * 2.0 - 1.0, 0.0);
        normal.xy = rotate2d(normal.xy, 3.1415926);
        normal.z = sqrt(max(0.0, 1.0 - normal.x * normal.x - normal.y * normal.y));
        normal = normalize(normal);
        float light = max(0.0, dot(normal, normalize(u_lightPos)));
        float alpha = particleMix.b;
        gl_FragColor = vec4(u_baseColor, alpha * light);
        gl_FragColor.a *= 1.0 - smoothstep(-0.015, -0.02, vPos.y);
      }
    `,
  });

  const mesh = new THREE.InstancedMesh(geo, material, count);
  mesh.frustumCulled = false;
  const dummy = new THREE.Object3D();
  const progress: number[] = [];
  const atlasUv: number[] = [];

  for (let i = 0; i < count; i += 1) {
    dummy.position.set(
      THREE.MathUtils.randFloat(-0.2, 0.05),
      0.09,
      THREE.MathUtils.randFloat(-0.1, 0.3),
    );
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    progress.push(Math.random());
    atlasUv.push(i % 8);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.geometry.setAttribute('a_progress', new THREE.InstancedBufferAttribute(new Float32Array(progress), 1));
  mesh.geometry.setAttribute('a_uv', new THREE.InstancedBufferAttribute(new Float32Array(atlasUv), 1));

  return {
    mesh,
    update(timeSec: number) {
      material.uniforms.u_time.value = timeSec;
    },
    dispose() {
      geo.dispose();
      material.dispose();
      mesh.dispose();
    },
  };
}
