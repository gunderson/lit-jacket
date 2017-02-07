import View from '../../../lib/peak-front-end/js/views/View';
export default class ColormapControlView extends View {
	constructor( options ) {
		super( View.merge( {
			template: 'colormap-control',
			dataBindings: [],
			bindFunctions: []
		}, options ) );
	}
}
