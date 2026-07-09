# Scene config windows from 7758f29a8aeb1c60.js

## `hello.gltf` @386243

```js
...SectionNames:cU,children:[(0,s.jsx)(cz,{layers:C,targetRectMapRef:i}),(0,s.jsx)(cK,{cameraRef:m,parallaxEnabled:T,parallaxStrength:D,parallaxLag:F,parallaxRotate:P,leaveParallaxLag:I,ready:p}),(0,s.jsx)(cp,{model:"model/hello.gltf",scrollSyncFactor:.72,modelPosition:[-.1,0,2],beforeRotation:[0,240,0],afterRotation:[0,90,0],rotation:[0,4,0],scale:g?19:22,sectionPosition:e,sectionName:"banner",onReady:()=>l("hello"),tintEnabled:!0}),(0,s.jsx)(cp,{model:"model/cursor.glb",scrollSyncFactor:.72,modelPosition:[g?6.6:11.6,g?-5.6:-4.2,-3],rotationAxisTilt:[0,0,45],beforeRotation:[0,0,0],afterRotation:[0,720,0],scale:.1,sectionPosition:e,sec...
```

## `cnt.gltf` @386818

```js
...on:[0,0,0],afterRotation:[0,720,0],scale:.1,sectionPosition:e,sectionName:"banner",tintEnabled:!0,tingColor:["#009dff","#009dff","#64c3ff","#64c3ff"],onReady:()=>l("h_star")}),(0,s.jsx)(sV,{}),(0,s.jsx)(cp,{model:"model/cnt.gltf",beforeRotation:[-180,0,0],rotation:[0,0,0],scale:19,sectionPosition:e,sectionName:"footer",tintEnabled:!0,tingColor:["#FFFFFF","#009dff","#8e9dc4","#64c3ff"],onReady:()=>l("cnt")}),(0,s.jsx)(ul,{sectionPosition:e,sectionName:"banner"}),t.layers.map(e=>(0,s.jsx)(cw,{ready:p,imageUrl:e.imageUrl,hoverImageUrl:e.hoverImageUrl,targetRef:e.targetRef,layerKey:e.key,getTargetRect:B,onTextureReady:()=>d(e.key)},e.ke...
```

## `cursor.glb` @333226

```js
... t=e.boundingBox;if(!t)return;let r=(t.min.x+t.max.x)/2,n=(t.min.y+t.max.y)/2,i=(t.min.z+t.max.z)/2;Math.abs(r)+Math.abs(n)+Math.abs(i)<1e-8||(e.translate(-r,-n,-i),e.computeBoundingSphere())}function cx({model:e="model/cursor.glb",targetRef:t,getTargetRect:r,refMarginPx:n=120,accentColor:i=cg,stripeColorA:o=cv,stripeColorB:a=cA,restScale:l=.1,scaleSmoothing:c=32,maxScale:f,autoPeakPadding:d=1.64,modelPosition:h=[0,0,0],rotationAxisTilt:p=cy,scaleSpinDegrees:m=360}){let g,v,A=(g=cn(e),v=(0,u.useMemo)(()=>{g.scene.updateMatrixWorld(!0);let e=[];if(g.scene.traverse(t=>{if(t instanceof sy.Mesh&&t.geometry){let r=t.geometry.clone();r.ap...
```

## `cursor.glb` @386485

```js
...Factor:.72,modelPosition:[-.1,0,2],beforeRotation:[0,240,0],afterRotation:[0,90,0],rotation:[0,4,0],scale:g?19:22,sectionPosition:e,sectionName:"banner",onReady:()=>l("hello"),tintEnabled:!0}),(0,s.jsx)(cp,{model:"model/cursor.glb",scrollSyncFactor:.72,modelPosition:[g?6.6:11.6,g?-5.6:-4.2,-3],rotationAxisTilt:[0,0,45],beforeRotation:[0,0,0],afterRotation:[0,720,0],scale:.1,sectionPosition:e,sectionName:"banner",tintEnabled:!0,tingColor:["#009dff","#009dff","#64c3ff","#64c3ff"],onReady:()=>l("h_star")}),(0,s.jsx)(sV,{}),(0,s.jsx)(cp,{model:"model/cnt.gltf",beforeRotation:[-180,0,0],rotation:[0,0,0],scale:19,sectionPosition:e,section...
```

## `MeshPhysicalMaterial` @243008

```js
...t.emissiveIntensity=n),Promise.resolve()}}class ub{constructor(e){this.parser=e,this.name=ug.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?us.MeshPhysicalMaterial:null}extendMaterialParams(e,t){let r=this.parser,n=r.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();let i=[],o=n.extensions[this.name];if(void 0!==o.clearcoatFactor&&(t.clearcoat=o.clearcoatFactor),void 0!==o.clearcoatTexture&&i.push(r.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),void 0!==o.clearcoatRoughnessFactor&&(t.clearcoatRoughness=o.clearcoatRo...
```

## `MeshPhysicalMaterial` @243993

```js
...w us.Vector2(e,e)}return Promise.all(i)}}class ux{constructor(e){this.parser=e,this.name=ug.KHR_MATERIALS_DISPERSION}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?us.MeshPhysicalMaterial:null}extendMaterialParams(e,t){let r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let n=r.extensions[this.name];return t.dispersion=void 0!==n.dispersion?n.dispersion:0,Promise.resolve()}}class uC{constructor(e){this.parser=e,this.name=ug.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.ext...
```

## `MeshPhysicalMaterial` @244435

```js
...rsion?n.dispersion:0,Promise.resolve()}}class uC{constructor(e){this.parser=e,this.name=ug.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?us.MeshPhysicalMaterial:null}extendMaterialParams(e,t){let r=this.parser,n=r.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();let i=[],o=n.extensions[this.name];return void 0!==o.iridescenceFactor&&(t.iridescence=o.iridescenceFactor),void 0!==o.iridescenceTexture&&i.push(r.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),void 0!==o.iridescenceIor&&(t.iridescenceIOR=o.iridescen...
```

## `MeshPhysicalMaterial` @245459

```js
...iridescenceThicknessTexture)),Promise.all(i)}}class uB{constructor(e){this.parser=e,this.name=ug.KHR_MATERIALS_SHEEN}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?us.MeshPhysicalMaterial:null}extendMaterialParams(e,t){let r=this.parser,n=r.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();let i=[];t.sheenColor=new us.Color(0,0,0),t.sheenRoughness=0,t.sheen=1;let o=n.extensions[this.name];if(void 0!==o.sheenColorFactor){let e=o.sheenColorFactor;t.sheenColor.setRGB(e[0],e[1],e[2],uh)}return void 0!==o.sheenRoughnessFactor&&(t.sheenRoughness=o.she...
```

## `MeshStandardMaterial` @268287

```js
...ng=!0),n&&(t.normalScale&&(t.normalScale.y*=-1),t.clearcoatNormalScale&&(t.clearcoatNormalScale.y*=-1)),this.cache.add(e,t),this.associations.set(t,this.associations.get(r))),r=t}e.material=r}getMaterialType(){return us.MeshStandardMaterial}loadMaterial(e){let t,r=this,n=this.json,i=this.extensions,o=n.materials[e],a={},l=o.extensions||{},s=[];if(l[ug.KHR_MATERIALS_UNLIT]){let e=i[ug.KHR_MATERIALS_UNLIT];t=e.getMaterialType(),s.push(e.extendParams(a,o,r))}else{let n=o.pbrMetallicRoughness||{};if(a.color=new us.Color(1,1,1),a.opacity=1,Array.isArray(n.baseColorFactor)){let e=n.baseColorFactor;a.color.setRGB(e[0],e[1],e[2],uh),a.opaci...
```

## `MeshStandardMaterial` @271397

```js
...adMesh(e){let t=this,r=this.json,n=this.extensions,i=r.meshes[e],o=i.primitives,a=[];for(let e=0,t=o.length;e<t;e++){var l;let t=void 0===o[e].material?(void 0===(l=this.cache).DefaultMaterial&&(l.DefaultMaterial=new us.MeshStandardMaterial({color:0xffffff,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:us.FrontSide})),l.DefaultMaterial):this.getDependency("material",o[e].material);a.push(t)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(r){let a=r.slice(0,r.length-1),l=r[r.length-1],s=[];for(let r=0,u=l.length;r<u;r++){let u,c=l[r],f=o[r],d=a[r];if(f.mode===uJ.TRIANGLES||f.mode===uJ.TRIANGLE_STR...
```

## `ShaderMaterial` @204978

```js
...(l.bg),vignette:sU(l.vignette),output:sU(l.output)},mix:sj[e]}},[e,t,r,n,i,o,a])})(n),h=(0,u.useMemo)(()=>d.vec,[n]),p=(0,u.useMemo)(()=>d.mix,[n]),m=(0,u.useMemo)(()=>{let t,r,n,i,s,u,d,m,g;return r=(t=(e,t={})=>new sy.ShaderMaterial({vertexShader:"precision mediump float;\nprecision mediump int;\n\nvarying vec2 vUv;\n\nvoid main() {\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}",fragmentShader:e,uniforms:{tInput:{value:null},uResolution:{value:o},uTime:l,uPos:{value:a},uMousePos:{value:new sy.Vector2(.5,.5)},uTrackMouse:{value:1},...t},transparent:!1,blending:sy.NoBlending,depthTest:!1,...
```

## `ShaderMaterial` @230226

```js
....useMemo)(()=>{let e=new sy.PlaneGeometry(2,2);return e.setAttribute("uvRect",new sy.InstancedBufferAttribute(new Float32Array(8192),4)),e},[]);(0,u.useEffect)(()=>()=>{D.dispose()},[D]);let F=(0,u.useMemo)(()=>T?new sy.ShaderMaterial({uniforms:{map:{value:T.texture}},vertexShader:s4,fragmentShader:s6,transparent:!0,depthWrite:!1,side:sy.FrontSide,toneMapped:!1}):null,[T]);(0,u.useEffect)(()=>()=>{F?.dispose()},[F]),(0,u.useEffect)(()=>{if(!T||m.current)return;m.current=!0,g.current=0,v.current=0;let e=uo(w.particleCount,T.aspects.length,!1);for(let t of e)ut(t,w,"scroll");p.current=e},[T,w]);let P=(0,u.useCallback)(e=>{if(!T)return...
```

## `ShaderMaterial` @347245

```js
...x(),n=l.current;l.current=r;let i=null==n?0:Math.abs(r-n)/t,o=sy.MathUtils.clamp(i/800,0,1),a=c.current,s=1-Math.exp(-t/Math.max(o>a?.025:.175,1e-4)),u=a+(o-a)*s;return c.current=u,.06*u},[])),b=(0,u.useMemo)(()=>new sy.ShaderMaterial({uniforms:{map:{value:null},mapHover:{value:null},uRect:{value:new sy.Vector4(0,0,1,1)},uCurlStrength:{value:0},uPolarityPositive:{value:0},uLayerOpacity:{value:1},uRevealProgress:{value:1},uRevealSoftness:{value:0},uRevealDirection:{value:1},uHoverRevealProgress:{value:0},uDotPixelSize:{value:18},uViewportPx:{value:new sy.Vector2(1,1)}},vertexShader:"varying vec2 vUv;\n\nvoid main() {\n  vUv = uv;\n  ...
```

## `ShaderMaterial` @356253

```js
...tencilBuffer:!1,generateMipmaps:!1}),this.flareTarget.texture.colorSpace=sy.LinearSRGBColorSpace,this.flareTarget.texture.generateMipmaps=!1,this.flareTarget.texture.name="LensFlarePass.Target",this.flareMaterial=new sy.ShaderMaterial({uniforms:{tDiffuse:{value:null},uResolution:{value:new sy.Vector2(1,1)},uEnabled:{value:1},uStarRays:{value:r},uIntensity:{value:n},uThreshold:{value:i},uStreakScale:{value:o},uHotspotPower:{value:a},uGate:{value:l},uTailColor:{value:new sy.Color(s)}},vertexShader:cS,fragmentShader:(e=>e.replace(/#include\s+<colorspace_fragment>\s*/g,""))(u),depthTest:!1,depthWrite:!1,transparent:!1,toneMapped:!1}),th...
```

## `PerspectiveCamera` @273379

```js
...ew us.Group;i.extensions&&uX(n,u,i),t.associations.set(u,{meshes:e});for(let e=0,t=s.length;e<t;e++)u.add(s[e]);return u})}loadCamera(e){let t,r=this.json.cameras[e],n=r[r.type];return n?("perspective"===r.type?t=new us.PerspectiveCamera(us.MathUtils.radToDeg(n.yfov),n.aspectRatio||1,n.znear||1,n.zfar||2e6):"orthographic"===r.type&&(t=new us.OrthographicCamera(-n.xmag,n.xmag,n.ymag,-n.ymag,n.znear,n.zfar)),r.name&&(t.name=this.createUniqueName(r.name)),uZ(t,r),Promise.resolve(t)):void console.warn("THREE.GLTFLoader: Missing camera parameters.")}loadSkin(e){let t=this.json.skins[e],r=[];for(let e=0,n=t.joints.length;e<n;e++)r.push(th...
```

## `OrthographicCamera` @218080

```js
...ent.read.texture},[t,e.resolutionScale,o,r.height,r.width,d.hex.bg,m]),(0,u.useEffect)(()=>()=>{g.current.read.dispose(),g.current.write.dispose()},[]);let v=(0,u.useMemo)(()=>new sy.Scene,[]),A=(0,u.useMemo)(()=>new sy.OrthographicCamera(-1,1,1,-1,0,1),[]),y=(0,u.useRef)(null);(0,u.useEffect)(()=>{let e=new sy.PlaneGeometry(2,2),t=new sy.Mesh(e,m.prePasses[0]?.material);return v.add(t),y.current=t,()=>{v.remove(t),e.dispose()}},[m,v]),(0,u.useEffect)(()=>()=>{m.prePasses.forEach(e=>e.material.dispose()),m.outputMaterial.dispose()},[m]),(0,u.useEffect)(()=>{let e=+!i;m.prePasses.forEach(t=>{t.material.uniforms.uTrackMouse&&(t.materi...
```

## `OrthographicCamera` @273503

```js
...oadCamera(e){let t,r=this.json.cameras[e],n=r[r.type];return n?("perspective"===r.type?t=new us.PerspectiveCamera(us.MathUtils.radToDeg(n.yfov),n.aspectRatio||1,n.znear||1,n.zfar||2e6):"orthographic"===r.type&&(t=new us.OrthographicCamera(-n.xmag,n.xmag,n.ymag,-n.ymag,n.znear,n.zfar)),r.name&&(t.name=this.createUniqueName(r.name)),uZ(t,r),Promise.resolve(t)):void console.warn("THREE.GLTFLoader: Missing camera parameters.")}loadSkin(e){let t=this.json.skins[e],r=[];for(let e=0,n=t.joints.length;e<n;e++)r.push(this._loadNodeShallow(t.joints[e]));return void 0!==t.inverseBindMatrices?r.push(this.getDependency("accessor",t.inverseBindMa...
```

## `uIorR` @320216

```js
...=>{if(!W)return[0,1];W.boundingBox||W.computeBoundingBox();let e=W.boundingBox;if(!e)return[0,1];let t=e.min.y,r=e.max.y;return 1e-6>Math.abs(r-t)?[t,t+1]:[t,r]},[W]),Q=(0,u.useMemo)(()=>((e={})=>({uTexture:{value:null},uIorR:{value:1.15},uIorY:{value:1.16},uIorG:{value:1.18},uIorC:{value:1.22},uIorB:{value:1.22},uIorP:{value:1.22},uRefractPower:{value:.24},uChromaticAberration:{value:.24},uSaturation:{value:1},uShininess:{value:40},uDiffuseness:{value:.1},uFresnelPower:{value:6},uBrightness:{value:1},uContrast:{value:1},uGamma:{value:1},uSpecularStrength:{value:1.2},uFresnelStrength:{value:1},uFresnelSideDir:{value:new sy.Vector3(-...
```

## `uIorR` @324663

```js
...rmedNormal = modelMatrix * normal;\n  worldNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;\n  eyeVector = normalize(worldPos.xyz - cameraPosition);\n  modelLocalY = position.y;\n}",fragmentShader:"uniform float uIorR;\nuniform float uIorY;\nuniform float uIorG;\nuniform float uIorC;\nuniform float uIorB;\nuniform float uIorP;\n\nuniform float uSaturation;\nuniform float uChromaticAberration;\nuniform float uRefractPower;\nuniform float uFresnelPower;\nuniform float uShininess;\nuniform float uDiffuseness;\nuniform vec3 uLight;\n// New tone controls\nuniform float uBrightness;      // scales base refracted color\nuniform flo...
```

## `uIorR` @327771

```js
...onEnabled > 0.5) {\n    color = vec3(0.0);\n\n    float noiseIntensity = 0.025;\n    float noise = random(uv) * noiseIntensity;\n\n    if (uRgbRefraction > 0.5) {\n      vec3 refractVecR = refract(eyeDir, normal, (1.0 / uIorR));\n      vec3 refractVecG = refract(eyeDir, normal, (1.0 / uIorG));\n      vec3 refractVecB = refract(eyeDir, normal, (1.0 / uIorB));\n\n      for (int i = 0; i < uLoop; i++) {\n        float slide = float(i) / float(uLoop) * 0.1 + noise;\n        float offset = (uRefractPower + slide) * uChromaticAberration;\n\n        color.r += texture2D(uTexture, uv + refractVecR.xy * offset).r;\n        color.g += texture...
```

## `uIorR` @328390

```js
...   color.g += texture2D(uTexture, uv + refractVecG.xy * offset).g;\n        color.b += texture2D(uTexture, uv + refractVecB.xy * offset).b;\n      }\n    } else {\n      vec3 refractVecR = refract(eyeDir, normal, (1.0 / uIorR));\n      vec3 refractVecY = refract(eyeDir, normal, (1.0 / uIorY));\n      vec3 refractVecG = refract(eyeDir, normal, (1.0 / uIorG));\n      vec3 refractVecC = refract(eyeDir, normal, (1.0 / uIorC));\n      vec3 refractVecB = refract(eyeDir, normal, (1.0 / uIorB));\n      vec3 refractVecP = refract(eyeDir, normal, (1.0 / uIorP));\n\n      for (int i = 0; i < uLoop; i++) {\n        float slide = float(i) / floa...
```

## `uChromaticAberration` @320356

```js
...s(r-t)?[t,t+1]:[t,r]},[W]),Q=(0,u.useMemo)(()=>((e={})=>({uTexture:{value:null},uIorR:{value:1.15},uIorY:{value:1.16},uIorG:{value:1.18},uIorC:{value:1.22},uIorB:{value:1.22},uIorP:{value:1.22},uRefractPower:{value:.24},uChromaticAberration:{value:.24},uSaturation:{value:1},uShininess:{value:40},uDiffuseness:{value:.1},uFresnelPower:{value:6},uBrightness:{value:1},uContrast:{value:1},uGamma:{value:1},uSpecularStrength:{value:1.2},uFresnelStrength:{value:1},uFresnelSideDir:{value:new sy.Vector3(-1,.3,1)},uTintColorA:{value:new sy.Vector4(1,1,1,1)},uTintColorB:{value:new sy.Vector4(1,1,1,1)},uTintLocalYRange:{value:new sy.Vector2(0,1)...
```

## `uChromaticAberration` @321263

```js
...e:new sy.Vector2},...e}))(),[]);(0,u.useEffect)(()=>{S.current&&S.current.layers.set(x)},[W,x]),(0,u.useLayoutEffect)(()=>{let e=T.current?.uniforms;if(!e)return;e.uTexture.value=y,e.uRefractPower.value=B.refractPower,e.uChromaticAberration.value=B.chromaticAberration,e.uDiffuseness.value=B.diffuseness,e.uShininess.value=B.shininess,e.uFresnelPower.value=B.fresnelPower,e.uSaturation.value=B.saturation,e.uBrightness.value=B.brightness,e.uContrast.value=B.contrast,e.uGamma.value=B.gamma,e.uSpecularStrength.value=B.specularStrength,e.uFresnelStrength.value=B.fresnelStrength,e.uFresnelSideDir.value.set(...B.fresnelSideDir),e.uTintMix.va...
```

## `uChromaticAberration` @324825

```js
...delLocalY = position.y;\n}",fragmentShader:"uniform float uIorR;\nuniform float uIorY;\nuniform float uIorG;\nuniform float uIorC;\nuniform float uIorB;\nuniform float uIorP;\n\nuniform float uSaturation;\nuniform float uChromaticAberration;\nuniform float uRefractPower;\nuniform float uFresnelPower;\nuniform float uShininess;\nuniform float uDiffuseness;\nuniform vec3 uLight;\n// New tone controls\nuniform float uBrightness;      // scales base refracted color\nuniform float uContrast;        // adjusts contrast around 0.5\nuniform float uGamma;           // gamma correction (1.0 = neutral)\nuniform float uSpecularStrength;// scale...
```

## `uChromaticAberration` @328067

```js
...      vec3 refractVecB = refract(eyeDir, normal, (1.0 / uIorB));\n\n      for (int i = 0; i < uLoop; i++) {\n        float slide = float(i) / float(uLoop) * 0.1 + noise;\n        float offset = (uRefractPower + slide) * uChromaticAberration;\n\n        color.r += texture2D(uTexture, uv + refractVecR.xy * offset).r;\n        color.g += texture2D(uTexture, uv + refractVecG.xy * offset).g;\n        color.b += texture2D(uTexture, uv + refractVecB.xy * offset).b;\n      }\n    } else {\n      vec3 refractVecR = refract(eyeDir, normal, (1.0 / uIorR));\n      vec3 refractVecY = refract(eyeDir, normal, (1.0 / uIorY));\n      vec3 refractVec...
```

## `uSaturation` @320389

```js
....useMemo)(()=>((e={})=>({uTexture:{value:null},uIorR:{value:1.15},uIorY:{value:1.16},uIorG:{value:1.18},uIorC:{value:1.22},uIorB:{value:1.22},uIorP:{value:1.22},uRefractPower:{value:.24},uChromaticAberration:{value:.24},uSaturation:{value:1},uShininess:{value:40},uDiffuseness:{value:.1},uFresnelPower:{value:6},uBrightness:{value:1},uContrast:{value:1},uGamma:{value:1},uSpecularStrength:{value:1.2},uFresnelStrength:{value:1},uFresnelSideDir:{value:new sy.Vector3(-1,.3,1)},uTintColorA:{value:new sy.Vector4(1,1,1,1)},uTintColorB:{value:new sy.Vector4(1,1,1,1)},uTintLocalYRange:{value:new sy.Vector2(0,1)},uTintEnabled:{value:0},uTintMix...
```

## `uSaturation` @321417

```js
...)return;e.uTexture.value=y,e.uRefractPower.value=B.refractPower,e.uChromaticAberration.value=B.chromaticAberration,e.uDiffuseness.value=B.diffuseness,e.uShininess.value=B.shininess,e.uFresnelPower.value=B.fresnelPower,e.uSaturation.value=B.saturation,e.uBrightness.value=B.brightness,e.uContrast.value=B.contrast,e.uGamma.value=B.gamma,e.uSpecularStrength.value=B.specularStrength,e.uFresnelStrength.value=B.fresnelStrength,e.uFresnelSideDir.value.set(...B.fresnelSideDir),e.uTintMix.value=B.tintMix;let t=O?Math.min(B.loop,2):B.loop;e.uLoop.value=t,e.uRgbRefraction.value=+(t<=3);let{color:r,alpha:n}=ch(E.tintColorA),{color:i,alpha:o}=ch(...
```

## `uSaturation` @324797

```js
...xyz - cameraPosition);\n  modelLocalY = position.y;\n}",fragmentShader:"uniform float uIorR;\nuniform float uIorY;\nuniform float uIorG;\nuniform float uIorC;\nuniform float uIorB;\nuniform float uIorP;\n\nuniform float uSaturation;\nuniform float uChromaticAberration;\nuniform float uRefractPower;\nuniform float uFresnelPower;\nuniform float uShininess;\nuniform float uDiffuseness;\nuniform vec3 uLight;\n// New tone controls\nuniform float uBrightness;      // scales base refracted color\nuniform float uContrast;        // adjusts contrast around 0.5\nuniform float uGamma;           // gamma correction (1.0 = neutral)\nuniform floa...
```

## `uSaturation` @330385

```js
...2.0 * p - y) / 3.0;\n\n        color.r += R;\n        color.g += G;\n        color.b += B;\n      }\n    }\n\n    color /= float(uLoop);\n  } else {\n    color = texture2D(uTexture, uv).rgb;\n  }\n\n  color = sat(color, uSaturation);\n\n  // Tone adjustments to counter light/dark inversion\n  color *= uBrightness;\n  color = (color - 0.5) * uContrast + 0.5;\n  // prevent division by zero; apply gamma correction\n  float invGamma = 1.0 / max(uGamma, 0.0001);\n  color = pow(max(color, 0.0), vec3(invGamma));\n\n  // 有色玻璃透射/混合：保持原计算逻辑不变\n  // uDark = 0 -> Beer-Lambert\n  // uDark = 1 -> Hard Light\n  float mode = clamp(uDark, 0.0, 1.0);...
```

## `uRefract` @320330

```js
....max.y;return 1e-6>Math.abs(r-t)?[t,t+1]:[t,r]},[W]),Q=(0,u.useMemo)(()=>((e={})=>({uTexture:{value:null},uIorR:{value:1.15},uIorY:{value:1.16},uIorG:{value:1.18},uIorC:{value:1.22},uIorB:{value:1.22},uIorP:{value:1.22},uRefractPower:{value:.24},uChromaticAberration:{value:.24},uSaturation:{value:1},uShininess:{value:40},uDiffuseness:{value:.1},uFresnelPower:{value:6},uBrightness:{value:1},uContrast:{value:1},uGamma:{value:1},uSpecularStrength:{value:1.2},uFresnelStrength:{value:1},uFresnelSideDir:{value:new sy.Vector3(-1,.3,1)},uTintColorA:{value:new sy.Vector4(1,1,1,1)},uTintColorB:{value:new sy.Vector4(1,1,1,1)},uTintLocalYRange:...
```

## `uRefract` @321226

```js
...r3(4,9,.5)},uScreenResolutionPx:{value:new sy.Vector2},...e}))(),[]);(0,u.useEffect)(()=>{S.current&&S.current.layers.set(x)},[W,x]),(0,u.useLayoutEffect)(()=>{let e=T.current?.uniforms;if(!e)return;e.uTexture.value=y,e.uRefractPower.value=B.refractPower,e.uChromaticAberration.value=B.chromaticAberration,e.uDiffuseness.value=B.diffuseness,e.uShininess.value=B.shininess,e.uFresnelPower.value=B.fresnelPower,e.uSaturation.value=B.saturation,e.uBrightness.value=B.brightness,e.uContrast.value=B.contrast,e.uGamma.value=B.gamma,e.uSpecularStrength.value=B.specularStrength,e.uFresnelStrength.value=B.fresnelStrength,e.uFresnelSideDir.value.s...
```

## `uRefract` @324862

```js
...hader:"uniform float uIorR;\nuniform float uIorY;\nuniform float uIorG;\nuniform float uIorC;\nuniform float uIorB;\nuniform float uIorP;\n\nuniform float uSaturation;\nuniform float uChromaticAberration;\nuniform float uRefractPower;\nuniform float uFresnelPower;\nuniform float uShininess;\nuniform float uDiffuseness;\nuniform vec3 uLight;\n// New tone controls\nuniform float uBrightness;      // scales base refracted color\nuniform float uContrast;        // adjusts contrast around 0.5\nuniform float uGamma;           // gamma correction (1.0 = neutral)\nuniform float uSpecularStrength;// scales specular contribution\nuniform floa...
```

## `uRefract` @328042

```js
...normal, (1.0 / uIorG));\n      vec3 refractVecB = refract(eyeDir, normal, (1.0 / uIorB));\n\n      for (int i = 0; i < uLoop; i++) {\n        float slide = float(i) / float(uLoop) * 0.1 + noise;\n        float offset = (uRefractPower + slide) * uChromaticAberration;\n\n        color.r += texture2D(uTexture, uv + refractVecR.xy * offset).r;\n        color.g += texture2D(uTexture, uv + refractVecG.xy * offset).g;\n        color.b += texture2D(uTexture, uv + refractVecB.xy * offset).b;\n      }\n    } else {\n      vec3 refractVecR = refract(eyeDir, normal, (1.0 / uIorR));\n      vec3 refractVecY = refract(eyeDir, normal, (1.0 / uIorY)...
```

## `iResolution` @335183

```js
...(0,u.useCallback)(e=>sy.MathUtils.degToRad(e),[]),J=(0,u.useMemo)(()=>[N(p[0]),N(p[1]),N(p[2])],[p,N]),K=(0,u.useMemo)(()=>[-J[0],-J[1],-J[2]],[J]),$=(0,u.useMemo)(()=>sy.MathUtils.degToRad(m),[m]),z=(0,u.useMemo)(()=>({iResolution:{value:new sy.Vector3(1,1,1)},iTime:{value:0},uScrollDuration:{value:2},uOpacity:{value:1},uAccentColor:{value:new sy.Color(cg)},uStripeColorA:{value:new sy.Color(cv)},uStripeColorB:{value:new sy.Color(cA)},uStripeReveal:{value:0},uLight:{value:new sy.Vector3(4,9,.5)},uShininess:{value:40},uDiffuseness:{value:.1},uSpecularStrength:{value:1.2},uFresnelPower:{value:6},uFresnelStrength:{value:1},uFresnelSide...
```

## `iResolution` @338068

```js
...p=Math.min(.35*er,U.radius*l*er/Math.max(ed.height,1e-4)*.45),em=eu.bottom<-ep,eg=eu.top<ei+ec&&eu.bottom>-(6*n)&&!em;if(z.visible=eg,!eg)return void cm.arrowFullscreenProgressStore.reset();let ev=Math.max(1,B.height);W.iResolution.value.set(eo*Z,ev*Z,1),W.iTime.value=(J=Math.max(1,ei- -(s=eu).height),2*sy.MathUtils.clamp((ei-s.top)/J,0,1));let eA=sy.MathUtils.smoothstep((u=eu,K=Math.max(1,er),sy.MathUtils.clamp((ef-(u.top+n))/K,0,1)),0,1),ey=eu.top+n,eb=eu.bottom-n,ex=((eh.beforeShrink?Math.max(ef,ey):eh.shrinking?ef:Math.min(ef,eb))-en)/er;z.position.set(Y,(.5-ex)*ed.height+Q,X);let eC=Math.hypot(ed.width,ed.height)*d/U.radius,eB=...
```

## `iResolution` @339870

```js
...orldPos;\n\n  gl_Position = projectionMatrix * mvPosition;\n\n  vWorldNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;\n  vEyeVector = normalize(worldPos.xyz - cameraPosition);\n}\n",fragmentShader:"uniform vec3 iResolution;\nuniform float iTime;\nuniform float uScrollDuration;\n\nuniform vec3 uAccentColor;\nuniform vec3 uStripeColorA;\nuniform vec3 uStripeColorB;\nuniform float uStripeReveal;\n\nuniform float uOpacity;\nuniform vec3 uLight;\nuniform float uShininess;\nuniform float uDiffuseness;\nuniform float uSpecularStrength;\nuniform float uFresnelPower;\nuniform float uFresnelStrength;\nuniform vec3 uFresnelSideDir;\n\...
```

## `iResolution` @341038

```js
... vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nvec3 sampleHyperspace(vec2 fragCoord) {\n  vec2 R = iResolution.xy;\n  float baseScale = max(1.0, min(R.x, R.y));\n  vec2 u = (fragCoord * 2.0 - R) / baseScale;\n\n  float dur = max(uScrollDuration, 1e-4);\n  float time = clamp(iTime, 0.0, dur);\n  float t = clamp(time / dur, 0.0, 1.0);\n\n  const float cellDensity = 100.0;\n  vec2 polar = vec2(atan(u.y, u.x) / 3.0, length(u));\n  float angleCoord = (6.0 - polar.x) * cellDensity;\n  float angleId = floor(angleCoord) +...
```

## `uScrollDuration` @335241

```js
...seMemo)(()=>[N(p[0]),N(p[1]),N(p[2])],[p,N]),K=(0,u.useMemo)(()=>[-J[0],-J[1],-J[2]],[J]),$=(0,u.useMemo)(()=>sy.MathUtils.degToRad(m),[m]),z=(0,u.useMemo)(()=>({iResolution:{value:new sy.Vector3(1,1,1)},iTime:{value:0},uScrollDuration:{value:2},uOpacity:{value:1},uAccentColor:{value:new sy.Color(cg)},uStripeColorA:{value:new sy.Color(cv)},uStripeColorB:{value:new sy.Color(cA)},uStripeReveal:{value:0},uLight:{value:new sy.Vector3(4,9,.5)},uShininess:{value:40},uDiffuseness:{value:.1},uSpecularStrength:{value:1.2},uFresnelPower:{value:6},uFresnelStrength:{value:1},uFresnelSideDir:{value:new sy.Vector3(-1,.3,1)}}),[]);return((0,u.useL...
```

## `uScrollDuration` @339920

```js
...osition;\n\n  vWorldNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;\n  vEyeVector = normalize(worldPos.xyz - cameraPosition);\n}\n",fragmentShader:"uniform vec3 iResolution;\nuniform float iTime;\nuniform float uScrollDuration;\n\nuniform vec3 uAccentColor;\nuniform vec3 uStripeColorA;\nuniform vec3 uStripeColorB;\nuniform float uStripeReveal;\n\nuniform float uOpacity;\nuniform vec3 uLight;\nuniform float uShininess;\nuniform float uDiffuseness;\nuniform float uSpecularStrength;\nuniform float uFresnelPower;\nuniform float uFresnelStrength;\nuniform vec3 uFresnelSideDir;\n\nvarying vec3 vWorldNormal;\nvarying vec3 vEyeVect...
```

## `uScrollDuration` @341168

```js
...amp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nvec3 sampleHyperspace(vec2 fragCoord) {\n  vec2 R = iResolution.xy;\n  float baseScale = max(1.0, min(R.x, R.y));\n  vec2 u = (fragCoord * 2.0 - R) / baseScale;\n\n  float dur = max(uScrollDuration, 1e-4);\n  float time = clamp(iTime, 0.0, dur);\n  float t = clamp(time / dur, 0.0, 1.0);\n\n  const float cellDensity = 100.0;\n  vec2 polar = vec2(atan(u.y, u.x) / 3.0, length(u));\n  float angleCoord = (6.0 - polar.x) * cellDensity;\n  float angleId = floor(angleCoord) + 0.5;\n  float angleCell = abs(fract(angleCoord) - 0.5);\n  float radialCoord = (6.0 - polar.y) * cellDensity;\n  vec2 q = vec2(an...
```

## `particleCount` @225737

```js
...ng","/sticker_img/s_05.png","/sticker_img/s_06.png","/sticker_img/s_07.png","/sticker_img/s_08.png","/sticker_img/s_09.png","/sticker_img/s_10.png","/sticker_img/s_11.png","/sticker_img/s_12.png"];s3.preload(s8);let s5={particleCount:s8.length,spawnWidth:32,clickSpawnWidth:24,spawnHeight:24,clickSpawnHeight:24,positionY:24,fallDistance:48,zDepth:4,zOffset:-6,windStrength:1.8,windFrequency:.3,scale:1.4,clickScale:1.4,rotationSpeed:.8,fallSpeed:1.8},s4=`
attribute vec4 uvRect;

varying vec2 vAtlasUv;

void main() {
  vAtlasUv = uvRect.xy + uv * uvRect.zw;

  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  g...
```

## `particleCount` @228900

```js
...),v=(0,u.useRef)(0),A=(0,u.useRef)(new Set),y=(0,u.useRef)([]),b=(0,u.useRef)(new sy.Object3D),x=(0,u.useRef)(new sy.Vector3),C=(0,u.useRef)(!1),B=(0,u.useRef)(!1),E=(0,sw.useIsMobileWidth)(),w=(0,u.useMemo)(()=>({...s5,particleCount:Math.max(1,t??e.length)}),[e.length,t]),M=s3(e),R=(0,u.useMemo)(()=>Array.isArray(M)?M:[M],[M]),S=(0,u.useMemo)(()=>R.length>0&&R.every(e=>!!ue(e)),[R]),T=(0,u.useMemo)(()=>S?(e=>{let t=e.map(ue);if(t.some(e=>!e))return null;let r=Math.max(...t.map(e=>e.width)),n=Math.max(...t.map(e=>e.height)),i=Math.ceil(Math.sqrt(t.length)),o=Math.ceil(t.length/i),a=r+4,l=n+4,s=s7(i*a),u=s7(o*l),c=document.createElem...
```

## `particleCount` @230519

```js
...Shader:s6,transparent:!0,depthWrite:!1,side:sy.FrontSide,toneMapped:!1}):null,[T]);(0,u.useEffect)(()=>()=>{F?.dispose()},[F]),(0,u.useEffect)(()=>{if(!T||m.current)return;m.current=!0,g.current=0,v.current=0;let e=uo(w.particleCount,T.aspects.length,!1);for(let t of e)ut(t,w,"scroll");p.current=e},[T,w]);let P=(0,u.useCallback)(e=>{if(!T)return;let t=uo(w.particleCount,T.aspects.length,!0),r=.05*Math.random();for(let e of t)e.hasStarted=!1,e.dead=!1,e.emitAt=r,r+=.04+.04*Math.random();let n=e.x,i=e.y-w.positionY;for(let e of t)e.originX=n,e.originY=i,e.originZ=0,e.emitAt+=g.current;p.current=ua(p.current.concat(t))},[T,w]);(0,sA.us...
```

## `particleCount` @230658

```js
...ct)(()=>{if(!T||m.current)return;m.current=!0,g.current=0,v.current=0;let e=uo(w.particleCount,T.aspects.length,!1);for(let t of e)ut(t,w,"scroll");p.current=e},[T,w]);let P=(0,u.useCallback)(e=>{if(!T)return;let t=uo(w.particleCount,T.aspects.length,!0),r=.05*Math.random();for(let e of t)e.hasStarted=!1,e.dead=!1,e.emitAt=r,r+=.04+.04*Math.random();let n=e.x,i=e.y-w.positionY;for(let e of t)e.originX=n,e.originY=i,e.originZ=0,e.emitAt+=g.current;p.current=ua(p.current.concat(t))},[T,w]);(0,sA.useFrame)((e,t)=>{let n,i=sI;if(C.current=sD(C.current,i,sR.solidEffect),B.current=sD(B.current,i,sR.refractiveEffect),B.current)return;let o...
```

## `spawnWidth` @225761

```js
...ng","/sticker_img/s_06.png","/sticker_img/s_07.png","/sticker_img/s_08.png","/sticker_img/s_09.png","/sticker_img/s_10.png","/sticker_img/s_11.png","/sticker_img/s_12.png"];s3.preload(s8);let s5={particleCount:s8.length,spawnWidth:32,clickSpawnWidth:24,spawnHeight:24,clickSpawnHeight:24,positionY:24,fallDistance:48,zDepth:4,zOffset:-6,windStrength:1.8,windFrequency:.3,scale:1.4,clickScale:1.4,rotationSpeed:.8,fallSpeed:1.8},s4=`
attribute vec4 uvRect;

varying vec2 vAtlasUv;

void main() {
  vAtlasUv = uvRect.xy + uv * uvRect.zw;

  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  gl_Position = projectionM...
```

## `spawnWidth` @226649

```js
...gment>
}
`,s7=e=>Math.pow(2,Math.ceil(Math.log2(Math.max(1,e)))),ue=e=>{let t=e.image;if(!t)return null;let r=t.width,n=t.height;return"number"!=typeof r||"number"!=typeof n||r<=0||n<=0?null:t},ut=(e,t,r="scroll")=>{let{spawnWidth:n,clickSpawnWidth:i,positionY:o,spawnHeight:a,clickSpawnHeight:l,scale:s,clickScale:u,rotationSpeed:c,windStrength:f,zDepth:d,zOffset:h,fallSpeed:p}=t,m="click"===r?l:a,g=Math.min(.5*Math.max(m,0),8),v="click"===r?o+(2*Math.random()-1)*g:o+Math.random()*Math.max(m,0);e.position.set(e.originX+(Math.random()-.5)*("click"===r?i:n),e.originY+v,e.originZ+(Math.random()-.5)*d+h),e.startY=e.position.y,e.fallSpeed...
```

## `DirectionalLight` @241067

```js
...xtensions&&o.extensions[this.name]||{}).lights||[])[e],l=new us.Color(0xffffff);void 0!==a.color&&l.setRGB(a.color[0],a.color[1],a.color[2],uh);let s=void 0!==a.range?a.range:0;switch(a.type){case"directional":(t=new us.DirectionalLight(l)).target.position.set(0,0,-1),t.add(t.target);break;case"point":(t=new us.PointLight(l)).distance=s;break;case"spot":(t=new us.SpotLight(l)).distance=s,a.spot=a.spot||{},a.spot.innerConeAngle=void 0!==a.spot.innerConeAngle?a.spot.innerConeAngle:0,a.spot.outerConeAngle=void 0!==a.spot.outerConeAngle?a.spot.outerConeAngle:Math.PI/4,t.angle=a.spot.outerConeAngle,t.penumbra=1-a.spot.innerConeAngle/a.sp...
```

## `setClearColor` @217743

```js
...le));o.set(n,i),g.current.read.dispose(),g.current.write.dispose(),g.current={read:new sy.WebGLRenderTarget(n,i,{depthBuffer:!1}),write:new sy.WebGLRenderTarget(n,i,{depthBuffer:!1})},t.setRenderTarget(g.current.read),t.setClearColor(d.hex.bg,1),t.clear(),t.setRenderTarget(null),w.current=0,m.outputMaterial.uniforms.tInput.value=g.current.read.texture},[t,e.resolutionScale,o,r.height,r.width,d.hex.bg,m]),(0,u.useEffect)(()=>()=>{g.current.read.dispose(),g.current.write.dispose()},[]);let v=(0,u.useMemo)(()=>new sy.Scene,[]),A=(0,u.useMemo)(()=>new sy.OrthographicCamera(-1,1,1,-1,0,1),[]),y=(0,u.useRef)(null);(0,u.useEffect)(()=>{let...
```

## `background` @18155

```js
...scrollPaddingLeft:N,scrollPaddingX:N,scrollPaddingY:N,scrollPaddingBlock:N,scrollPaddingBlockEnd:N,scrollPaddingBlockStart:N,scrollPaddingInline:N,scrollPaddingInlineEnd:N,scrollPaddingInlineStart:N,fontSize:"fontSizes",background:j,backgroundColor:j,backgroundImage:j,borderImage:j,border:j,borderBlock:j,borderBlockEnd:j,borderBlockStart:j,borderBottom:j,borderBottomColor:j,borderColor:j,borderInline:j,borderInlineEnd:j,borderInlineStart:j,borderLeft:j,borderLeftColor:j,borderRight:j,borderRightColor:j,borderTop:j,borderTopColor:j,caretColor:j,color:j,columnRuleColor:j,fill:j,outline:j,outlineColor:j,stroke:j,textDecorationColor:j,f...
```

## `background` @18168

```js
...Left:N,scrollPaddingX:N,scrollPaddingY:N,scrollPaddingBlock:N,scrollPaddingBlockEnd:N,scrollPaddingBlockStart:N,scrollPaddingInline:N,scrollPaddingInlineEnd:N,scrollPaddingInlineStart:N,fontSize:"fontSizes",background:j,backgroundColor:j,backgroundImage:j,borderImage:j,border:j,borderBlock:j,borderBlockEnd:j,borderBlockStart:j,borderBottom:j,borderBottomColor:j,borderColor:j,borderInline:j,borderInlineEnd:j,borderInlineStart:j,borderLeft:j,borderLeftColor:j,borderRight:j,borderRightColor:j,borderTop:j,borderTopColor:j,caretColor:j,color:j,columnRuleColor:j,fill:j,outline:j,outlineColor:j,stroke:j,textDecorationColor:j,fontFamily:"fo...
```

## `background` @18186

```js
...ngX:N,scrollPaddingY:N,scrollPaddingBlock:N,scrollPaddingBlockEnd:N,scrollPaddingBlockStart:N,scrollPaddingInline:N,scrollPaddingInlineEnd:N,scrollPaddingInlineStart:N,fontSize:"fontSizes",background:j,backgroundColor:j,backgroundImage:j,borderImage:j,border:j,borderBlock:j,borderBlockEnd:j,borderBlockStart:j,borderBottom:j,borderBottomColor:j,borderColor:j,borderInline:j,borderInlineEnd:j,borderInlineStart:j,borderLeft:j,borderLeftColor:j,borderRight:j,borderRightColor:j,borderTop:j,borderTopColor:j,caretColor:j,color:j,columnRuleColor:j,fill:j,outline:j,outlineColor:j,stroke:j,textDecorationColor:j,fontFamily:"fonts",fontWeight:"f...
```

## `background` @20106

```js
...peof t?String(t).split(X):[t]),q={appearance:e=>({WebkitAppearance:e,appearance:e}),backfaceVisibility:e=>({WebkitBackfaceVisibility:e,backfaceVisibility:e}),backdropFilter:e=>({WebkitBackdropFilter:e,backdropFilter:e}),backgroundClip:e=>({WebkitBackgroundClip:e,backgroundClip:e}),boxDecorationBreak:e=>({WebkitBoxDecorationBreak:e,boxDecorationBreak:e}),clipPath:e=>({WebkitClipPath:e,clipPath:e}),content:e=>({content:e.includes('"')||e.includes("'")||/^([A-Za-z]+\([^]*|[^]*-quote|inherit|initial|none|normal|revert|unset)$/.test(e)?e:`"${e}"`}),hyphens:e=>({WebkitHyphens:e,hyphens:e}),maskImage:e=>({WebkitMaskImage:e,maskImage:e}),ma...
```

## `roughness:` @271457

```js
...s[e],o=i.primitives,a=[];for(let e=0,t=o.length;e<t;e++){var l;let t=void 0===o[e].material?(void 0===(l=this.cache).DefaultMaterial&&(l.DefaultMaterial=new us.MeshStandardMaterial({color:0xffffff,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:us.FrontSide})),l.DefaultMaterial):this.getDependency("material",o[e].material);a.push(t)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(r){let a=r.slice(0,r.length-1),l=r[r.length-1],s=[];for(let r=0,u=l.length;r<u;r++){let u,c=l[r],f=o[r],d=a[r];if(f.mode===uJ.TRIANGLES||f.mode===uJ.TRIANGLE_STRIP||f.mode===uJ.TRIANGLE_FAN||void 0===f.mode)!0===(u=!0===i...
```

## `metalness:` @271445

```js
...ns,i=r.meshes[e],o=i.primitives,a=[];for(let e=0,t=o.length;e<t;e++){var l;let t=void 0===o[e].material?(void 0===(l=this.cache).DefaultMaterial&&(l.DefaultMaterial=new us.MeshStandardMaterial({color:0xffffff,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:us.FrontSide})),l.DefaultMaterial):this.getDependency("material",o[e].material);a.push(t)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(r){let a=r.slice(0,r.length-1),l=r[r.length-1],s=[];for(let r=0,u=l.length;r<u;r++){let u,c=l[r],f=o[r],d=a[r];if(f.mode===uJ.TRIANGLES||f.mode===uJ.TRIANGLE_STRIP||f.mode===uJ.TRIANGLE_FAN||void 0===f.mode)!0...
```

## `ior:` @190162

```js
...nt.style.overflow="hidden")},[]),(0,u.useEffect)(()=>{let e;if(s.current){s.current=!1;return}let t=a.current,r=()=>{o&&(t.style.removeProperty("height"),t.style.removeProperty("overflow"),l.current.scrollIntoView({behavior:"smooth",block:"nearest"}))};t.addEventListener("transitionend",r,{once:!0});let{height:n}=l.current.getBoundingClientRect();return t.style.height=n+"px",o||(t.style.overflow="hidden",e=window.setTimeout(()=>t.style.height="0px",50)),()=>{t.removeEventListener("transitionend",r),clearTimeout(e)}},[o]),{wrapperRef:a,contentRef:l}),d=n4(),h=([e,t])=>{var r;return("__levaInput"in t?null==(r=d.getInput(t.path))?void ...
```

## `ior:` @247755

```js
...?us.MeshPhysicalMaterial:null}extendMaterialParams(e,t){let r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let n=r.extensions[this.name];return t.ior=void 0!==n.ior?n.ior:1.5,Promise.resolve()}}class uR{constructor(e){this.parser=e,this.name=ug.KHR_MATERIALS_SPECULAR}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?us.MeshPhysicalMaterial:null}extendMaterialParams(e,t){let r=this.parser,n=r.json.materials[e];if(!n.extensions||!n.extensions[this.name])return Promise.resolve();let i=[],o=n.extensions[this.name];t.specularIntensity=v...
```

