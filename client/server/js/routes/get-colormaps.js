const path = require( 'path' );
const Promise = require( 'bluebird' );
const fs = Promise.promisifyAll( require( 'fs-extra' ) );
const colormapListPath = path.join( '../../../data/colormaps.json' );

module.exports = function route( req, res ) {
	return fs.readFileAsync( colormapListPath, 'utf-8' )
		.then( ( contents ) => {
			res.send( {
				status: 200,
				colormaps: JSON.parse( contents )
			} )
		} )
}
