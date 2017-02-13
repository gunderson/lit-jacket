/**
 * @author tapio / http://tapio.github.com/
 *
 * Brightness and contrast adjustment
 * https://github.com/evanw/glfx.js
 * brightness: -1 to 1 (-1 is solid black, 0 is no change, and 1 is solid white)
 * contrast: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */

module.exports = {
	uniforms: {
		'tDiffuse': {
			value: null
		},
		'brightness': {
			value: 0
		},
		'contrast': {
			value: 0
		}
	},
	vertexShader: require( './Identity.vert' ),
	fragmentShader: require( './BrightnessContrast.frag' )

};
