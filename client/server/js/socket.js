const _ = require( 'lodash' );
const path = require( 'path' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );
const BackboneEvents = require( 'backbone-events-standalone' );
const compileRecordFiles = require( './lib/compileRecordFiles' );

const dataPath = path.resolve( '../../data/' );
const presetPath = path.resolve( dataPath, 'presets/' );
const colormapsPath = path.resolve( '../colormaps/' );

module.exports = function socket( io, model ) {
	return io.on( 'connection', ( socket ) => {
		// BackboneEvents.mixin( socket );

		socket.on( 'subscribe:sensor', ( eventName ) => {
			switch ( eventName ) {
				case 'mic':
					model.on( 'change:mic', ( event ) => socket.emit( `change:${name}`, event.val ) );
					break;
				case 'motion':
					model.on( 'change:motion', ( event ) => socket.emit( `change:${name}`, event.val ) );
					break;
			}
		} );

		socket.on( 'create:preset', ( data ) => {
			// create preset file
			let filename = path.join( presetPath, `${data.name}.json` );
			return fs.writeFileAsync( filename, JSON.stringify( data ), {
					encoding: 'utf-8'
				} )
				// create preset in model
				.then( () => {
					model.presets[ data.name ] = data;


				} )
				// recompile preset list
				.then( () => compileRecordFiles( presetPath ) )
				.catch( ( err ) => console.error( err ) );
		} );

		socket.on( 'create:colormap', ( data ) => {
			let filename = path.resolve( colormapsPath, data.name );
			let colormapDataPath = path.resolve( dataPath, 'colormaps.json' );
			// save file to disk
			return fs.writeFileAsync( filename, data.buffer )
				// read current colormaps list
				.then( () => fs.readFileAsync( colormapDataPath, 'utf-8' ) )
				// add to colormaps list
				.then( ( contents ) => {
					let colormaps = JSON.parse( contents );
					colormaps[ data.name ] = path.basename( filename );
					// update model colormaps
					model.colormaps[ data.name ] = colormaps[ data.name ];
					return colormaps;
				} )
				// save updated list to disk
				.then( ( colormaps ) => fs.writeFileAsync( colormapDataPath, JSON.stringify( colormaps, null, '\t' ) ) )
				.catch( ( err ) => console.error( err ) );
		} );

		// for all attributes
		_.each( model.attributes, ( val, name ) => {
			socket.on( `change:${name}`, ( event ) => {
				model[ event.name ] = event.value;
			} );
			// FIXME: Memory leak here
			model.on( `change:${name}`, ( event ) => socket.emit( `change:${name}`, _.pick( event, [ 'name', 'value' ] ) ) );
		} )

		socket.on( 'disconnect', () => {
			// stop listening
			// socket.stopListening();
		} );

		socket.emit( 'state', model.toJSON() );
	} )
}
