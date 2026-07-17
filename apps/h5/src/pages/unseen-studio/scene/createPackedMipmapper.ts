import * as THREE from 'three';

/**
 * SOURCE-shaped · theme `vs` packed mip atlas.
 * Atlas = (srcW * 1.5, srcH): level0 left, higher mips stacked on the right.
 * Uses a ping RT so we never sample the atlas while writing into it.
 */
export function createPackedMipmapper() {
  const copyMat = new THREE.RawShaderMaterial({
    uniforms: { map: { value: null as THREE.Texture | null } },
    vertexShader: /* glsl */ `
      precision highp float;
      attribute vec3 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D map;
      void main() { gl_FragColor = texture2D(map, vUv); }
    `,
    depthTest: false,
    depthWrite: false,
  });

  const downMat = new THREE.RawShaderMaterial({
    uniforms: {
      map: { value: null as THREE.Texture | null },
      parentLevel: { value: 0 },
      parentMapSize: { value: new THREE.Vector2(1, 1) },
      originalMapSize: { value: new THREE.Vector2(1, 1) },
    },
    vertexShader: copyMat.vertexShader,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D map;
      uniform int parentLevel;
      uniform vec2 parentMapSize;
      uniform vec2 originalMapSize;

      vec4 packedTexture2DLOD(sampler2D tex, vec2 uv, int level, vec2 originalPixelSize) {
        float floatLevel = float(level);
        vec2 atlasSize = vec2(floor(originalPixelSize.x * 1.5), originalPixelSize.y);
        float maxLevel = min(floor(log2(originalPixelSize.x)), floor(log2(originalPixelSize.y)));
        floatLevel = min(floatLevel, maxLevel);
        vec2 currentPixelDimensions = floor(originalPixelSize / pow(2.0, floatLevel));
        vec2 pixelOffset = vec2(
          floatLevel > 0.0 ? originalPixelSize.x : 0.0,
          floatLevel > 0.0 ? currentPixelDimensions.y : 0.0
        );
        vec2 minPixel = pixelOffset;
        vec2 maxPixel = pixelOffset + currentPixelDimensions;
        vec2 samplePoint = mix(minPixel, maxPixel, uv) / atlasSize;
        vec2 halfPixelSize = 1.0 / (2.0 * atlasSize);
        samplePoint = min(samplePoint, maxPixel / atlasSize - halfPixelSize);
        samplePoint = max(samplePoint, minPixel / atlasSize + halfPixelSize);
        return texture2D(tex, samplePoint);
      }

      void main() {
        vec2 parentPixelSize = 1.0 / parentMapSize;
        vec2 childMapSize = parentMapSize * 0.5;
        vec2 childPixelPos = floor(vUv * childMapSize);
        vec2 parentPixelPos = childPixelPos * 2.0;
        vec2 baseUv = parentPixelPos / parentMapSize + parentPixelSize * 0.5;
        vec4 s0 = packedTexture2DLOD(map, baseUv, parentLevel, originalMapSize);
        vec4 s1 = packedTexture2DLOD(map, baseUv + vec2(parentPixelSize.x, 0.0), parentLevel, originalMapSize);
        vec4 s2 = packedTexture2DLOD(map, baseUv + vec2(0.0, parentPixelSize.y), parentLevel, originalMapSize);
        vec4 s3 = packedTexture2DLOD(map, baseUv + vec2(parentPixelSize.x, parentPixelSize.y), parentLevel, originalMapSize);
        gl_FragColor = (s0 + s1 + s2 + s3) * 0.25;
      }
    `,
    depthTest: false,
    depthWrite: false,
  });

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), copyMat);
  scene.add(quad);

  let atlas: THREE.WebGLRenderTarget | null = null;
  let ping: THREE.WebGLRenderTarget | null = null;
  const targetSize = new THREE.Vector2();

  const makeRT = (w: number, h: number) =>
    new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: false,
      depthBuffer: false,
    });

  const ensureAtlas = (w: number, h: number) => {
    const aw = Math.max(2, Math.floor(w * 1.5));
    const ah = Math.max(2, h);
    if (!atlas || atlas.width !== aw || atlas.height !== ah) {
      atlas?.dispose();
      atlas = makeRT(aw, ah);
    }
    targetSize.set(aw, ah);
    return atlas;
  };

  const ensurePing = (w: number, h: number) => {
    if (!ping || ping.width !== w || ping.height !== h) {
      ping?.dispose();
      ping = makeRT(w, h);
    }
    return ping;
  };

  const update = (
    sourceTex: THREE.Texture,
    sourceRT: THREE.WebGLRenderTarget,
    renderer: THREE.WebGLRenderer,
  ) => {
    const w = sourceRT.width;
    const h = sourceRT.height;
    const rt = ensureAtlas(w, h);
    const prev = renderer.getRenderTarget();
    const prevAutoClear = renderer.autoClear;
    const prevClear = new THREE.Color();
    renderer.getClearColor(prevClear);
    const prevAlpha = renderer.getClearAlpha();

    renderer.autoClear = false;
    renderer.setScissorTest(true);

    // Level 0 → left of atlas (sample source, write atlas — no feedback)
    renderer.setRenderTarget(rt);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.setViewport(0, 0, w, h);
    renderer.setScissor(0, 0, w, h);
    quad.material = copyMat;
    copyMat.uniforms.map.value = sourceTex;
    renderer.render(scene, camera);

    const maxLevel = Math.min(5, Math.floor(Math.log2(Math.min(w, h))));
    downMat.uniforms.originalMapSize.value.set(w, h);

    let stackY = 0;
    for (let level = 1; level <= maxLevel; level += 1) {
      const dimW = Math.max(1, Math.floor(w / 2 ** level));
      const dimH = Math.max(1, Math.floor(h / 2 ** level));
      const tmp = ensurePing(dimW, dimH);

      // Sample atlas → write ping (safe)
      renderer.setRenderTarget(tmp);
      renderer.setViewport(0, 0, dimW, dimH);
      renderer.setScissor(0, 0, dimW, dimH);
      renderer.clear();
      quad.material = downMat;
      downMat.uniforms.map.value = rt.texture;
      downMat.uniforms.parentLevel.value = level - 1;
      downMat.uniforms.parentMapSize.value.set(
        Math.max(1, Math.floor(w / 2 ** (level - 1))),
        Math.max(1, Math.floor(h / 2 ** (level - 1))),
      );
      renderer.render(scene, camera);

      // Blit ping → atlas right stack
      renderer.setRenderTarget(rt);
      renderer.setViewport(w, stackY, dimW, dimH);
      renderer.setScissor(w, stackY, dimW, dimH);
      quad.material = copyMat;
      copyMat.uniforms.map.value = tmp.texture;
      renderer.render(scene, camera);

      stackY += dimH;
    }

    renderer.setScissorTest(false);
    const el = renderer.domElement;
    renderer.setViewport(0, 0, el.width, el.height);
    renderer.setRenderTarget(prev);
    renderer.setClearColor(prevClear, prevAlpha);
    renderer.autoClear = prevAutoClear;
    return rt;
  };

  return {
    targetSize,
    get texture() {
      return atlas?.texture ?? null;
    },
    resize(size: THREE.Vector2) {
      ensureAtlas(size.x, size.y);
    },
    update,
    dispose() {
      atlas?.dispose();
      ping?.dispose();
      atlas = null;
      ping = null;
      copyMat.dispose();
      downMat.dispose();
      quad.geometry.dispose();
    },
  };
}
