const _ = require( 'lodash' );
const path = require( 'path' );
const rp = require( 'request-promise' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );
const makeHash = require( '../../../lib/js/make-hash' );

const route = ( req, res ) => {
	// parse incoming message
	let data = req.body || {};
	data.action = data.action || 'red'

	// look up device ip
	let deviceInfoPath = path.resolve( __dirname, '../../../data/devices.json' )
	fs.readFileAsync( deviceInfoPath, 'utf-8' )
		.then( ( contents ) => {
			let devices = JSON.parse( contents );
			let device = _.find( devices, {
				deviceId: 'aura'
			} );
			let options = {
				method: 'GET',
				uri: 'http://' + path.join( `${device.address}:${device.port}`, 'preset', data.action ),
				headers: {
					'User-Agent': 'Google-Assistant'
				},
				followAllRedirects: true,
				json: true // Automatically parses the JSON string in the response
			};
			// forward command to device
			return rp( options )
				.then( ( ret ) => {
					console.log( ret );
					res.send( {
						status: 200,
						message: 'received successfully forwarded to device'
					} )
				} )
		} )
		.catch( ( err ) => {
			res.send( {
				status: 401,
				error: err,
				message: 'error received'
			} )
		} )


}

module.exports = route;
