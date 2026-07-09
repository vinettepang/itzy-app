varying vec3 vNormal;
varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;
uniform float uDPR;

uniform vec3 uSkyColor;
uniform vec3 uCloudColor;
uniform float uSkyTweenProgress;

uniform sampler2D uSkyTexture;

uniform float uTransparent;

// Simplex 2D noise //
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
	const vec4 C = vec4(0.211324865405187, 0.366025403784439,
			-0.577350269189626, 0.024390243902439);
	vec2 i  = floor(v + dot(v, C.yy) );
	vec2 x0 = v -   i + dot(i, C.xx);
	vec2 i1;
	i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
	vec4 x12 = x0.xyxy + C.xxzz;
	x12.xy -= i1;
	i = mod(i, 289.0);
	vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
	+ i.x + vec3(0.0, i1.x, 1.0 ));
	vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
	dot(x12.zw,x12.zw)), 0.0);
	m = m*m ;
	m = m*m ;
	vec3 x = 2.0 * fract(p * C.www) - 1.0;
	vec3 h = abs(x) - 0.5;
	vec3 ox = floor(x + 0.5);
	vec3 a0 = x - ox;
	m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
	vec3 g;
	g.x  = a0.x  * x0.x  + h.x  * x0.y;
	g.yz = a0.yz * x12.xz + h.yz * x12.yw;
	return 130.0 * dot(m, g);
}

const mat2 m2 = mat2(1.6,  1.2, -1.2,  1.6);

float fbm4(vec2 p) {
    float amp = 0.5;
    float h = 0.0;
    for (int i = 0; i < 4; i++) {
        float n = snoise(p);
        h += amp * n;
        amp *= 0.5;
        p = m2 * p ;
    }
    
	return  0.5 + 0.5*h;
}

vec4 firstColor = vec4(0.121, 0.109, 0.24, 1.0);
vec4 middleColor = vec4(0.38, 0.325, 0.55, 1.0); // green
vec4 endColor = vec4(0.02,0.03,0.09,1.0); // blue

void main() {
	vec2 uv2 = vUv;
	vec3 col = vec3(0.0);
	float h = 0.5;
	vec4 gradient = mix(mix(firstColor, middleColor, uv2.x/h), mix(middleColor, endColor, (uv2.x - h)/(1.0 - h)), step(h, uv2.x));

	#ifdef USE_TEXTURE
		vec4 tex = texture2D(uSkyTexture, uv2);
		col = mix(tex.rgb, gradient.rgb, uSkyTweenProgress);
	#else
		uv2.x *= uResolution.x/uResolution.y;

		vec2 mo = vec2(0.0, 0.0);
		vec3 sky = mix(uSkyColor, gradient.rgb, uSkyTweenProgress);

		float v = 0.005;
		float iTime = uTime;

		vec3 cloudCol = uCloudColor;
		uv2 += mo * 10.0;
	
		vec2 scale = uv2 * 1.5;
		vec2 turbulence = vec2(0.008, 0.008);
		scale += turbulence;
		float n1 = fbm4(vec2(scale.x - 20.0 * sin(iTime * v * 2.0), scale.y - 50.0 * sin(iTime * v)));
		vec3 skyCol = mix(sky, cloudCol, smoothstep(0.35, 0.7, n1));

		col = mix(skyCol, gradient.rgb, uTransparent);
	#endif

	gl_FragColor = vec4(col, 1.0);
}

