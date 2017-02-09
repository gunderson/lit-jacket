const path = require( 'path' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );

module.exports = ( model ) => function route( req, res ) {
	return res.send( {
		status: 200,
		presets: model.presets
	} )
}
