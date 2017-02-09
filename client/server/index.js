const path = require( 'path' );
const fs = require( 'fs-extra' );
const Promise = require( 'bluebird' );
const Server = require( './js/Server' );
const compileRecordFiles = require( './js/lib/compileRecordFiles' );

// prep data
compileRecordFiles( '../data/presets' )
	.then( () => {

		// get data
		const credentials = require( path.resolve( __dirname, '../data/credentials.json' ) );
		const remotes = require( path.resolve( __dirname, '../../data/remotes.json' ) );
		// start server
		const server = new Server( {
			credentials,
			remotes
		} );
	} )
	.catch( ( err ) => console.error( err ) );
