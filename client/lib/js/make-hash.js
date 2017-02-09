const crypto = require( 'crypto' );

module.exports = function makeHash( ip, deviceName, secret ) {
	let hash = crypto.createHash( 'sha256' );
	let salted = Array.prototype.join.apply( this, arguments );
	hash.update( salted );
	return hash.digest( 'hex' );
}
