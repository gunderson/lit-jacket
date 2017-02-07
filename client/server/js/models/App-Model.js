const Model = require( '../../../lib/peak-front-end/js/models/Model' );

const stateAttributes = require( '../../../data/state.json' );

class AppModel extends Model {
	constructor( attributes, options ) {
		super(
			Model.merge( stateAttributes, attributes ),
			Model.merge( {
				url: 'http://localhost/state'
			}, options )
		);
	}
}
module.exports = AppModel;
