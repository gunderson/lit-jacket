var Pass = require( 'postprocessing' )
	.Pass;
var DeJongMathMaterial = require( '../materials/DeJongMathMaterial' );
var rand = require( '_ART-KIT/random' );

export class DeJongMathPass extends Pass {

	constructor() {

		super();

		this.needsSwap = true;

		this.material = new DeJongMathMaterial();

		this.fgColor = new THREE.Color( 0xffffff );
		this.bgColor = new THREE.Color( 0x000000 );
		this.uA = 0;
		this.uB = 0;
		this.uC = 0;
		this.uD = 0;
		this.uE = 0;
		this.uF = 0;

		this.quad.material = this.material;

	}

	render( renderer, readBuffer, writeBuffer ) {

		this.material.uniforms.cFgColor.value = this.fgColor;
		this.material.uniforms.cBgColor.value = this.fgColor;
		this.material.uniforms.uA.value = this.uA;
		this.material.uniforms.uB.value = this.uB;
		this.material.uniforms.uC.value = this.uC;
		this.material.uniforms.uD.value = this.uD;
		this.material.uniforms.uE.value = this.uE;
		this.material.uniforms.uF.value = this.uF;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, false );

		}

	}

}
