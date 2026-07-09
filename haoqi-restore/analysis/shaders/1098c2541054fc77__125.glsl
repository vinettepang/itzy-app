)))return null;if(n===E.RED_RGTC1_Format)return i.COMPRESSED_RED_RGTC1_EXT;if(n===E.SIGNED_RED_RGTC1_Format)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===E.RED_GREEN_RGTC2_Format)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===E.SIGNED_RED_GREEN_RGTC2_Format)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}return n===E.UnsignedInt248Type?e.UNSIGNED_INT_24_8:void 0!==e[n]?e[n]:null}}}let tV=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,tW=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class tX{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(null===this.texture){let n=new E.ExternalTexture(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(null!==this.texture&&null===this.mesh){let t=e.cameras[0].viewport,n=new E.ShaderMaterial({vertexShader:tV,fragmentShader:tW,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new E.Mesh(new E.PlaneGeometry(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class tY extends E.EventDispatcher{constructor(e,t){super();const n=this;let r=null,i=1,a=null,o=