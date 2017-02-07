const path = require( 'path' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );
const listPath = path.join( '../../../data/presets.json' );

module.exports = function route( req, res ) {
	return fs.readFileAsync( listPath, 'utf-8' )
		.then( ( contents ) => {
			res.send( {
				status: 200,
				colormaps: JSON.parse( contents )
			} )
		} )
}
