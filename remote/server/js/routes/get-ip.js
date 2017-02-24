const _ = require( 'lodash' );
const SendJSON = require( './lib/SendJSON' );

// simple route to bounce an IP address back at requester
module.exports = ( req, res ) => {
	let ip = req.ip;
	if ( ip.indexOf( ':' ) > -1 ) {
		ip = _.last( ip.split( ':' ) )
	}

	SendJSON( res, {
		status: 200,
		ip: ip
	} );
};
