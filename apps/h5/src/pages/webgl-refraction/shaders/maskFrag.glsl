varying vec2 vUv;

uniform vec3 uBaseColor;
uniform sampler2D uTex1;
uniform sampler2D uTex2;
uniform float uMaskSwitchProgress;

void main() {
	vec4 tex1 = texture2D(uTex1, vUv);
	vec4 tex2 = texture2D(uTex2, vUv);

	vec3 maskOutput = mix(tex1.xyz, tex2.xyz, uMaskSwitchProgress);
	vec3 colorMultiplier = mix(vec3(0.0), vec3(1.0), uMaskSwitchProgress * maskOutput.r);

    gl_FragColor = vec4(uBaseColor + colorMultiplier, maskOutput.r);
}

