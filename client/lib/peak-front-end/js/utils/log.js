var _ = require( 'lodash' );
var chalk = require( 'chalk' );

module.exports = function log() {
	var ts = '[' + chalk.gray( getTimestamp() ) + ']';
	var args = Array.prototype.slice.apply( arguments );
	args.unshift( ts );
	if ( log.prototype.silent ) return args;
	return console.log.apply( console, args );
}

function getTimestamp() {
	var date = new Date();
	var tz = date.toLocaleTimeString( 'en-us', {
			timeZoneName: 'short'
		} )
		.split( ' ' )[ 2 ];
	var h = _.padStart( date.getHours(), 2, '0' );
	var i = _.padStart( date.getMinutes(), 2, '0' );
	var s = _.padStart( date.getSeconds(), 2, '0' );
	var ml = _.padStart( date.getMilliseconds(), 4, '0' );

	return `${tz} ${h}:${i}:${s}.${ml}`;
}

log.prototype.silent = false;
