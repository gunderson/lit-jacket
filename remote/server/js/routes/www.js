const path = require( 'path' );
const Promise = require( 'bluebird' );
const express = require( 'express' );

const route = ( req, res ) => {

};

module.exports = express.static( '../../../www/dist/' );
