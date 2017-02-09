const path = require( 'path' );
const Promise = require( 'bluebird' );
const makeHash = require( '../../../lib/js/make-hash' );
const rp = require( 'request-promise' );


module.exports = function( model ) {

	return route = ( req, res ) => {
		let remote = model.remotes.remote
		let myIp
		let options0 = {
			method: 'GET',
			uri: 'http://' + path.join( `${remote.address}:${remote.port}`, 'ip' ),
			headers: {
				'User-Agent': 'Request-Promise'
			},
			followAllRedirects: true,
			json: true // Automatically parses the JSON string in the response
		};

		let options1 = {
			method: 'POST',
			uri: 'http://' + path.join( `${remote.address}:${remote.port}`, 'ip' ),
			headers: {
				'User-Agent': 'Request-Promise'
			},
			followAllRedirects: true,
			json: true // Automatically parses the JSON string in the response
		}

		// Ping server to get public IP
		console.log( "inital ping" )
		rp( options0 )
			.then( ( data ) => {
				// create hash
				myIp = data.ip;
				let hash = makeHash( data.ip, model.credentials.deviceId, model.credentials.secret );

				// update remote with my ip
				options1.body = {
					hash: hash,
					ip: myIp,
					deviceId: model.credentials.deviceId,
					port: model.credentials.port
				}
				// once public IP is obtained, update server with public IP
				console.log( "second ping", options1.body )

				rp( options1 )
					.then( ( data ) => {
						// update state
						console.log( "second ping success" )

						model.credentials.publicAddress = myIp;
						model.trigger( 'change:state' ); // signals listeners with updated state!!
						res.send( {
							status: 200,
							message: 'IP updated'
						} )
					} )
					.catch( ( err ) => {
						res.send( {
							status: 500,
							message: 'IP update failed 2',
							request: req.body,
							options: options1,
							error: err
						} )
					} );
			} )
			.catch( ( err ) => {
				console.error( err );
				res.send( {
					status: 500,
					message: 'IP check failed 1',
					request: req.body,
					options: options0,
					error: err
				} )
			} );
	};
}
