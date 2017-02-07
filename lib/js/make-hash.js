const crypto = require( 'crypto' );
const bluebird = require( 'bluebird' );
const hash = crypto.createHash( 'sha256' );

export default function makeHash( ip, deviceName, secret ) {
	let salted = Array.prototype.join.apply( this, arguments );
	hash.update( salted );
	return hash.digest( 'hex' );
}