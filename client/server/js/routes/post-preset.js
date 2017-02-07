const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );
const compileRecordFiles = require( '../lib/compileRecordFiles' );

const presetsPath = '../../../data/presets/';

var route = ( model ) => ( req, res ) => {
	let preset = req.body;
	// save preset
	return fs.writeFileAsync( path.join( presetsPath, preset.name, '.json' ), JSON.stringify( preset ), {
			mode: 'utf-8'
		} )
		.then( () => {
			compileRecordFiles( presetsPath );
		} )
		.then( () => {
			model.presets[ preset.name ] = preset;
			res.send( {
				status: 200,
				message: 'successfully created preset',
			} );

		} )
		.catch( ( err ) => {
			res.send( {
				status: 500,
				message: 'preset creation failed',
				error: err
			} );

		} );
};

module.exports = route;
