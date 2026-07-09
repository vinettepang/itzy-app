
attribute vec4 uvRect;
varying vec2 vAtlasUv;
void main() {
  vAtlasUv = uvRect.xy + uv * uvRect.zw;
  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
