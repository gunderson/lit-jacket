const path = require( 'path' );
const fs = require( 'fs' );
const EventEmitter = require( 'events' );
const chalk = require( 'chalk' );
const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
const getPixels = Promise.promisify( require( 'get-pixels' ) );
const SerialPort = require( 'serialport' );

let port;

const COMMANDS = {
	RESET: 0,
	TOGGLE_LED: 1,
	DISPLAY_PIXELS: 2
}
// ------------------------------------------------------------
// DISPLAY VARS
// ------------------------------------------------------------

// animation
// TODO: move to model
let pixels, w, h, pxdepth;
let currentRow = 0;
let positionX = 0;
let positionY = 0;
let driftX = 0;
let driftY = 1;
let colormapScaleX = 1;
let colormapScaleY = 1;

// animation player
// TODO: move to model
let elapsedTime = 0;
let lastTickTime = 0;
let tickCount = 0;
let tickTimeout = null;
let ticksPerSecond = 60;
let millisPerTick = 1000 / ticksPerSecond;
let isPlaying = false;

// colormap

let imagePath = path.resolve( __dirname, '../image-cache/' );
let colormapFileName = 'colormap.png';
let colormapData;
let imageData;

// display

let pixelArrays = [
	new Array( 5 ), // wristLeft
	new Array( 5 ), // sleeveLeft
	new Array( 5 ), // collarLeft
	new Array( 5 ), // collarRight
	new Array( 5 ), // sleeveRight
	new Array( 5 ), // wristRight
];

// ------------------------------------------------------------
// SETUP
// ------------------------------------------------------------

class Controller extends EventEmitter {
	constructor( model ) {
		let setupPromise = Promise.all( [
			setupPort(),
			setColormap( path.join( imagePath, colormapFileName ) )
		] );

		port.open();

		return setupPromise.then( play )
			.catch( throwError );
	}

	setColormap( file ) {
		setColormap.apply( this, arguments );
	}

	get pixels() {
		return pixelArrays;
	}

	play() {
		play();
	}

	stop() {
		stop();
	}

	reset() {
		reset();
	}
}

function setupPort() {
	port = new SerialPort( '/dev/ttyAMA0', {
		autoOpen: false,
		baudRate: 3000000,
		dataBits: 8,
		parity: 'none',
		stopBits: 1,
	} );
	port.on = Promise.promisify( port.on );
	port.on( 'error' )
		.catch( ( err ) => console.error( 'Error: ', err.message ) )
	return port.on( 'open' );
}

function setColormap() {
	return getPixels.apply( this, arguments )
		.then( ( px ) => {
			colormapData = px;
			pixels = px.data;
			w = px.shape[ 0 ];
			h = px.shape[ 1 ];
			pxdepth = px.shape[ 2 ];
		} );
}

// ------------------------------------------------------------
// PLAYBACK
// ------------------------------------------------------------

function play() {
	if ( isPlaying ) return;
	isPlaying = true;
	lastTickTime = Date.now();
	_tick();
}

function stop() {
	isPlaying = false;
}

function reset() {
	stop();
	currentRow = 0;
	positionX = 0;
	positionY = 0;
	elapsedTime = 0;
	driftX = Math.abs( driftX );
	driftY = Math.abs( driftY );
}

function _tick() {
	if ( !isPlaying ) return;
	now = Date.now();
	elapsedTime += now - lastTickTime;
	lastTickTime = now;
	tickCount = Math.round( elapsedTime / millisPerTick );
	let millisToNextTick = ( tickCount + 1 ) * millisPerTick - elapsedTime
	if ( update() && draw() ) {
		tickTimeout = setTimeout( _tick, millisToNextTick );
	}
};

function update() {
	if ( !colormapData ) {
		return false;
	}
	let imageRow = Array.prototype.slice.call( pixels, w * pxdepth * currentRow, w * pxdepth * ( currentRow + 1 ) );
	pixelArrays = distributePixelData( imageRow, pixelArrays );
	currentRow += floatY;

	// bounce floatation
	if ( currentRow >= h - 1 || currentRow <= 0 ) floatY *= -1;
	return true;
};

function draw() {
	if ( !colormapData ) return false;
	let dataBuffer = _.flattenDeep( pixelArrays );
	sendCommand( COMMANDS.DISPLAY_PIXELS, dataBuffer );
	return true;
};

function distributePixelData( imageRow, pixelArrays ) {
	let totalPixels = _.reduce( pixelArrays, ( m, a, i ) => m + a.length, 0 );
	let sampleScale = ( imageRow.length / pxdepth ) / totalPixels;
	let sampled = new Array( totalPixels );
	let pxIndex = -1;
	while ( ++pxIndex <= totalPixels ) {
		let col = Math.floor( sampleScale * pxIndex ) * pxdepth;
		sampled[ pxIndex ] = imageRow.slice( col, col + 3 );
	}
	pxIndex = 0;
	_.each( pixelArrays, ( a, i ) => {
		pixelArrays[ i ] = sampled.slice( pxIndex, pxIndex + a.length );
		pxIndex += a.length;
	} );
	return pixelArrays;
}

// ------------------------------------------------------------
// COMMUNICATION
// ------------------------------------------------------------

function sendCommand( cmd, dataBuffer = [] ) {
	let cmdBuffer = Buffer.alloc( dataBuffer.length + 1 );
	cmdBuffer[ 0 ] = cmd;
	// unshift the command into the array
	for ( let i = 0; i < dataBuffer.length; i++ ) {
		cmdBuffer[ i + 1 ] = dataBuffer[ i ];
	}

	let deferred = defer();
	port.write( cmdBuffer, ( err ) => {
		if ( err ) deferred.reject( err );
		deferred.resolve( cmdBuffer );
	} );
	return deferred.promise;
}

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

function defer() {
	let resolve, reject,
		promise = new Promise( ( _resolve, _reject ) => {
			resolve = _resolve;
			reject = _reject;
		} );
	return {
		promise,
		resolve,
		reject
	};
}

function throwError( err ) {
	throw new Error( err );
}

// ------------------------------------------------------------
// MODULIZE
// ------------------------------------------------------------

module.exports = Controller;
