'use strict';
const path = require( 'path' );
const log = require( './lib/log' );
const express = require( 'express' );
// const Controller = require( './Controller' );

// ---------------------------------------------------------
// Middleware includes

// var favicon = require( 'serve-favicon' );
const bodyParser = require( 'body-parser' );
const logger = require( 'morgan' );
const cacheResponseDirective = require( 'express-cache-response-directive' );
const HeaderUtils = require( './lib/HeaderUtils' );

class Server {
	constructor( options ) {
		var remotes = options.remotes;
		var app = express();
		// var controller = new Controller();

		// ---------------------------------------------------------
		// Middleware


		app.use( logger( 'dev' ) );

		// parse application/json
		app.use( bodyParser.json() );

		// general response prep
		app.use( cacheResponseDirective() );
		app.use( '/*', ( req, res, next ) => {
			res.cacheControl( {
				maxAge: 300
			} );
			HeaderUtils.addJSONHeader( res );
			HeaderUtils.addCORSHeader( res );
			next();
		} );

		// ---------------------------------------------------------
		// Sockets


		// ---------------------------------------------------------
		// Dynamic Routes

		app.get( '/device/:deviceId', require( './routes/device' ) );
		app.get( '/ip', require( './routes/get-ip' ) );
		app.post( '/ip', require( './routes/post-ip' ) );

		// ---------------------------------------------------------
		// Static Routes

		app.use( '/', require( './routes/www' ) );

		// ---------------------------------------------------------
		// Error Handling

		app.use( require( './routes/404' ) );

		// ---------------------------------------------------------
		// Start Server
		app.listen( process.env.PORT || 3000, function() {} );
		// app.listen( 80, function() {} );
	}
}

module.exports = Server;
