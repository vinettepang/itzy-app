).value.set(Math.cos(e),Math.sin(e)),this.blurPass.blurMaterial.rotation=e}get offset(){return this._offset}set offset(e){this._offset=e,this.blurPass.blurMaterial.offset=e,this.updateParams()}get focusArea(){return this._focusArea}set focusArea(e){this._focusArea=e,this.blurPass.blurMaterial.focusArea=e,this.updateParams()}get feather(){return this._feather}set feather(e){this._feather=e,this.blurPass.blurMaterial.feather=e,this.updateParams()}get bias(){return 0}set bias(e){}update(e,t,n){this.blurPass.render(e,t,this.renderTarget)}setSize(e,t){let n=this.resolution;n.setBaseSize(e,t),this.renderTarget.setSize(n.width,n.height),this.blurPass.resolution.copy(n)}initialize(e,t,n){this.blurPass.initialize(e,t,n),void 0!==n&&(this.renderTarget.texture.type=n,null!==e&&e.outputColorSpace===O.SRGBColorSpace&&(this.renderTarget.texture.colorSpace=O.SRGBColorSpace))}},tV=`#include <packing>
#define packFloatToRGBA(v) packDepthToRGBA(v)
#define unpackRGBAToFloat(v) unpackRGBAToDepth(v)
uniform lowp sampler2D luminanceBuffer0;uniform lowp sampler2D luminanceBuffer1;uniform float minLuminance;uniform float deltaTime;uniform float tau;varying vec2 vUv;void main(){float l0=unpackRGBAToFloat(texture2D(luminanceBuffer0,vUv));
#if __VERSION__ < 300
float l1=texture2DLodEXT(luminanceBuffer1,vUv,MIP_LEVEL_1X1).r;
#else
float l1=textureLod(luminanceBuffer1,vUv,MIP_LEVEL_1X1).r;
#endif
l0=max(minLuminance,l0);l1=max(minLuminance,l1);float adaptedLum=l0+(l1-l0)*(1.0-exp(-deltaTime*tau));gl_FragColor=(adaptedLum==1.0)?vec4(1.0):packFloatToRGBA(adaptedLum);}`,tW=class extends O.ShaderMaterial{constructor(){super({name: