import path from 'path';
import fs from 'fs-extra';
import Promise from 'bluebird';
import Server from './js/Server';
import complieRecordFiles from './lib/complieRecordFiles';

// prep data
complieRecordFiles( '../data/presets' )
	.then( () => {

		// get data
		const credentials = require( path.resolve( __dirname, '../data/credentials.json' ) );
		const remotes = require( path.resolve( __dirname, '../../data/remotes.json' ) );
		const state = require( path.resolve( __dirname, '../data/state.json' ) );
		const presets = require( path.resolve( __dirname, '../data/presets.json' ) );
		// start server
		const server = new Server( {
			credentials,
			presets,
			state,
			remotes
		} );
	} )
	.catch( ( err ) => console.error( err ) );
