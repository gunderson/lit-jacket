const path = require( 'path' );
const express = require( 'express' );

module.exports = express.static( '../www/dist/' );
