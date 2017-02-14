const _ = require( 'lodash' );
const path = require( 'path' );
const Promise = require( 'bluebird' );
const cp = require( 'child_process' );

const route = ( req, res ) => {
	let data = req.body;
	if ( data.ref_type === 'tag' ) {
		res.send( {
			status: 200,
			message: 'Webhook Server Running: tag'
		} );
	} else if ( data.ref === 'refs/heads/master' ) {
		res.send( {
			status: 200,
			message: 'Webhook Server Running: Push to master'
		} );
		res.end();
		cp.spawn( 'git', [ 'pull', '-f' ], {
			detached: true
		} );
	}
};

module.exports = route;
