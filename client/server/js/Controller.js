const path = require( 'path' );
const fs = require( 'fs' );
const EventEmitter = require( 'events' );
const chalk = require( 'chalk' );
const _ = require( 'lodash' );
const Promise = require( 'bluebird' );
const getPixels = Promise.promisify( require( 'get-pixels' ) );
const Color = require( 'color2' );
const SerialPort = require( 'serialport' );
const Model = require( '../../lib/peak-front-end/js/models/Model' );

let port;

const COMMANDS = {
	RESET: 0,
	TOGGLE_LED: 1,
	DISPLAY_PIXELS: 2,
	SEND_COMPRESSED: 3
}
// ------------------------------------------------------------
// DISPLAY VARS
// ------------------------------------------------------------

// animation
// TODO: move to model
let pixels, pixels1, w, h, pxdepth;
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
let ticksPerSecond = 20;
let millisPerTick = 1000 / ticksPerSecond;
let isPlaying = false;

// colormap

let imagePath = path.resolve( __dirname, '../colormaps/' );
let colormapFileName = 'colormap.png';
let colormapData;
let imageData;

// display

let pixelArrays = [
	new Array( 14 ), // wristLeft
	new Array( 18 ), // sleeveLeft
	new Array( 32 ), // collarLeft
	new Array( 32 ), // collarRight
	new Array( 18 ), // sleeveRight
	new Array( 14 ), // wristRight
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

		setupPromise.then( play )
			.catch( throwError );
	}

	setColor( color ) {
		let c, colorArray;
		if ( color === 'random' ) {
			let h = Math.random() * 360;
			let s = Math.random() * 50 + 50;
			let l = Math.random() * 50 + 50;
			let a = 1;
			c = new Color( {
				h,
				s,
				l,
				a
			} );
			colorArray = c.toArray( 'rgb' )
				.concat( 255 );
		} else {
			c = new Color( color );
			colorArray = c.toArray( 'rgb' )
				.concat( 255 );
		}
		let px = new Uint8Array( 256 * 256 * 4 );
		// make solid color
		for ( var i = 0; i < px.length; i += 4 ) {
			px[ i + 0 ] = colorArray[ 0 ];
			px[ i + 1 ] = colorArray[ 1 ];
			px[ i + 2 ] = colorArray[ 2 ];
			px[ i + 3 ] = colorArray[ 3 ];
		}
		pixels = px;
		pxdepth = 4;
		w = 256;
		h = 256;
		return c.toString( 'keyword' );
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

	toggleLed() {
		sendCommand( COMMANDS.TOGGLE_LED );
	}
}

class Animator {
	constructor( colormapData ) {
		this.pixels = colormapData.data;
		this.w = px.shape[ 0 ];
		this.h = px.shape[ 1 ];
		this.pxdepth = px.shape[ 2 ];
		this.currentRow = 0;
		this.directionX = 1;
		this.directionY = 1;
	}
}

function getPalette( pixelArrays ) {
	let palette = [];
	let index = [];
	for ( var i = 0; i < pixelArrays.length; i++ ) {
		// convert linear pixel stream to vec3s
		let color = pixelArrays[ i ]; // find a matching color
		let colorIndex = _.reduce( palette, ( val, existingColor, ci ) => ( color[ 0 ] === existingColor[ 0 ] && color[ 1 ] === existingColor[ 1 ] && color[ 2 ] === existingColor[ 2 ] ) ? ci : val, -1 );
		// if it doesn't already exist, add it to the color list
		if ( colorIndex === -1 ) {
			palette.push( color );
			colorIndex = palette.length - 1;
		}
		index[ i ] = colorIndex;
	}
	return {
		palette,
		index
	};
}

function getCompressedPaletteMap( palette, maxSize = 256 ) {

	if ( palette.length > maxSize ) {

		// find relative deltas to each unique color

		let colorDeltas = [];
		// for each color
		for ( let i = 0; i < palette.length - 1; i++ ) {
			colorDeltas[ i ] = [];
			// find the delta to each other pixel
			for ( let j = i + 1; i < palette.length; j++ ) {
				colorDeltas[ i ][ j ] = getColorDist( palette[ i ], palette[ j ] );
			}
		}

		// find smallest delta per color (most similar color)
		// for each color
		// find the index of the smallest delta
		let smallestDeltaPerColor = _.map( palette, ( color, i ) => _.min( colorDeltas[ i ] ) );
		let colorOverage = palette.length - maxSize;
		let paletteMap = _.range( palette.length );

		// combine the smallest delta relationsips until palette.length == maxSize
		while ( colorOverage-- ) {
			// find color that currently contains the smallest delta
			let smallestDeltaColorIndex = _.reduce( smallestDeltaPerColor, minIndex, 0 );
			// find the partner color with smallest delta
			let currentColorDeltas = colorDeltas[ smallestDeltaColorIndex ];
			let partnerColorIndex = currentColorDeltas.indexOf( smallestDeltaColorIndex );
			// remove the partner smallest delta result
			smallestDeltaPerColor[ smallestDeltaColorIndex ] = _.min( currentColorDeltas );
			// replace partnerColor with current color in smallest delta list
			smallestDeltaPerColor[ partnerColorIndex ] = smallestDeltaPerColor[ smallestDeltaColorIndex ];
			// for colors up to partner color
			for ( let i = 0; i < partnerColorIndex; i++ ) {
				// replace the partnerColor delta
				colorDeltas[ i ][ partnerColorIndex ] = colorDeltas[ i ][ smallestDeltaColorIndex ];
				// recalculate the min on forward color
				smallestDeltaPerColor[ i ] = _.min( colorDeltas[ i ] );
			}
			paletteMap[ partnerColorIndex ] = smallestDeltaColorIndex;
		}
		return paletteMap;
	}
	return _.range( maxSize );
}
// index against new palette
function indexImageToPalette( pixelArrays, palette ) {
	return _.map( pixelArrays, ( color, i ) => {
		let colorIndex = _.reduce( palette, ( val, existingColor, ci ) => ( color[ 0 ] === existingColor[ 0 ] && color[ 1 ] === existingColor[ 1 ] && color[ 2 ] === existingColor[ 2 ] ) ? ci : val, -1 );
		if ( colorIndex > -1 ) {
			return colorIndex;
		} else {
			throw new Error( "Palette doesn't contain color", color );
		}
	} );
}

// make new pixel array (via index) to match new palette
function remapindicies( colorIndicies, map ) {
	return _.map( colorIndicies, ( index ) => map[ index ] );
}


function minIndex( memoIndex, value, index, array ) {
	return value <= array[ memoIndex ] ? index : memoIndex;
}

function findClosestColor( palette, color, returnIndex = false ) {
	let deltas = _.map( palette, ( palColor ) => getColorDist( palColor, color ) );
	let closestIndex = 0;
	for ( let i = 0; i < deltas.length; i++ ) {
		if ( deltas[ i ] < deltas[ closestIndex ] ) {
			closestIndex = i;
		}
	}
	return returnIndex ? closestIndex : palette[ closestIndex ];
}

function getColorDist( c0, c1 ) {
	let sqrt = Math.sqrt;
	let dr = c1[ 0 ] - c0[ 0 ];
	let dg = c1[ 1 ] - c0[ 1 ];
	let db = c1[ 2 ] - c0[ 2 ];
	return sqrt( ( dr * dr ) + ( dg * dg ) + ( db * db ) );
}

function setupPort() {
	// let portAddress = '/dev/ttyAMA0';
	let portAddress = '/dev/ttyMFD1';
	port = new SerialPort( portAddress, {
		autoOpen: false,
		baudRate: 921600,
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
	let imageRow;
	switch ( model.colormapTileMode ) {
		case 'tile':
			model.positionX = ( model.positionX + model.driftX ) % 1;
			model.positionY = ( model.positionY + model.driftY ) % 1;
			currentRow = Math.floor( model.positionY * 255 );
			imageRow = Array.prototype.slice.call( pixels, w * pxdepth * currentRow, w * pxdepth * ( currentRow + 1 ) );
			break;
		case 'mirror':
			model.positionX = ( ( model.positionX + model.driftX ) % 2 );
			model.positionY = ( ( model.positionY + model.driftY ) % 2 );

			let x = Math.abs( model.positionX ) >= 1 ? model.positionX - 1 : model.positionX;
			let y = Math.abs( model.positionY ) >= 1 ? model.positionY - 1 : model.positionY;

			currentRow = Math.abs( Math.floor( y * 255 ) );
			if ( model.positionY > 1 ) currentRow = 255 - currentRow;
			imageRow = Array.prototype.slice.call( pixels, w * pxdepth * currentRow, w * pxdepth * ( currentRow + 1 ) );
			break;
	}


	pixelArrays = distributePixelData( imageRow, pixelArrays );
	return true;
};

function compressPixelArrays( pixelArrays, maxColors = 64 ) {
	let originalPalette = getPalette( pixelArrays );
	let originalIndex = indexImageToPalette( pixelArrays, originalPalette );
	let compressedPaletteMap = getCompressedPaletteMap( palette, maxColors );
	let compressedIndex = remapIndicies( originalIndex, compressedPaletteMap );
}

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
