const path = require( 'path' )
const Server = require( './js/Server' )

// // get data
const remotes = require( path.resolve( __dirname, '../../data/remotes.json' ) );

// start server
const server = new Server( {
	remotes
} );
