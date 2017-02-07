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
				url: 'http://localhost/state',
				events: [ {
					target: 'body',
					eventName: 'resize',
					handler: 'onResize'
				} ],
				bindFunctions: [
					'onResize',
				]
			}, options )
		);
	}

	onConnect( data ) {
		super.onConnect( data );
		this.delegateEvents();

	}

	onResize() {
		this.trigger( 'resize' );
	}
}
