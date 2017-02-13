uniform vec3 cFgColor;
uniform vec3 cBgColor;
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
