var Pass = require( 'postprocessing' )
	.Pass;
var HorizontalBlurMaterial = require( '../materials/HorizontalBlurMaterial' );

class HorizontalBlurPass extends Pass {

	constructor( options ) {

		super();

		this.options = options || {};
		// // commutate options to local object
		for ( let key in this.options ) {
			this[ key ] = this.options[ key ];
		}

		this.needsSwap = true;

		this.material = new HorizontalBlurMaterial();

		this.quad.material = this.material;

	}

	render( renderer, readBuffer, writeBuffer, delta, maskActive ) {

		this.material.uniforms.tDiffuse.value = readBuffer.texture;
		this.material.uniforms.h.value = 0.001;

		if ( this.renderToScreen || this.options.renderToScreen ) {
			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, false );

		}

	}

}

module.exports = HorizontalBlurPass;
