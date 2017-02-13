var _ = require( 'lodash' );
var THREE = require( 'three' );
import Scene from './Scene';

export default class OrthographicScene extends Scene {
	constructor( options ) {
		super( _.merge( {
			// ---------------------------------------------------
			// Class Properties

			camera: {
				near: 1,
				far: 10000,
				zoom: 5,
				position: new THREE.Vector3( 0, 1, -1 )
			}
		}, options ) );
	}

	setupCamera( options ) {
		this.camera = new THREE.OrthographicCamera(
			options.camera.zoom * -this.halfWidth, // left
			options.camera.zoom * this.halfWidth, // right
			options.camera.zoom * this.halfHeight, // top
			options.camera.zoom * -this.halfHeight, // bottom
			options.camera.near,
			options.camera.far );

		this.camera.position.x = options.camera.position.x;
		this.camera.position.y = options.camera.position.y;
		this.camera.position.z = options.camera.position.z;
		this.camera.lookAt( options.lookAt || this.scene.position );
		return this;
	}

	onResize() {
		this.camera.left = this.options.camera.zoom * -this.halfWidth;
		this.camera.right = this.options.camera.zoom * this.halfWidth;
		this.camera.top = this.options.camera.zoom * this.halfHeight;
		this.camera.bottom = this.options.camera.zoom * -this.halfHeight;
		this.camera.updateProjectionMatrix();
		return this;
	}
}
