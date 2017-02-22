const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );

var route = ( model, controller ) => ( req, res ) => {
	let color = req.params.color;
	controller.setColor( color );
	res.send( {
		status: 200,
		message: 'successfully set color',
	} );
	return;
};

module.exports = route;
