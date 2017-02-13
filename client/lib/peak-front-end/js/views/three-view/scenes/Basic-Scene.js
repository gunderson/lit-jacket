var _ = require( 'lodash' );
var THREE = require( 'three' );
import PostProcessedScene from './PostProcessedScene';

export default class BasicScene extends PostProcessedScene {
	constructor( options ) {
		super( _.merge( {
			// ---------------------------------------------------
			// Class Properties

			camera: {
				fov: 75,
				near: 1,
				far: 10000,
				position: new THREE.Vector3( 0, 500, -1000 )
			}
		}, options ) );
	}

	update( data ) {}

	// ---------------------------------------------------
	// setup elements

	setupRenderChain( options ) {
		super.setupRenderChain( options );
		this.renderPass.renderToScreen = true;
		return this;
	}

	// ---------------------------------------------------

	setupShaders( options ) {
		return this;
	}

	// ---------------------------------------------------

	setupGeometry( options ) {
		this.geometry.boxgeometry = new THREE.BoxGeometry( 200, 200, 200 );
		return this;
	}

	// ---------------------------------------------------

	setupMaterials( options ) {
		this.materials.basicMaterial = new THREE.MeshBasicMaterial( {
			color: 0xff0000,
			wireframe: true
		} );
		return this;
	}

	// ---------------------------------------------------

	setupMeshes( options ) {
		this.meshes.cube = new THREE.Mesh( this.geometry.boxgeometry, this.materials.basicMaterial );
		return this;
	}

	// ---------------------------------------------------

	setupLights( options ) {
		return this;
	}

	// ---------------------------------------------------

	layoutScene( options ) {
		return this;
	}
}
