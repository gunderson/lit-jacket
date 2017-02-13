uniform sampler2D tDiffuse;
uniform vec3 uColor;
varying vec2 vUv;
void main() {
	vec4 texel = texture2D( tDiffuse, vUv );
	gl_FragColor = vec4( mix( vec3( texel ) , uColor, 0.5), 1.0 ) * texel.a;
}
