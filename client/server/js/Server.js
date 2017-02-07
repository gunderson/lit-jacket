'use strict';
const path = require( 'path' );
const express = require( 'express' );
const socketio = require( 'socket.io' );
const _ = require( 'lodash' );
const log = require( './lib/log' );

const Controller = require( './Controller' );
const AppModel = require( './models/App-Model' );

const SetupSocket = require( './socket' );

// ---------------------------------------------------------
// Middleware includes

// var favicon = require( 'serve-favicon' );
// const browserify = require( 'browserify-middleware' );
const bodyParser = require( 'body-parser' );
const logger = require( 'morgan' );
const multer = require( 'multer' );
const cacheResponseDirective = require( 'express-cache-response-directive' );
const HeaderUtils = require( './lib/HeaderUtils' );

// ---------------------------------------------------------
// Routes

// ---------------------------------------------------------
// Const info

const colormapsPath = path.resolve( __dirname, '../../colormaps/' );

class Server {
	constructor( options ) {
		var app = express();
		var server = require( 'http' )
			.Server( app );
		var io = socketio( server );

		var model = new AppModel(
			_.extend( {},
				options.state, {
					presets: options.presets
				} ),
			_.pick( options, [ 'remotes', 'credentials' ] ) );
		var controller = new Controller( model );

		// ---------------------------------------------------------
		// Middleware

		var upload = multer( {
			storage: multer.diskStorage( {
				destination: ( req, file, cb ) => cb( null, colormapsPath ),
				filename: ( req, file, cb ) => cb( null, `${Date.now()}.${path.extname(file.filename)}` )
			} )
		} );

		app.use( logger( 'dev' ) );
		// app.use( '/js', browserify( __dirname + '/../www/js' ) );
		// parse application/json
		app.use( bodyParser.json() );

		// general response prep
		app.use( cacheResponseDirective() );
		app.use( [
			'/update-remote',
			'/presets',
			'/state'
		], ( req, res, next ) => {
			res.cacheControl( {
				maxAge: 300
			} );
			HeaderUtils.addJSONHeader( res );
			HeaderUtils.addCORSHeader( res );
			next();
		} );

		// ---------------------------------------------------------
		// Sockets

		SetupSocket( io, model );

		// ---------------------------------------------------------
		// Dynamic Routes

		app.get( '/update-remote', require( './routes/update-remote' )( model ) );
		app.get( '/presets', require( './routes/get-presets' ) );
		app.get( '/colormaps', require( './routes/get-colormaps' ) );
		app.get( '/state', require( './routes/get-state' )( model ) );
		app.post( '/state', upload.single( 'colormap' ), require( './routes/post-state' )( model, controller ) );
		// ---------------------------------------------------------
		// Static Routes

		app.use( '/', require( './routes/www' ) );

		// ---------------------------------------------------------
		// Error Handling

		app.use( require( './routes/404' ) );

		// ---------------------------------------------------------
		// Start Server
		server.listen( options.remotes.device.port, function() {} );
	}
}

module.exports = Server;
