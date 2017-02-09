const path = require( 'path' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );

module.exports = ( model ) => function route( req, res ) {
	model.presetName = req.params.presetName;
	return res.send( {
		status: 200,
		message: `preset set to ${req.params.presetName}`
	} )
}
