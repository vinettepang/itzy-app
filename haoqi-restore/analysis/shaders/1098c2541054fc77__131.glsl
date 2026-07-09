;else if(null!==e&&e.outputColorSpace===O.SRGBColorSpace)for(let e of t)e.texture.colorSpace=O.SRGBColorSpace}}dispose(){for(let e of(super.dispose(),this.downsamplingMipmaps.concat(this.upsamplingMipmaps)))e.dispose()}},eA=`#ifdef FRAMEBUFFER_PRECISION_HIGH
uniform mediump sampler2D map;
#else
uniform lowp sampler2D map;
#endif
uniform float intensity;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){outputColor=texture2D(map,uv)*intensity;}`,eT=class extends es{constructor({blendFunction:e=ei.SCREEN,luminanceThreshold:t=1,luminanceSmoothing:n=.03,mipmapBlur:r=!0,intensity:i=1,radius:a=.85,levels:o=8,kernelSize:s=3,resolutionScale:l=.5,width:u=et.AUTO_SIZE,height:c=et.AUTO_SIZE,resolutionX:d=u,resolutionY:f=c}={}){super(