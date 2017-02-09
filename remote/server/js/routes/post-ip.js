const _ = require( 'lodash' );
const path = require( 'path' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );
const makeHash = require( '../../../lib/js/make-hash' );

const route = ( req, res ) => {
	let data = req.body;
	let devices;
	let ip = req.ip;
	if ( ip.indexOf( ':' ) > -1 ) {
		ip = _.last( ip.split( ':' ) )
	}
	console.log( data.ip, ip );
	if ( data.ip !== ip ) {
		res.send( {
			status: 500,
			message: 'posted IP must match request IP'
		} );
		return;
	}
	// get device-secret
	let deviceInfoPath = path.resolve( __dirname, '../../../data/devices.json' )
	console.log( deviceInfoPath )
	fs.readFileAsync( deviceInfoPath, 'utf-8' )
		.then( ( str ) => {
			devices = JSON.parse( str );
			// check hash
			let device = _.find( devices, {
				deviceId: data.deviceId
			} );
			let expectedHash = makeHash( ip, device.deviceId, device.secret );
			console.log( 'checking hash' )
			if ( expectedHash === req.body.hash ) {
				console.log( 'hash passed' )
				// save device details
				device.ip = ip;
				device.port = data.port;

				// save device data
				fs.writeFile( deviceInfoPath, JSON.stringify( devices ), {
					encoding: 'utf-8'
				} );

				res.send( {
					status: 200,
					message: 'successfully updated IP'
				} );

			} else {
				console.log( 'hash failed' )
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
