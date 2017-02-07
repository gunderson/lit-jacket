const path = require( 'path' );
const Promise = require( 'bluebird' );
const makeHash = require( '../../../lib/js/make-hash' );
const rp = require( 'request-promise' );


module.exports = function( model ) {

	return route = ( req, res ) => {
		let myIp
		let options0 = {
			method: 'GET',
			uri: path.join( remotes.remote.address, 'ip' ),
			headers: {
				'User-Agent': 'Request-Promise'
			},
			json: true // Automatically parses the JSON string in the response
		};

		let options1 = {
			method: 'POST',
			uri: path.join( remotes.remote.address, 'ip' ),
			headers: {
				'User-Agent': 'Request-Promise'
			},
			json: true // Automatically parses the JSON string in the response
		}

		// Ping server to get public IP
		rp( options0 )
			.then( ( data ) => {
				// create hash
				myIp = data.ip;
				let hash = makeHash( data.ip, model.credentials.deviceId, model.credentials.secret );

				// update remote with my ip
				options1.body = {
					hash: hash,
					ip: myIp,
					deviceId: model.credentials.deviceId
				}
				// once public IP is obtained, update server with public IP
				rp( options1 )
					.then( ( data ) => {
						// update state
						model.publicAddress = myIp;
						res.send( {
							status: 200,
							message: 'IP updated'
						} )
					} )
					.catch( ( err ) => {
						res.send( {
							status: 500,
							message: 'IP update failed',
							request: req.body,
							options: options1,
							error: err
						} )
					} );
			} )
			.catch( ( err ) => {
				res.send( {
					status: 500,
					message: 'IP check failed',
					request: req.body,
					options: options0,
					error: err
				} )
			} );
	};
}
