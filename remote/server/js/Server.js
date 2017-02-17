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

		app.get( '/device/:deviceId', require( './routes/get-device' ) );
		app.get( '/ip', require( './routes/get-ip' ) );
		app.post( '/ip', require( './routes/post-ip' ) );
		app.post( '/google-assistant', require( './routes/post-google-assistant' ) );
		app.post( '/git-hook', require( './routes/post-git-hook' ) );

		// ---------------------------------------------------------
		// Static Routes
		// app.set('view engine', 'pug')
		// app.set('views', path.join(__dirname, '/../../www/pug/'))
		// app.use( '/', (req, res) => {
		// 	res.render('index')
		// } );
		// app.use( '/', require( './routes/www' ) );
		app.use(express.static( path.join(__dirname, '../../www/dist/') ))

		// ---------------------------------------------------------
		// Error Handling

		app.use( require( './routes/404' ) );

		// ---------------------------------------------------------
		// Start Server
		app.listen( process.env.PORT || remotes.remote.port, function() {
			console.log( 'server started on', process.env.PORT || remotes.remote.port );
		} );
	}
}

module.exports = Server;
