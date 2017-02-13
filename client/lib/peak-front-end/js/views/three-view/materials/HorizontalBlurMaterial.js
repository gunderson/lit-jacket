var THREE = require( 'three' );

/**
 *
 * @class HorizontalBlurMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 */

class HorizontalBlurMaterial extends THREE.ShaderMaterial {

	constructor() {

		super( {

			type: 'HorizontalBlurMaterial',
			uniforms: {
				tDiffuse: {
					type: 't',
					value: null
				},
				'h': {
					type: 'f',
					value: 1.0 / 512.0
				}
			},
			vertexShader: require( './shaders/Identity.vert' ),
			fragmentShader: require( './shaders/HorizontalBlur.frag' )

		} );

	}

}

module.exports = HorizontalBlurMaterial;
