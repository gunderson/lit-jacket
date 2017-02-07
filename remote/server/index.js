import path from 'path';
import fs from 'fs-extra';
import Server from './js/Server';

// get data
const remotes = require( path.resolve( __dirname, '../../lib/remotes.json' ) );

// start server
const server = new Server( {
	remotes
} );
