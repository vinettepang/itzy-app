uniform sampler2D uTexture;
uniform sampler2D uAlpha;
uniform vec2 uResolution;
uniform float uProgress;
varying vec2 vUv;

void main() {
	vec2 st = vUv;
	float yPos = smoothstep(1.0 * uProgress, 1.0, st.y);
	vec4 tex = texture2D(uTexture, st);
	vec4 alphaTex = texture2D(uAlpha, st);

    gl_FragColor = vec4(tex.rgb, yPos * alphaTex.r);
}