const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );
const path = require( 'path' );
// const makeHash = require( '../../../../lib/js/make-hash' );

const route = ( req, res ) => {
	let deviceId = req.params.deviceId;
	let devicePath = path.resolve( __dirname, '../../../data/devices.json' );
	console.log( devicePath );
	fs.readFileAsync( devicePath, 'utf-8' )
		.then( ( str ) => {
			let devices = JSON.parse( str );
			let device = _.find( devices, {
				deviceId: deviceId
			} );
			if ( device ) {
				console.log( `http://${device.ip}:${device.port}` )
				res.redirect( `http://${device.ip}:${device.port}` )
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
