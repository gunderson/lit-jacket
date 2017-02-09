const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );
const path = require( 'path' );
// const makeHash = require( '../../../../lib/js/make-hash' );

const route = ( req, res ) => {
	let deviceId = req.params.deviceId;
	fs.readFileAsync( path.resolve( '../../../../data/devices.json' ), 'utf-8' )
		.then( ( str ) => {
			let devices = JSON.parse( str );
			let device = _.find( devices, {
				deviceId: deviceId
			} );
			if ( device ) {
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
