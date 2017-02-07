import ControlFormModel from './models/control-form-model';
import DisplayStateModel from './models/control-form-model';
import ControlFormView from './views/control-form-view';
import DisplayStateView from './views/display-state-view';

const remotes = require( '../../../lib/remotes.json' );

const controlFormView = new ControlFormView( {
	model: new ControlFormModel( {
		remotes
	} )
} );
const displayStateView = new DisplayStateView( {
	model: new DisplayStateModel( {
		remotes
	} )
} );

controlFormView.model.fetch();
displayStateView.model.fetch();
