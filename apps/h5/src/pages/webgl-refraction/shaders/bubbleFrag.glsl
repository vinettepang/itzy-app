varying vec3 vNormal;
varying vec2 vViewNormal;

uniform float uTransparent;
uniform sampler2D uSceneTex;
uniform vec2 uResolution;
uniform sampler2D uMatcap;
uniform sampler2D uBackfaceMap;

uniform float uRefractPower;
uniform vec3 uBaseColor;
uniform float uMatcapOpacity;
uniform float uNoiseAmount;
uniform vec3 uColorOffset;

uniform float uColorDistort;

float a = 0.33;

float random(vec2 n){
	return .5 - fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453);
}

void main() {
	float faceDirection = gl_FrontFacing ? 1.0 : -1.0;
	vec3 refractCol = vec3( 0.0 );
	vec2 screenUv = gl_FragCoord.xy / uResolution.xy;
	vec2 refractUv = screenUv;

	float yOffset = mix(0.0, 0.15, uColorDistort);
	refractUv.y -= yOffset;
	vec3 backfaceNormal = texture2D(uSceneTex, screenUv).rgb;
	vec3 normal = normalize(vNormal) * faceDirection - (backfaceNormal * vec3(uColorDistort));

	float slide;
	vec2 refractUvR;
	vec2 refractUvG;
	vec2 refractUvB;
	float refractPower = uRefractPower;
	vec2 refractNormal = normal.xy * ( 1.0 - normal.z * 1.33 );

	vec3 outColor = uBaseColor;

	for ( int i = 0; i < 16; i ++ ) {

		slide = float( i ) / 16.0 * 0.1 + random( screenUv ) * uNoiseAmount;

		refractUvR = refractUv - refractNormal * ( refractPower + slide * uColorOffset.r ) * uTransparent;
		refractUvG = refractUv - refractNormal * ( refractPower + slide * uColorOffset.g ) * uTransparent;
		refractUvB = refractUv - refractNormal * ( refractPower + slide * uColorOffset.b ) * uTransparent;

		refractCol.x += texture2D( uSceneTex, refractUvR ).x;
		refractCol.y += texture2D( uSceneTex, refractUvG ).y;
		refractCol.z += texture2D( uSceneTex, refractUvB ).z;

	}

	refractCol /= float( 16 );

	outColor += refractCol;

	vec2 sampleUV = vViewNormal;
    vec4 matcapColor = texture2D(uMatcap, sampleUV);

	gl_FragColor = vec4(outColor + (matcapColor.xyz * vec3(uMatcapOpacity)), uTransparent );
}