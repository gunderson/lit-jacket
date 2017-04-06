const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );

var route = ( model, controller ) => ( req, res ) => {
	controller.toggleLed();
	res.send( {
		status: 200,
		message: 'successfully set led'
	} );
	return;
};

module.exports = route;
