import View from '../../../lib/peak-front-end/js/views/View';

export default class DisplayStateView extends View {
	constructor( options ) {
		super( View.merge( {
			el: '#display-state',
			events: [ {
				target: 'button.update-remote',
				eventName: 'click',
				handler: 'onClickUpdateRemote'
			} ],
			dataBindings: [ {
				element: '.ip-address .val',
				attributeName: 'publicAddress',
				mode: 'get'
			}, {
				element: '.device-name>input',
				attributeName: 'id',
				mode: 'get'
			} ],
			bindFunctions: [
				'onClickUpdateRemote',
			]
		}, options ) );
	}
	onClickUpdateRemote() {
		this.model.updateRemote();
	}

}
