const path = require( 'path' );
var Promise = require( 'bluebird' );

const route = ( controller ) => ( req, res ) => {
	// get sensor data
	res.send( {
		status: 501,
		message: 'sensor lookup is not presently supported'
	} )
};

module.exports = route;
