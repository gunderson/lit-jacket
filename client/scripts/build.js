const path = require( 'path' );
const fs = require( 'fs-extra' );
const Promise = require( 'bluebird' );
const log = require( '../lib/log' );
import * as rollup from 'rollup';
import * as pug from 'pug';
import * as sass from 'sass';

// ------------------------------------------------
// BUILD WWW
// ------------------------------------------------

const dest = '../www/dist/';

// compile sass

// compile pug

// rollup + babel