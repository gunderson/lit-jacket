// var five = require( 'johnny-five' );
// var Raspi = require( 'raspi-io' );
const Promise = require( 'bluebird' );
const SerialPort = require( 'serialport' );
const port = new SerialPort( '/dev/ttyAMA0', {
	// autoOpen: false,
	baudRate: 3000000,
	dataBits: 8,
	parity: 'none',
	stopBits: 1,
} );
const emptyBuffer = Buffer.from( [] );
let loopTimeout = null;

port.on( 'open', function( err ) {
	if ( err ) throw new Error( err );
	loop( 1000 );
	// sendCommand( 0, Buffer.from( [
	// 		255, 0, 0,
	// 		0, 255, 0
	// 	] ) )
	// 	.catch( ( err ) => {
	// 		throw new Error( err );
	// 	} );
} );

// open errors will be emitted as an error event
port.on( 'error', function( err ) {
	console.log( 'Error: ', err.message );
} )

function loop( frameDelay = 1000 ) {
	loopTimeout = setTimeout( () => {
		sendCommand( 1 )
			.then( ( cmdBuffer ) => {
				console.log( cmdBuffer );
			} )
			.catch( ( err ) => {
				throw new Error( err );
			} );
		loop( frameDelay );
	}, frameDelay );
}

function sendCommand( cmd, dataBuffer = emptyBuffer ) {
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
