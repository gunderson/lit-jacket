const _ = require( 'lodash' );
const $ = require( 'jquery' );
import SocketModel from '../../../lib/peak-front-end/js/models/SocketModel';
import Base from '../../../lib/peak-front-end/js/Base';

const stateAttributes = require( '../../../data/state.default.json' );

export default class AppModel extends SocketModel {
	constructor( attributes, options ) {
		super(
			Base.merge( stateAttributes, attributes ),
			Base.merge( {
				name: 'App-Model',
				url: `http://${options.remotes.device.address}:${options.remotes.device.port}`,
				events: [ {
					target: 'body',
					eventName: 'resize',
					handler: 'onResize'
				}, {
					target: 'socket',
					eventName: 'state',
					handler: 'onSocketState'
				} ],
				bindFunctions: [
					'onResize',
					'onSocketState',
					'playPlayback',
					'pausePlayback',
					'resetPlayback',
					'uploadColormap',
					'updateRemote',
				]
			}, options )
		);
	}

	onConnect() {
		super.onConnect();
		console.log( '---- ON CONNECT' )
		this.delegateEvents();
	}

	onSocketState( state ) {
		console.log( 'STATE', state );
		_.extend( this, state );
	}

	onResize() {
		this.trigger( 'resize' );
	}

	playPlayback() {
		this.socket.emit( 'playback:play' );
	}

	pausePlayback() {
		this.socket.emit( 'playback:pause' );
	}

	resetPlayback() {
		this.socket.emit( 'playback:reset' );
	}

	uploadColormap( data ) {
		this.socket.emit( 'create:colormap', data );
	}
	updateRemote() {
		$.post( '/update-remote' );
	}
	savePreset( presetName ) {
		this.socket.emit( 'create:preset', {
			presetName
		} );
	}
}
