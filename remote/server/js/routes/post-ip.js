const fs = require( 'fs-extra' );
const path = require( 'path' );
const Promise = require( 'bluebird' );
const makeHash = require( '../../../lib/js/make-hash' );

fs = Promise.promisifyAll( fs );

const route = ( req, res ) => {
	let data = req.body;
	let devices;
	if ( data.ip !== req.ip ) {
		res.send( {
			status: 500,
			message: 'posted IP must match request IP'
		} );
		return;
	}
	// get device-secret
	fs.readFile( path.resolve( '../../../../data/devices' ), 'utf-8' )
		.then( ( str ) => {
			devices = JSON.parse( str );
			// check hash
			let expectedHash = makeHash( req.ip, data.name, devices[ data.name ].secret );
			if ( expectedHash === req.body.hash ) {
				// save device details
				devices[ data.name ].ip = req.ip;
				devices[ data.name ].port = data.port;
				res.send( {
					status: 200,
					message: 'successfully updated IP'
				} );

			} else {
				res.send( {
					status: 401,
					message: 'Bad data',
					request: req.body
				} );

			}
		} )
		.catch( ( err ) => {
			res.send( {
				status: 500,
				message: 'error',
				error: err
			} );
			console.error( err );
		} )
};

module.exports = route;
