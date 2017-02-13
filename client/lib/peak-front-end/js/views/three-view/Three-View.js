var _ = require( 'lodash' );
var THREE = require( 'three' );
import View from '../View';

export default class ThreeView extends View {
	constructor( options ) {

		super( ThreeView.merge( {

			// ---------------------------------------------------
			// Class Properties

			name: 'three-holder',
			el: '.three-holder',

			// ---------------------------------------------------
			// Local Properties

			rendererOptions: undefined,
			scenes: undefined,

			// ---------------------------------------------------
			// Event Listeners

			// ---------------------------------------------------
			// Bind Functions

			bindFunctions: [
				'update',
				'draw',
				'setup',
				'onResize'
			]
		}, options ) );
	}

	// ---------------------------------------------------
	// Setup Threejs
	// setup() is called by peak/js/pages/ThreejsPage.js :: setupThreeView()
	// which is called by peak/js/pages/ThreejsPage.js :: afterRender()
	setup() {
		// Renderer
		this.renderer = new THREE.WebGLRenderer( {
			alpha: true
		} );
		this.renderer.setClearColor( 0x000000, 0 );
		this.renderer.setSize( this.el.innerWidth, this.el.innerHeight );
		this.$el.append( this.renderer.domElement );

		// Setup Scenes
		this.scenes = _.mapValues( this.scenes, ( SceneClass, id ) => {
			return new SceneClass( {
				el: this.el,
				renderer: this.renderer
			} );
		} );

		var sceneNames = _.keys( this.scenes );

		if ( sceneNames.length ) this.changeScene( sceneNames[ 0 ] );

		return this;
	}

	changeScene( name ) {
		// console.log( 'Three-View changeScene to:', name, this.activeScene ? `from: ${this.activeScene.name}` : '' );
		// TODO: fade out
		this.activeScene = this.scenes[ name ];
		var loadPromise = this.activeScene.setup( {
			renderer: this.renderer
		} );

		// TODO: Show Loader
		loadPromise.then( () => {
			// TODO: hide Loader
			this.onResize();
		} );

		// TODO: fade up
	}

	onResize() {
		this.width = this.$el.width();
		this.height = this.$el.height();
		this.halfWidth = this.width * 0.5;
		this.halfHeight = this.height * 0.5;

		_.each( this.scenes, ( s ) => {
			s.width = this.width;
			s.height = this.height;
			s.halfWidth = this.halfWidth;
			s.halfHeight = this.halfHeight;
		} );
		if ( this.renderer ) this.renderer.setSize( this.width, this.height );
		if ( this.activeScene ) this.activeScene.onResize();
	};

	update( data ) {
		data.time = Date.now();
		if ( this.activeScene && this.activeScene.isLoaded ) {
			this.activeScene.update( data );
		}
		this.trigger( 'update', data );
	};

	draw() {
		let data = {
			time: Date.now()
		};
		if ( this.activeScene && this.activeScene.isLoaded ) {
			this.activeScene.render( data );
		}
		this.trigger( 'draw', data );
	};

	serialize() {
		return _.extend(
			super.serialize(), {
				sceneNames: _.keys( this.scenes )
			}
		);
	}

}
