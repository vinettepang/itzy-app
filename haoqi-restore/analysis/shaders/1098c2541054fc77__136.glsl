},uniforms:{depthBuffer:new O.Uniform(null),projectionMatrix:new O.Uniform(null),projectionMatrixInverse:new O.Uniform(null),cameraNear:new O.Uniform(.3),cameraFar:new O.Uniform(1e3),focusDistance:new O.Uniform(0),focusRange:new O.Uniform(0)},blending:O.NoBlending,toneMapped:!1,depthWrite:!1,depthTest:!1,fragmentShader:eL,vertexShader:V}),this.uniforms.focalLength=this.uniforms.focusRange,null!==e&&this.copyCameraSettings(e)}set depthBuffer(e){this.uniforms.depthBuffer.value=e}set depthPacking(e){this.defines.DEPTH_PACKING=e.toFixed(0),this.needsUpdate=!0}setDepthBuffer(e,t=O.BasicDepthPacking){this.depthBuffer=e,this.depthPacking=t}get focusDistance(){return this.uniforms.focusDistance.value}set focusDistance(e){this.uniforms.focusDistance.value=e}get worldFocusDistance(){return this.focusDistance}set worldFocusDistance(e){this.focusDistance=e}getFocusDistance(e){this.uniforms.focusDistance.value=e}setFocusDistance(e){this.uniforms.focusDistance.value=e}get focalLength(){return this.focusRange}set focalLength(e){this.focusRange=e}get focusRange(){return this.uniforms.focusRange.value}set focusRange(e){this.uniforms.focusRange.value=e}get worldFocusRange(){return this.focusRange}set worldFocusRange(e){this.focusRange=e}getFocalLength(e){return this.focusRange}setFocalLength(e){this.focusRange=e}adoptCameraSettings(e){this.copyCameraSettings(e)}copyCameraSettings(e){this.uniforms.projectionMatrix.value=e.projectionMatrix,this.uniforms.projectionMatrixInverse.value=e.projectionMatrixInverse,this.uniforms.cameraNear.value=e.near,this.uniforms.cameraFar.value=e.far;let t=void 0!==this.defines.PERSPECTIVE_CAMERA;e instanceof O.PerspectiveCamera?t||(this.defines.PERSPECTIVE_CAMERA=!0,this.needsUpdate=!0):t&&(delete this.defines.PERSPECTIVE_CAMERA,this.needsUpdate=!0)}},eU=`#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D inputBuffer;
#else
uniform lowp sampler2D inputBuffer;
#endif
#ifdef MASK_PRECISION_HIGH
uniform mediump sampler2D maskTexture;
#else
uniform lowp sampler2D maskTexture;
#endif
#if MASK_FUNCTION != 0
uniform float strength;
#endif
varying vec2 vUv;void main(){
#if COLOR_CHANNEL == 0
float mask=texture2D(maskTexture,vUv).r;
#elif COLOR_CHANNEL == 1
float mask=texture2D(maskTexture,vUv).g;
#elif COLOR_CHANNEL == 2
float mask=texture2D(maskTexture,vUv).b;
#else
float mask=texture2D(maskTexture,vUv).a;
#endif
#if MASK_FUNCTION == 0
#ifdef INVERTED
mask=(mask>0.0)?0.0:1.0;
#else
mask=(mask>0.0)?1.0:0.0;
#endif
#else
mask=clamp(mask*strength,0.0,1.0);
#ifdef INVERTED
mask=1.0-mask;
#endif
#endif
#if MASK_FUNCTION == 3
vec4 texel=texture2D(inputBuffer,vUv);gl_FragColor=vec4(mask*texel.rgb,texel.a);
#elif MASK_FUNCTION == 2
gl_FragColor=vec4(mask*texture2D(inputBuffer,vUv).rgb,mask);
#else
gl_FragColor=mask*texture2D(inputBuffer,vUv);
#endif
}`,eB=class extends O.ShaderMaterial{constructor(e=null){super({name: