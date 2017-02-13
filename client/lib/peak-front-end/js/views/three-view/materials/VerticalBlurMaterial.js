var THREE = require( 'three' );
/**
 *
 * @class VerticalBlurMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 */

class VerticalBlurMaterial extends THREE.ShaderMaterial {

	constructor() {

		super( {

			type: 'VerticalBlurMaterial',
			uniforms: {
				tDiffuse: {
					type: 't',
					value: null
				},
				'v': {
					type: 'f',
					value: 1.0 / 512.0
				}
			},
			vertexShader: require( './shaders/Identity.vert' ),
			fragmentShader: require( './shaders/VerticalBlur.frag' )

		} );

	}

}

module.exports = VerticalBlurMaterial;
