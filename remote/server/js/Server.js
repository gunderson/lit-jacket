'use strict';
const path = require( 'path' );
const log = require( './lib/log' );
const express = require( 'express' );
const fs = require( 'fs-extra' );
// const Controller = require( './Controller' );
<<<<<<< HEAD
const credentials = require( './lib/credentials' )
=======
const credentials = require('./lib/credentials')
console.log(credentials)
>>>>>>> afc9c2f3fc2b7d10a4736f861e814242f6f6432c


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
		app.post( '/google-assistant',
			credentials( {
				user: 'sofa-king',
				pass: `'_:zqG(yYj'am-[eIRuDj`,
				realm: 'aura.works'
			} ),
			require( './routes/post-google-assistant' )
		);

		// ---------------------------------------------------------
		// Static Routes
		// app.set('view engine', 'pug')
		// app.set('views', path.join(__dirname, '/../../www/pug/'))
		// app.use( '/', (req, res) => {
		// 	res.render('index')
		// } );
		// app.use( '/', require( './routes/www' ) );
		app.use( express.static( path.join( __dirname, '../../www/dist/' ) ) )

		// ---------------------------------------------------------
		// Error Handling

		app.use( require( './routes/404' ) );

		// ---------------------------------------------------------
		// Start Server
		app.listen( process.env.PORT || remotes.remote.port, function() {
			console.log( 'server started on', process.env.PORT || remotes.remote.port );
		} );


		if ( process.env.NODE_ENV === 'production' ) {
			var https = require( 'https' );
			var sslRoot = '/etc/letsencrypt/live/aura.works/'
			var key = fs.readFileSync( sslRoot + 'privkey.pem', 'utf8' );
			var cert = fs.readFileSync( sslRoot + 'cert.pem', 'utf8' );
			var httpsServer = https.createServer( { key, cert }, app );
			httpsServer.listen( 443 );
		}
	}
}

module.exports = Server;
