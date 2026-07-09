];
s3.preload(s8);
let s5={
particleCount:s8.length,spawnWidth:32,clickSpawnWidth:24,spawnHeight:24,clickSpawnHeight:24,positionY:24,fallDistance:48,zDepth:4,zOffset:-6,windStrength:1.8,windFrequency:.3,scale:1.4,clickScale:1.4,rotationSpeed:.8,fallSpeed:1.8}
,s4=`
attribute vec4 uvRect;
varying vec2 vAtlasUv;
void main() {
  vAtlasUv = uvRect.xy + uv * uvRect.zw;
  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`,s6=`
uniform sampler2D map;
varying vec2 vAtlasUv;
void main() {
  vec4 color = texture2D(map, vAtlasUv);
  if (color.a < 0.01) discard;
  gl_FragColor = color;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,s7=e=>Math.pow(2,Math.ceil(Math.log2(Math.max(1,e)))),ue=e=>{
let t=e.image;
if(!t)return null;
let r=t.width,n=t.height;
return