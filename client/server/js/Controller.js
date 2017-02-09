const path = require( 'path' );
const fs = require( 'fs' );
const EventEmitter = require( 'events' );
const chalk = require( 'chalk' );
const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
const getPixels = Promise.promisify( require( 'get-pixels' ) );
const SerialPort = require( 'serialport' );
const Model = require( '../../lib/peak-front-end/js/models/Model' );

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
let directionX = 1;
let directionY = 1;
// let positionX = 0;
// let positionY = 0;
// let driftX = 0;
// let driftY = 1;
// let colormapScaleX = 1;
// let colormapScaleY = 1;

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

let imagePath = path.resolve( __dirname, '../colormaps/' );
let colormapFileName = 'colormap.png';
let colormapData;
let imageData;

// display

let pixelArrays = [
	new Array( 10 ), // wristLeft
	new Array( 20 ), // sleeveLeft
	new Array( 30 ), // collarLeft
	new Array( 30 ), // collarRight
	new Array( 20 ), // sleeveRight
	new Array( 10 ), // wristRight
];

// ------------------------------------------------------------
// SETUP
// ------------------------------------------------------------

let model;

class Controller {
	constructor( dataModel ) {
		model = dataModel;

		model.on( 'play', this.play );
		model.on( 'pause', this.pause );
		model.on( 'reset', this.reset );
		model.on( 'change:colormapName', ( event, val ) => {
			setColormap( path.join( imagePath, model.colormaps[ model.colormapName ] ) )
		} );


		let setupPromise = Promise.all( [
			setupPort(),
			setColormap( path.join( imagePath, model.colormaps[ model.colormapName ] ) )
		] );

		port.open();

		return setupPromise.then( play )
			.catch( throwError );
	}

	setColormap( file ) {
		return setColormap.apply( this, arguments );
	}

	get pixels() {
		return pixelArrays;
	}

	play() {
		play();
	}

	pause() {
		pause();
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
	console.log( "setColormap", arguments );
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

function pause() {
	isPlaying = false;
}

function reset() {
	pause();
	currentRow = 0;
	model.positionY = 0;
	model.positionX = 0;
	model.elapsedTime = 0;
	model.driftX = Math.abs( model.driftX );
	model.driftY = Math.abs( model.driftY );
}

function _tick() {
	if ( !isPlaying ) return;
	now = Date.now();
	model.elapsedTime += now - lastTickTime;
	lastTickTime = now;
	tickCount = Math.round( model.elapsedTime / millisPerTick );
	let millisToNextTick = ( ( tickCount + 1 ) * millisPerTick ) - model.elapsedTime;
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
	currentRow += model.driftY * directionY;
	model.positionX += model.driftX;
	model.positionY += model.driftY;
	// bounce floatation
	if ( currentRow >= h - 2 || currentRow <= 0 ) directionY *= -1;
	return true;
};

function draw() {
	if ( !colormapData ) return false;
	let dataBuffer = _.flattenDeep( pixelArrays );
	model.colors = dataBuffer;
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
	if ( !port.isOpen() ) return;
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
