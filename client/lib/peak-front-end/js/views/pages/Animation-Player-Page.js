var _ = require( 'lodash' );
import AnimationPlayer from 'art-kit/src/media/AnimationPlayer';
import Page from './Page';

export default class AnimationPlayerPage extends Page {
	constructor( options ) {
		super( Page.merge( {

			// ---------------------------------------------------
			// Classs Properties

			name: 'Animation-Player',

			// ---------------------------------------------------
			// Local Properties

			autoPlay: false,
			autoStop: true,

			// ---------------------------------------------------
			// Bind Functions

			bindFunctions: [
				'play',
				'stop',
				'update',
				'draw',
				'transitionInComplete',
				'transitionOut'
			]
		}, options ) );

		this.player = new AnimationPlayer( this.update, this.draw );
	}

	transitionInComplete() {
		super.transitionInComplete();
		if ( this.autoPlay ) this.play();
	}

	// transitionIn() {
	// 	super.transitionIn();
	// }

	transitionOut() {
		super.transitionOut();
		if ( this.autoStop ) this.stop();
	}

	play() {
		this.player.play();
		this.trigger( 'play' );
	};

	stop() {
		this.player.stop();
		this.trigger( 'stop' );
	};

	update( data ) {

	};

	draw() {

	};

	get currentTime() {
		return this.player.currentTime;
	}
	set currentTime( val ) {
		this.player.currentTime = val;
		return val;
	}
}
