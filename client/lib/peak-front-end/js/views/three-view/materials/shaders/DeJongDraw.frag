uniform vec3 uFgColor;
uniform vec3 uBgColor;
uniform float uA;
uniform float uB;
uniform float uC;
uniform float uD;
uniform float uE;
uniform float uF;
varying vec2 vUv;
void main() {
	// gl_FragColor = vec4(uColor, texture2D( tDiffuse, vUv ).a);
	gl_FragColor = vec4(uColor, 0.1);
}
