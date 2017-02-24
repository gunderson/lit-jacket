const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );

var route = ( model, controller ) => ( req, res ) => {
	let color = req.params.color;
	let colorname = controller.setColor( color );
	res.send( {
		status: 200,
		message: 'successfully set color',
		color: colorname || 'unnamed'
	} );
	return;
};

module.exports = route;
