import * as THREE from 'three';

/**
 * PARTIAL · fluidPass + screenFxPass replay.
 * SOURCE fluidPass: uImageDistortion default 0, luminance glow via uOpacity.
 * SOURCE screenFxPass: barrel bend (-0.15), vignette (0.05), film noise.
 */
export function createGrainPass(
  renderer: THREE.WebGLRenderer,
  opts?: { getFluidTexture?: () => THREE.Texture | null },
) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geo = new THREE.PlaneGeometry(2, 2);

  let w = 1;
  let h = 1;
  let target = new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: true,
  });

  const uniforms = {
    tDiffuse: { value: target.texture as THREE.Texture },
    uFluidTexture: { value: null as THREE.Texture | null },
    u_time: { value: 0 },
    u_amount: { value: 0.07 },
    // SOURCE fluidPass default
    uImageDistortion: { value: 0 },
    uOpacity: { value: 0.03 },
    uFlash: { value: 0 },
    u_resolution: { value: new THREE.Vector2(1, 1) },
    // SOURCE screenFxPass
    u_bendAmount: { value: -0.15 },
    u_maxDistort: { value: 1 },
    u_vignetteStrength: { value: 0.05 },
    u_noiseOnly: { value: 0 },
  };
  let flash = 0;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform sampler2D tDiffuse;
      uniform sampler2D uFluidTexture;
      uniform float u_time;
      uniform float u_amount;
      uniform float uImageDistortion;
      uniform float uOpacity;
      uniform float uFlash;
      uniform vec2 u_resolution;
      uniform float u_bendAmount;
      uniform float u_maxDistort;
      uniform float u_vignetteStrength;
      uniform float u_noiseOnly;
      varying vec2 vUv;

      const int iterations = 5;
      const vec3 W = vec3(0.2125, 0.7154, 0.0721);

      float hash12(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }

      vec2 barrelDistortion(vec2 coord, float amt) {
        vec2 cc = coord - 0.5;
        float dist = dot(cc, cc);
        return coord + cc * dist * amt;
      }

      float sat(float t) { return clamp(t, 0.0, 1.0); }
      float linterp(float t) { return sat(1.0 - abs(2.0 * t - 1.0)); }
      float remap(float t, float a, float b) { return sat((t - a) / (b - a)); }

      vec4 spectrum_offset(float t) {
        float lo = step(t, 0.5);
        float hi = 1.0 - lo;
        float w = linterp(remap(t, 1.0 / 6.0, 5.0 / 6.0));
        vec4 ret = vec4(lo, 1.0, hi, 1.0) * vec4(1.0 - w, w, 1.0 - w, 1.0);
        return pow(ret, vec4(1.0 / 2.2));
      }

      void main() {
        // Fluid pass (SOURCE · distortion default 0)
        vec4 fluid = texture2D(uFluidTexture, vUv);
        vec2 fluidPos = -normalize(fluid.rgb + 1e-5).xy;
        vec2 sampleUv = vUv + fluidPos * (uImageDistortion + uFlash * 0.02);

        vec4 baseColor = texture2D(tDiffuse, sampleUv);
        vec4 colorB = texture2D(tDiffuse, sampleUv + vec2(uFlash * 0.004, -uFlash * 0.003));
        baseColor.rgb = mix(baseColor.rgb, colorB.rgb, clamp(uFlash * 0.55, 0.0, 0.55));
        float lum = dot(abs(fluid.rgb), W);
        baseColor.rgb += lum * uOpacity * (1.0 - baseColor.a);
        baseColor.rgb += vec3(0.96, 0.93, 0.88) * uFlash * 0.18;

        // screenFx · chromatic barrel + vignette
        vec4 sumcol = vec4(0.0);
        vec4 sumw = vec4(0.0);
        float reci = 1.0 / float(iterations);
        for (int i = 0; i < iterations; i++) {
          float t = float(i) * reci;
          vec4 w = spectrum_offset(t);
          sumw += w;
          sumcol += w * texture2D(
            tDiffuse,
            barrelDistortion(sampleUv, u_bendAmount * u_maxDistort * t)
          );
        }
        vec2 uv2 = vUv * (1.0 - vUv.yx);
        float vig = uv2.x * uv2.y * 20.0;
        vig = pow(max(vig, 1e-4), u_vignetteStrength);
        vec4 screenFx = mix(vec4(vec3(0.0), 1.0), sumcol / max(sumw, vec4(1e-4)), vig);

        vec4 color = mix(screenFx, baseColor, u_noiseOnly);
        // Keep fluid luminance accent on the bent result
        color.rgb = mix(color.rgb, color.rgb + lum * uOpacity, 0.65);

        float f = hash12(gl_FragCoord.xy + u_time);
        color.rgb += vec3(f) * 0.07 * 0.05;
        color.rgb += (hash12(floor(vUv * u_resolution * 0.6) + floor(u_time * 60.0)) - 0.5)
          * (u_amount * 0.35 + uFlash * 0.04);

        gl_FragColor = vec4(color.rgb, 1.0);
      }
    `,
  });

  const quad = new THREE.Mesh(geo, material);
  scene.add(quad);

  const resize = () => {
    w = Math.max(1, Math.floor(window.innerWidth * Math.min(renderer.getPixelRatio(), 2)));
    h = Math.max(1, Math.floor(window.innerHeight * Math.min(renderer.getPixelRatio(), 2)));
    target.setSize(w, h);
    uniforms.tDiffuse.value = target.texture;
    uniforms.u_resolution.value.set(w, h);
  };
  resize();

  return {
    resize,
    /** PARTIAL SavePass pulse · RouteTransition dispatches `us-route-flash` */
    pulse(amount = 1) {
      flash = Math.max(flash, amount);
    },
    render(mainScene: THREE.Scene, mainCamera: THREE.Camera, timeSec: number) {
      flash *= 0.9;
      if (flash < 0.01) flash = 0;
      uniforms.uFlash.value = flash;
      uniforms.u_time.value = timeSec;
      uniforms.uFluidTexture.value = opts?.getFluidTexture?.() ?? null;
      const prev = renderer.getRenderTarget();
      const prevClear = new THREE.Color();
      const prevAlpha = renderer.getClearAlpha();
      renderer.getClearColor(prevClear);
      // Scene draws into RT; transparent clear so body/sky feel through (SOURCE alpha:true)
      renderer.setClearColor(0x000000, 0);
      renderer.setRenderTarget(target);
      renderer.clear();
      renderer.render(mainScene, mainCamera);
      renderer.setClearColor(prevClear, prevAlpha);
      renderer.setRenderTarget(prev);
      renderer.render(scene, camera);
    },
    dispose() {
      target.dispose();
      geo.dispose();
      material.dispose();
    },
  };
}
