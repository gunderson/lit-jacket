const $ = require( 'jquery' );
import Base from '../../lib/peak-front-end/js/Base';
import AppModel from './models/App-Model';
import AppView from './views/App-View';

const remotes = require( '../../../data/remotes.json' );
// TODO: get state default state
const presets = require( '../../data/presets/presets.json' );
const state = require( '../../data/state.default.json' );

window.$ = $;

state.presets = presets;

const model = new AppModel( state, {
	remotes
} );
const appView = new AppView( {
	model
} );
Base.prototype.APP = model;
Base.prototype.templates = require( './templates' );
// model.connect()
// 	.then( appView.render );


appView.render();
