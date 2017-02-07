import View from '../../../lib/peak-front-end/js/views/View';

export default class DisplayStateView extends View {
	constructor( options ) {
		super( View.merge( {
			el: '#display-state',
			dataBindings: [],
			bindFunctions: []
		}, options ) );
	}
}