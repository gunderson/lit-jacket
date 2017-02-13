var Pass = require( 'postprocessing' )
	.Pass;
var DeJongDrawMaterial = require( '../materials/DeJongDrawMaterial' );
var THREE = require( 'three' );

export class DeJongDrawPass extends Pass {

	constructor() {

		super();

		this.needsSwap = true;

		this.material = new DeJongDrawMaterial();

		this.fgColor = new THREE.Color( 0xffffff );
		this.bgColor = new THREE.Color( 0x000000 );

		this.quad.material = this.material;

	}

	render( renderer, readBuffer, writeBuffer ) {

		this.material.uniforms.tData.value = readBuffer.texture;
		this.material.uniforms.uFgColor.value = this.fgColor;
		this.material.uniforms.uBgColor.value = this.fgColor;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, false );

		}

	}

}
