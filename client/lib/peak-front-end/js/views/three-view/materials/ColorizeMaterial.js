var THREE = require( 'three' );

/**
 *
 * @class HorizontalBlurMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 */

class ColorizeMaterial extends THREE.ShaderMaterial {

	constructor() {

		super( {

			type: 'ColorizeMaterial',
			uniforms: {
				tDiffuse: {
					value: null
				},
				'uColor': {
					type: 'c',
					value: new THREE.Color( 0 )
				}
			},
			vertexShader: require( './shaders/Colorize.vert' ),
			fragmentShader: require( './shaders/Colorize.frag' )

		} );

	}

}

module.exports = ColorizeMaterial;
