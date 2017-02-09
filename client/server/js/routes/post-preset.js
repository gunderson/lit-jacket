const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );
const compileRecordFiles = require( '../lib/compileRecordFiles' );

const presetsPath = '../../../data/presets/';

var route = ( model ) => ( req, res ) => {
	let preset = req.body;
	// save preset
	return model.savePreset( preset )
		.then( () => {
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
