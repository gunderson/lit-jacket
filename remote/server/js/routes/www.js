const path = require( 'path' );
const Promise = require( 'bluebird' );
const express = require( 'express' );

const route = ( req, res ) => {

};

export default express.static( '../../../www/dist/' );
