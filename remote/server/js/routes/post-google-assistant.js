const _ = require( 'lodash' );
const path = require( 'path' );
const rp = require( 'request-promise' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );
const makeHash = require( '../../../lib/js/make-hash' );
const colornames = require( '../../../../data/colornames.json' );
const SendJSON = require( '../lib/SendJSON' );

const route = ( io ) => ( req, res ) => {
	let data = req.body || {};
	let colorname = "",
		colorSpeech;
	switch ( data.result.action ) {
		case "select_aura":
			let names = _.keys( colornames );
			// choose random color
			colorname = names[ Math.floor( Math.random() * names.length ) ];
			colorSpeech = parseColorname( colorname );
			// respond to assisitant
			SendJSON( res, {
				status: 200,
				message: 'received successfully forwarded to device',
				speech: `Your aura appears to be ${colorSpeech}`,
				displayText: `Your aura appears to be ${colorSpeech}`,
			} );
			// set jacket color
			io.broadcast( 'setColor', colorname.toLowerCase() );
			break;
		case "change_color":
			colorname = data.result.parameters.color;
			colorSpeech = parseColorname( colorname );
			// respond to assisitant
			SendJSON( res, {
				status: 200,
				message: 'received successfully forwarded to device',
				speech: `The Oracle is set to ${colorSpeech}`,
				displayText: `The Oracle is set to ${colorSpeech}`,
			} );
			io.broadcast( 'setColor', colorname.toLowerCase() );
			break;
	}

	// for sending direct requests
	// this method was abandoned because on an artificial deadline
	// instead of an efficient restful method, we leave open sockets, as above
	/*
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
					uri: 'http://' + path.join( `${device.address}:${device.port}`, 'color', 'random' ),
					headers: {
						'User-Agent': 'Google-Assistant'
					},
					data: data,
					followAllRedirects: true,
					json: true // Automatically parses the JSON string in the response
				};
				// forward command to device
				return rp( options )
					.then( ( ret ) => {
						console.log( ret );
						res.send( {
							status: 200,
							message: 'received successfully forwarded to device',
							speech: `Your color is ${ret.color}`,
							displayText: `Your color is ${ret.color}`,
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
	*/

}

function parseColorname( colorname ) {
	return _.chain( colorname )
		.snakecase()
		.replace( '_', ' ' )
		.value();
}

module.exports = route;
