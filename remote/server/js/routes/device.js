const fs = require( 'fs-extra' );
const path = require( 'path' );
const Promise = require( 'bluebird' );
const makeHash = require( '../../../../lib/js/make-hash' );

fs = Promise.promisifyAll( fs );

const route = ( req, res ) => {
	let deviceId = req.deviceId;
	fs.readFile( path.resolve( '../../../../data/devices' ), 'utf-8' )
		.then( ( str ) => {
			let devices = JSON.parse( str );
			if ( devices[ deviceId ] ) {
				res.redirect( path.join( 'http://', devices[ deviceId ].ip ) )
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
