var Pass = require( 'postprocessing' )
	.Pass;
var VerticalBlurMaterial = require( '../materials/VerticalBlurMaterial' );

class VerticalBlurPass extends Pass {

	constructor( options ) {

		super();

		this.options = options || {};
		// commutate options to local object
		for ( let key in this.options ) {
			this[ key ] = this.options[ key ];
		}

		this.needsSwap = true;

		this.material = new VerticalBlurMaterial();

		this.quad.material = this.material;

	}

	render( renderer, readBuffer, writeBuffer ) {

		this.material.uniforms.tDiffuse.value = readBuffer.texture;
		this.material.uniforms.v.value = 0.01;

		if ( this.renderToScreen || this.options.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, false );

		}

	}

}

module.exports = VerticalBlurPass;
