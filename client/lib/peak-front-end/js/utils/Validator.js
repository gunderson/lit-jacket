function validate( data, type, minLength, maxLength ) {
	// TODO: allow type to be a string that acts as a global type
	if ( typeof type === 'string' ) {
		return validate( data, type );
	}
	let invalid = [];
	for ( let key in data ) {
		invalid.push( validateItem( data[ key ], type[ key ], key, minLength, maxLength ) );
	}
	return invalid;
}

function validateItem( data, type, key, minLength, maxLength ) {
	// any piece of data that doesn't have an expectation is deemed not invalid
	if ( type === undefined ) return [];
	if ( minLength && data.length < minLength ) {
		return [ {
			code: 0,
			key: key,
			message: `${key} needs to be at least ${minLength} characters.`
		} ];
	}
	if ( maxLength && data.length < minLength ) {
		return [ {
			code: 0,
			key: key,
			message: `${key} cannot be longer than ${maxLength} characters.`
		} ];
	}
	return validateType[ type ]( data, key );
}

var validateType = {
	true: ( data, key ) => {
		key = key || 'data';
		let invalid = [];
		if ( !data ) {
			invalid.push( {
				code: 0,
				key: key,
				message: `${key} needs true`
			} );
		}
		return invalid;
	},
	false: ( data, key ) => {
		key = key || 'data';
		let invalid = [];
		if ( data ) {
			invalid.push( {
				code: 0,
				key: key,
				message: `${key} needs to be false`
			} );
		}
		return invalid;
	},
	array: ( data, key ) => {
		key = key || 'data';
		let invalid = [];
		if ( !Array.isArray( data ) ) {
			invalid.push( {
				code: 0,
				key: key,
				message: `${key} needs to be an Array`
			} );
		}
		return invalid;
	},
	string: ( data, key ) => {
		key = key || 'data';
		let invalid = [];
		// TODO: run through naughty word filter
		return invalid;
	},
	email: ( data, key ) => {
		key = key || 'data';
		let invalid = [];
		// run through email validator
		let parts = data.split( '@' );
		if ( parts.length < 2 ) {
			// no @ sign
			invalid.push( {
				code: 0,
				key: key,
				data: data,
				message: 'Invalid Email Address.'
			} );
			return invalid;
		}
		parts = parts[ 1 ].split( '.' );
		if ( parts.length < 2 ) {
			// no dot
			invalid.push( {
				code: 0,
				key: key,
				data: data,
				message: 'Invalid Email Address'
			} );
		}
		return invalid;
	},
	zip: ( data, key ) => {
		key = key || 'data';
		let invalid = [];
		if ( !parseInt( data ) ) {
			invalid.push( {
				code: 0,
				key: key,
				data: data,
				message: `${key} needs to be a number`
			} );
		}
		if ( parseInt( data ) < 10000 ) {
			invalid.push( {
				code: 1,
				key: key,
				data: data,
				message: `${key} needs at least 5 digits`
			} );
		}
		return invalid;
	}
};

module.exports = {
	validate,
	validateItem
};
