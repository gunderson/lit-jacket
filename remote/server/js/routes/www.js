const path = require( 'path' );
const Promise = require( 'bluebird' );
const express = require( 'express' );

module.exports = express.static( path.resolve( __dirname, '../../../www/dist/' ) );
