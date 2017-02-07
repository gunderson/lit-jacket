module.exports = {
	addJSONHeader: function( res ) {
		res.setHeader( 'content-type', 'application/json' );
		return res;
	},
	addCORSHeader: function( res ) {
		res.setHeader( 'Access-Control-Allow-Origin', '*' );
		res.setHeader( 'Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS' );
		res.setHeader( 'Access-Control-Allow-Headers', 'Content-Type' );
		return res;
	},
	// when: unix epoch timestamp
	// if isrelative is included then when is seconds from now
	addExpiresHeader: function( res, when, isrelative ) {
		if ( isrelative === true ) {
			when += Date.now();
		}
		res.setHeader( 'Expires', new Date( when )
			.toUTCString() );
		return res;
	}
};
