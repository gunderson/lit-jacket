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
				]
			}, options )
		);
	}

	onConnect() {
		super.onConnect();
		this.delegateEvents();
	}

	onSocketState( state ) {
		console.log( 'STATE', state );
		_.extend( this, state );
	}

	onResize() {
		this.trigger( 'resize' );
	}
}
