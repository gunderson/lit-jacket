const _ = require( 'lodash' );
const path = require( 'path' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );

function compileRecordFiles( srcPath, destPath, compilationName ) {
	srcPath = path.join( srcPath, '/' );
	// as a default compilationName use src folder name
	compilationName = compilationName || srcPath.split( '/' )
		.slice( -2, -1 )[ 0 ];
	destPath = destPath || path.join( srcPath, '..', compilationName + '.json' )
	let fileList;

	return listFiles( srcPath )
		.then( ( _fileList ) => {
			fileList = _fileList;
			return fileList
		} )
		.then( ( fileList ) =>
			fileList.map( ( filename ) => fs.readFileAsync( path.join( srcPath, filename ), 'utf-8' ) )
		)
		.then( ( filePromises ) => Promise.all( filePromises ) )
		.then( ( fileData ) => {
			// write dest
			let recordNames = fileList.map( ( filename ) => path.basename( filename, '.json' ) );
			let dataset = {};
			_.each( fileData, ( data, index ) => {
				dataset[ recordNames[ index ] ] = JSON.parse( data );
			} )
			return fs.writeFileAsync( destPath, JSON.stringify( dataset, null, '\t' ), {
				encoding: 'utf-8'
			} );
		} )
		.catch( ( err ) => console.error( err ) );
}

function listFiles( dir ) {
	return fs
		.readdirAsync( dir )
		.then( ( files ) => files.filter( ( file ) => !fs
			.statSync( path.join( dir, file ) )
			.isDirectory() ) );
}

module.exports = compileRecordFiles;
