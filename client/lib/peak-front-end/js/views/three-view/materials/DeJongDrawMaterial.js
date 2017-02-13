var THREE = require( 'three' );

/**
 *
 * @class HorizontalBlurMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 */

class DeJongDrawMaterial extends THREE.ShaderMaterial {

	constructor() {

		super( {

			type: 'DeJongDrawMaterial',
			uniforms: {
				'tData': {
					type: 't',
					value: null
				},
				'uFgColor': {
					type: 'c',
					value: new THREE.Color( 0 )
				},
				'uBgColor': {
					type: 'c',
					value: new THREE.Color( 0 )
				}
			},
			vertexShader: require( './shaders/DeJongDraw.vert' ),
			fragmentShader: require( './shaders/DeJongDraw.frag' )

		} );

	}

}

module.exports = DeJongDrawMaterial;
