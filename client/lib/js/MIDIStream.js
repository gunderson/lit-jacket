// binary chunk format: <type 4 bytes><length 4 bytes><data length bytes>
const MIDI_BAUD = 31620;
const MIDI_CODE = {
	TICK: 0xf8,
	FILE_SIGNATURE: splitStringToBytes( 'MThd' ),
	ALL_CALL: 0x7f,
	TRACK: splitStringToBytes( 'MTtk' ),
	GLOBAL_BROADCAST: 0x7f,
	SYSEX_START: 0xf0,
	SYSEX_END: 0xf7,
	ESCAPE: 0xf7,
	TIME_STATUS: 0xf1,
	TIME_CODE: 0x01,
	FULL_TIME_CODE_MESSAGE: 0x01
}

function parseDataPacket( packet ) {
	return {
		type: packet[ 0 ],
		length: packet[ 1 ],
		data: packet.slice( 2 )
	}
}

function makeDataPacket( data = [] ) {
	let typeByte = 0xf7;
	if ( data.length > 253 ) {
		throw new Error( "MIDI data packets cannot contain more than 253 bytes. You tried to send: " + data.length );
	}
	let dataBytes = data;
	return [ typeByte, data.length ].concat( dataBytes );
}

function makeTimeCodeMessage( time, frameRate, qfIndex = -1 ) {
	let h = Math.floor( time / ( 24 * 60 * 60 * 1000 ) );
	let m = Math.floor( ( time / ( 60 * 60 * 1000 ) ) % 60 );
	let s = Math.floor( ( time / ( 60 * 1000 ) ) % 60 );
	let f = Math.floor( ( time / ( 1000 / frameRate ) ) % frameRate );
	let MC = MIDI_CODE;
	let message;
	// frameRate types: 0 = 24fps, 1 = 25fps, 2 = 30fps, 3 = 30fps non-drop
	let frameRateTypes = [ 24, 25, 30, 30 ];
	let data = ( frameRateTypes.indexOf( frameRate ) ) << 29 | h << 24 | m << 16 | s << 8 | f;
	if ( qfIndex === -1 ) {
		message = [
			MC.SYSEX_START,
			MC.GLOBAL_BROADCAST, // command
			MC.ALL_CALL, // device ID
			1,
			1,
			data >> 24,
			( data >> 16 ) & 0xff,
			( data >> 8 ) & 0xff,
			data & 0xff,
			MC.SYSEX_END
		];
	} else {
		message = [
			MC.TIME_STATUS,
			qfIndex << 4 | ( ( data >> ( qfIndex * 4 ) ) & 0xf )
		];
	}
	return message;
}

function combineBytes( byteArray ) {
	return byteArray.reduce( ( memo, byte, i, arr ) => byte << ( ( arr.length - ( i + 1 ) ) * 8 ), 0 );
}

function splitIntToBytes( int, numBytes = 4 ) {
	let bytePosition = numBytes * 8;
	while ( bytePosition -= 8 ) {
		bytes.push( ( int >> bytePosition ) & 0xff );
	}
	bytes.push( int & 0xff );
	return bytes;
}

function splitStringToBytes( str ) {
	return str.split( '' )
		.map( ( c ) => c.charCodeAt( 0 ) );
}
