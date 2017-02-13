var THREE = require( 'three' );

/**
 *
 * @class HorizontalBlurMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 */

class DeJongMathMaterial extends THREE.ShaderMaterial {

	constructor() {

		super( {

			type: 'DeJongMathMaterial',
			uniforms: {
				'uA': {
					type: 'f',
					value: 0
				},
				'uB': {
					type: 'f',
					value: 0
				},
				'uC': {
					type: 'f',
					value: 0
				},
				'uD': {
					type: 'f',
					value: 0
				},
				'uE': {
					type: 'f',
					value: 0
				},
				'uF': {
					type: 'f',
					value: 0
				},
				'cFgColor': {
					type: 'c',
					value: new THREE.Color( 0 )
				},
				'cBgColor': {
					type: 'c',
					value: new THREE.Color( 0 )
				}
			},
			vertexShader: require( './shaders/DeJongMath.vert' ),
			fragmentShader: require( './shaders/DeJongMath.frag' )

		} );

	}

}

module.exports = DeJongMathMaterial;
