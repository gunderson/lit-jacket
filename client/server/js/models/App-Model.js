import Model from '../../../lib/peak-front-end/models/Model';

const stateAttributes = require( '../../data/state.json' );

module.exports = class AppModel extends Model {
	constructor( attributes, options ) {
		super(
			Model.merge( stateAttributes, attributes ),
			Model.merge( {
				url: 'http://localhost/state'
			}, options )
		);
	}
}
