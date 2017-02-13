var Pass = require( 'postprocessing' )
	.Pass;
var ColorizeMaterial = require( '../materials/ColorizeMaterial' );
var THREE = require( 'three' );

class ColorizePass extends Pass {

	constructor( options ) {

		super();

		this.options = options || {};

		this.color = options.color ? options.color : new THREE.Color( 0 );

		this.renderToScreen = options.renderToScreen;

		this.needsSwap = true;

		this.material = new ColorizeMaterial();

		this.quad.material = this.material;

	}

	render( renderer, readBuffer, writeBuffer ) {

		this.material.uniforms.tDiffuse.value = readBuffer.texture;
		this.material.uniforms.uColor.value = this.color;

		if ( this.renderToScreen || this.options.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, false );

		}

	}

}

module.exports = ColorizePass;
