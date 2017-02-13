var _ = require( 'lodash' );
var $ = require( 'jquery' );
var THREE = require( 'three' );
import View from '../../View';

export default class Scene extends View {
	constructor( options ) {
		super( View.merge( {

			// ---------------------------------------------------
			// Local Properties

			camera: {
				fov: 75,
				near: 1,
				far: 100000
			},
			clearColor: 0xffffff,
			clearAlpha: 1,
			geometry: {},
			materials: {},
			meshes: {},
			lights: {},
			shaders: {},
			textures: {},
			isLoaded: false
		}, options ) );
	}

	setup() {
		// console.log( 'Scene::setup' );
		// setup the framework
		this.setupScene( this.options );
		this.setupCamera( this.options );

		// wait until assets are loaded to render the scene
		return this.loadAssets()
			.then( () => {
				this.isLoaded = true;
				this.trigger( 'loaded' );
				this.setupShaders( this.options );
				this.setupMaterials( this.options );
				this.setupGeometry( this.options );
				this.setupMeshes( this.options );
				this.setupLights( this.options );
				this.layoutScene( this.options );
			} );
		// .then( this.onResize );
	}

	// setup scene
	loadAssets() {
		var deferred = $.Deferred();
		// load stuff in here
		// resolve the deferred when load is complete
		deferred.notify( 1 );
		deferred.resolve();
		return deferred.promise();
	};

	setupScene( options ) {
		this.scene = new THREE.Scene();
		return this;
	}

	// setup camera

	setupCamera( options ) {
		this.camera = new THREE.PerspectiveCamera(
			options.camera.fov,
			options.el.innerWidth / options.el.innerHeight,
			options.camera.near,
			options.camera.far );
		return this;
	}

	// setup elements

	setupGeometry( options ) {
		return this;
	}

	setupMaterials( options ) {
		return this;
	}

	setupShaders( options ) {
		return this;
	}

	setupMeshes( options ) {
		return this;
	}

	setupLights( options ) {
		return this;
	}

	layoutScene( options ) {
		_.each( this.meshes, ( m ) => this.scene.add( m ) );
		_.each( this.lights, ( l ) => this.scene.add( l ) );
		this.camera.position.x = options.camera.position.x;
		this.camera.position.y = options.camera.position.y;
		this.camera.position.z = options.camera.position.z;
		this.camera.lookAt( options.camera.lookAt || this.scene.position );
		return this;
	}

	render() {
		this.renderer.render();
	}

	onResize() {
		// console.trace( 'Scene onResize' );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();
	}

	update( data ) {}
}
