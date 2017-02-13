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
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
