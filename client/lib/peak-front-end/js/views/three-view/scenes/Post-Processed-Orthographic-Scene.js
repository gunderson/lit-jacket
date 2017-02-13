var EffectComposer = require( 'postprocessing' )
	.EffectComposer;
var RenderPass = require( 'postprocessing' )
	.RenderPass;
var _ = require( 'lodash' );
var THREE = require( 'three' );
import OrthographicScene from './Orthographic-Scene';

window.THREE = THREE;

export default class PostProcessedOrthographicScene extends OrthographicScene {
	constructor( options ) {
		super( OrthographicScene.merge( {
			// ---------------------------------------------------
			// Class Properties

			camera: {
				fov: 10,
				near: 1,
				far: 100000,
				zoom: 1,
				position: new THREE.Vector3( 0, 1, -1 )
			}
		}, options ) );

	}

	setup() {
		var promise = super.setup();
		this.setupRenderChain( this.options );
		return promise;
	}

	setupRenderChain( options ) {
		this.postProcessingPasses = {
			render: new RenderPass( this.scene, this.camera )
		};
		this.composer = new EffectComposer( this.renderer );
		// INITIALIZE COMPOSER w/ RENDER PASS
		this.composer.addPass( this.postProcessingPasses.render );
		return this;
	}

	render() {
		this.composer.render();
	}

	onResize() {
		super.onResize();
		this.composer.setSize( this.width, this.height );
	}
}
