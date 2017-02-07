const _ = require( 'lodash' );
import ColormapControlView from './colormap-control-view';
import DisplayStateView from './display-state-view';
import SettingsFormView from './settings-form-view';
import View from '../../../lib/peak-front-end/js/views/View';

export default class AppView extends View {
	constructor( options ) {
		super( View.merge( {
			el: 'body',
			views: {
				settingsFormView: new SettingsFormView( {
					model: options.model
				} ),
				colormapControlView: new ColormapControlView( {
					model: options.model
				} ),
				displayStateView: new DisplayStateView( {
					model: options.model
				} ),
			}
		}, options ) );
		_.each( this.views, ( v ) => v.model = this.model );
	}
}
