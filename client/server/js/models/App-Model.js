const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );
const path = require( 'path' );
const PNG = require( 'pngjs' )
	.PNG;
const compileRecordFiles = require( '../lib/compileRecordFiles' );
const Model = require( '../../../lib/peak-front-end/js/models/Model' );

const dataPath = path.resolve( __dirname, '../../../data/' );
const statePath = path.resolve( dataPath, 'state.json' );
const stateAttributes = require( statePath );
const presetPath = path.resolve( dataPath, 'presets/' );
const colormapsPath = path.resolve( __dirname, '../../colormaps/' );

const state = require( statePath );
// const presets = require( presetsPath );
// const colormaps = require( colormapsPath );
class AppModel extends Model {
	constructor( attributes, options ) {
		super(
			Model.merge( state, attributes ),
			Model.merge( {
				url: 'http://localhost/state',
				events: [ {
					target: 'this',
					eventName: 'change:presetName',
					handler: 'onChangePresetName'
				} ],
				bindFunctions: [
					'onChangePresetName'
				]
			}, options )
		);
		this.delegateEvents();
	}
	loadState() {
		return readJSON( statePath )
			.then( ( state ) => {
				_.extend( this, state );
				return this;
			} );
	}
	saveState() {
		return writeJSON( statePath, this.toJSON() );
	}
	onChangePresetName( event, val ) {
		let preset = this.presets[ val ];
		console.log( 'preapply', this.colormapName );
		if ( preset ) {
			this.incoming = false;
			_.extend( this, preset );
		}
		console.log( '-------', this.colormapName )
	}

	savePreset( data ) {
		let presetData = _.omit( this.toJSON(), [ 'colors', 'colormaps', 'presets', 'positionX', 'positionY', 'localAddress' ] )
		// presetData.presetName = data.presetName;
		// create preset file
		let filename = path.join( presetPath, `${data.presetName}.json` );
		return writeJSON( filename, presetData )

			.then( () => {
				this.presets[ data.presetName ] = presetData;
				this.saveState();
			} )
			// recompile preset list
			.then( () => compileRecordFiles( presetPath ) )
			.catch( ( err ) => console.error( err ) );
	}

	saveColormap( colormapData ) {
		let deferred = defer();
		let filename = path.resolve( colormapsPath, `${colormapData.name}.png` );
		let colormapDataPath = path.resolve( dataPath, 'colormaps.json' );
		// save file to disk
		let buffer = Buffer.from( colormapData.data );
		let png = new PNG( {
			width: colormapData.width,
			height: colormapData.height,
			inputHasAlpha: true
		} );
		png.on( 'error', ( err ) => {
			deferred.reject( err );
			console.error( err );
		} );

		png.data = buffer;

		let stream = fs.createWriteStream( filename );
		png.pack()
			.pipe( stream );

		stream.on( 'close', () => {
			// # We're done !!
			// update model colormap info
			this.colormaps[ colormapData.name ] = path.basename( filename );
			this.colormapName = colormapData.name;
			// save updated list to disk
			return this.saveState()
				.then( deferred.resolve )
				.catch( ( err ) => {
					deferred.reject( err );
					console.error( err );
				} );
		} );
		return deferred.promise;
	}
}

function defer() {
	let resolve,
		reject,
		promise = new Promise( ( _res, _rej ) => {
			resolve = _res;
			reject = _rej;
		} );
	return {
		promise,
		resolve,
		reject
	};
}

function readJSON( path ) {
	return fs.readFileAsync( path, 'utf-8' )
		.then( ( str ) => JSON.parse( str ) );
}

function writeJSON( path, data ) {
	return fs.writeFileAsync( path, JSON.stringify( data ), {
		encoding: 'utf-8'
	} );
}
module.exports = AppModel;
