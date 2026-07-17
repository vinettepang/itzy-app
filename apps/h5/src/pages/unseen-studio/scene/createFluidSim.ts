import * as THREE from 'three';

type FluidOpts = {
  resolution?: number;
  force?: number;
  iterations?: number;
  mouseRadius?: number;
  pressure?: number;
  viscosity?: number;
  /** UV pointer from raycast against water (or screen UV 0–1) */
  getPointerUv?: () => THREE.Vector2 | null;
};

/**
 * SOURCE · theme.js class `jt` (GPU fluid: advection + divergence + pressure Jacobi + subtract).
 * Used by HomeContact for water.uFluidTexture and screenFxPass.
 */
export function createFluidSim(renderer: THREE.WebGLRenderer, opts: FluidOpts = {}) {
  const resolution = opts.resolution ?? 128;
  const force = opts.force ?? 20;
  const iterations = opts.iterations ?? 1;
  const mouseRadius = opts.mouseRadius ?? 0.2;
  const pressure = opts.pressure ?? 0.999;
  const viscosity = opts.viscosity ?? 0.999;

  const cell = 1 / resolution;
  const cellSize = new THREE.Vector2(cell, cell);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geo = new THREE.PlaneGeometry(2, 2);

  const makeRT = () =>
    new THREE.WebGLRenderTarget(resolution, resolution, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      type: THREE.UnsignedByteType,
      depthBuffer: false,
      stencilBuffer: false,
    });

  const ping = [makeRT(), makeRT()];
  let pingIdx = 0;
  const divergenceRT = makeRT();
  const pressureRT = [makeRT(), makeRT()];
  let pressureIdx = 0;
  const subtractRT = makeRT();

  const mouse = new THREE.Vector2(-1, -1);
  const prevMouse = new THREE.Vector2(-1, -1);
  const forceVec = new THREE.Vector2(0, 0);
  const mouseVelocity = new THREE.Vector2(0, 0);
  let pointerMoved = false;

  const velocityMat = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: null as THREE.Texture | null },
      uCellSize: { value: cellSize },
      uForce: { value: forceVec },
      uMouse: { value: mouse },
      uPrevMouse: { value: prevMouse },
      uMouseVelocity: { value: mouseVelocity },
      uMouseRadius: { value: mouseRadius },
      uPressure: { value: pressure },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform vec2 uCellSize;
      uniform vec2 uForce;
      uniform vec2 uMouse;
      uniform vec2 uPrevMouse;
      uniform vec2 uMouseVelocity;
      uniform float uMouseRadius;
      uniform float uPressure;

      float sdLine(vec2 p, vec2 a, vec2 b) {
        float velocity = clamp(length(uMouseVelocity), 0.5, 1.5);
        vec2 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-5), 0.0, 1.0);
        return length(pa - ba * h) / velocity;
      }

      void main() {
        vec4 color = texture2D(uTexture, vUv - texture2D(uTexture, vUv).xy * uCellSize);
        float dir = smoothstep(1.0 - uMouseRadius, 1.0, 1.0 - min(sdLine(vUv, uPrevMouse, uMouse), 1.0));
        color = clamp((color + vec4(uForce * dir, 0.0, 1.0)) * uPressure, vec4(-1.0), vec4(1.0));
        gl_FragColor = color;
      }
    `,
  });

  const divergenceMat = new THREE.ShaderMaterial({
    uniforms: {
      uVelocity: { value: null as THREE.Texture | null },
      uCellSize: { value: cellSize },
      uViscosity: { value: viscosity },
    },
    vertexShader: velocityMat.vertexShader,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform vec2 uCellSize;
      uniform float uViscosity;
      void main() {
        float x0 = texture2D(uVelocity, vUv - vec2(uCellSize.x, 0.0)).x;
        float x1 = texture2D(uVelocity, vUv + vec2(uCellSize.x, 0.0)).x;
        float y0 = texture2D(uVelocity, vUv - vec2(0.0, uCellSize.y)).y;
        float y1 = texture2D(uVelocity, vUv + vec2(0.0, uCellSize.y)).y;
        float divergence = (x1 - x0 + y1 - y0) * uViscosity;
        gl_FragColor = vec4(divergence);
      }
    `,
  });

  const pressureMat = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: null as THREE.Texture | null },
      uDivergence: { value: null as THREE.Texture | null },
      uAlpha: { value: -1 },
      uBeta: { value: 0.25 },
      uCellSize: { value: cellSize },
    },
    vertexShader: velocityMat.vertexShader,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTexture;
      uniform sampler2D uDivergence;
      uniform float uAlpha;
      uniform float uBeta;
      uniform vec2 uCellSize;
      varying vec2 vUv;
      void main() {
        float x0 = texture2D(uTexture, vUv - vec2(uCellSize.x, 0.0)).r;
        float x1 = texture2D(uTexture, vUv + vec2(uCellSize.x, 0.0)).r;
        float y0 = texture2D(uTexture, vUv - vec2(0.0, uCellSize.y)).r;
        float y1 = texture2D(uTexture, vUv + vec2(0.0, uCellSize.y)).r;
        float b = texture2D(uDivergence, vUv).r;
        float relaxed = (x0 + x1 + y0 + y1 + uAlpha * b) * uBeta;
        gl_FragColor = vec4(relaxed);
      }
    `,
  });

  const subtractMat = new THREE.ShaderMaterial({
    uniforms: {
      uPressure: { value: null as THREE.Texture | null },
      uVelocity: { value: null as THREE.Texture | null },
      uCellSize: { value: cellSize },
    },
    vertexShader: velocityMat.vertexShader,
    fragmentShader: /* glsl */ `
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      uniform vec2 uCellSize;
      varying vec2 vUv;
      void main() {
        float x0 = texture2D(uPressure, vUv - vec2(uCellSize.x, 0.0)).r;
        float x1 = texture2D(uPressure, vUv + vec2(uCellSize.x, 0.0)).r;
        float y0 = texture2D(uPressure, vUv - vec2(0.0, uCellSize.y)).r;
        float y1 = texture2D(uPressure, vUv + vec2(0.0, uCellSize.y)).r;
        vec2 v = texture2D(uVelocity, vUv).xy;
        gl_FragColor = vec4(v - vec2(x1 - x0, y1 - y0) * 0.5, 1.0, 1.0);
      }
    `,
  });

  const mesh = new THREE.Mesh(geo, velocityMat);
  scene.add(mesh);

  const run = (mat: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget) => {
    mesh.material = mat;
    const prev = renderer.getRenderTarget();
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(prev);
  };

  // Seed empty velocity
  renderer.setRenderTarget(ping[0]);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  renderer.setRenderTarget(null);

  const onPointerMove = () => {
    pointerMoved = true;
  };
  window.addEventListener('pointermove', onPointerMove);

  return {
    get texture() {
      return subtractRT.texture;
    },
    update() {
      const uv = opts.getPointerUv?.() ?? null;
      velocityMat.uniforms.uPrevMouse.value.copy(prevMouse);

      if (pointerMoved && uv) {
        if (prevMouse.x < 0) prevMouse.copy(uv);
        mouse.copy(uv);
        forceVec.set((uv.x - prevMouse.x) * force, (uv.y - prevMouse.y) * force);
        prevMouse.copy(uv);
        pointerMoved = false;
      } else {
        mouse.set(-1, -1);
        forceVec.set(0, 0);
        prevMouse.set(-1, -1);
      }

      mouseVelocity.set(
        (mouse.x - velocityMat.uniforms.uPrevMouse.value.x) / 16,
        (mouse.y - velocityMat.uniforms.uPrevMouse.value.y) / 16,
      );

      // Advect + force into ping B
      const read = ping[pingIdx];
      const write = ping[1 - pingIdx];
      velocityMat.uniforms.uTexture.value = read.texture;
      run(velocityMat, write);
      pingIdx = 1 - pingIdx;

      divergenceMat.uniforms.uVelocity.value = ping[pingIdx].texture;
      run(divergenceMat, divergenceRT);

      pressureMat.uniforms.uDivergence.value = divergenceRT.texture;
      for (let i = 0; i < iterations; i += 1) {
        const pr = pressureRT[pressureIdx];
        const pw = pressureRT[1 - pressureIdx];
        pressureMat.uniforms.uTexture.value = pr.texture;
        run(pressureMat, pw);
        pressureIdx = 1 - pressureIdx;
      }

      subtractMat.uniforms.uPressure.value = pressureRT[pressureIdx].texture;
      subtractMat.uniforms.uVelocity.value = ping[pingIdx].texture;
      run(subtractMat, subtractRT);

      // feed subtract back into velocity buffer (theme: velocitySim.update(false))
      const vWrite = ping[1 - pingIdx];
      velocityMat.uniforms.uTexture.value = subtractRT.texture;
      velocityMat.uniforms.uForce.value.set(0, 0);
      velocityMat.uniforms.uMouse.value.set(-1, -1);
      run(velocityMat, vWrite);
      pingIdx = 1 - pingIdx;
      velocityMat.uniforms.uForce.value = forceVec;
      velocityMat.uniforms.uMouse.value = mouse;
    },
    dispose() {
      window.removeEventListener('pointermove', onPointerMove);
      geo.dispose();
      velocityMat.dispose();
      divergenceMat.dispose();
      pressureMat.dispose();
      subtractMat.dispose();
      ping.forEach((rt) => rt.dispose());
      pressureRT.forEach((rt) => rt.dispose());
      divergenceRT.dispose();
      subtractRT.dispose();
    },
  };
}
