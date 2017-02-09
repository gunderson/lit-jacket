const path = require( 'path' );
const fs = require( 'fs-extra' );
const express = require( 'express' );
const colormapPath = path.resolve( __dirname, '../../' )
module.exports = express.static( colormapPath, {
	fallthrough: true,
	index: false
} );
