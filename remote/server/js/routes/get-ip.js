const _ = require( 'lodash' );
// simple route to bounce an IP address back at requester
module.exports = ( req, res ) => {
	let ip = req.ip;
	if ( ip.indexOf( ':' ) > -1 ) {
		ip = _.last( ip.split( ':' ) )
	}
	res.send( {
		status: 200,
		ip: ip
	} );
};
