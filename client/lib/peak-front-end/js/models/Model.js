const _ = require( 'lodash' );
const $ = require( 'jquery' );

const Base = require( '../Base' );
const Collection = require( '../collections/Collection' );

class Model extends Base {
	constructor( attributes, options ) {
		super( Base.merge( {

			// ---------------------------------------------------
			// Local Properties
			url: '',
			idField: 'id',

			// Whether or not to convert attributes that are collections to a list of model ids rather than saving the complete model
			'toJSONRefs': false,

			// List Attribute names you don't want to save when converting to json
			// useful when you have a property that you want to monitor changes on
			// but that doesn't need to be saved to the server
			'omitAttributes': [],

			// ---------------------------------------------------
			// Event Listeners
			events: [],
			ignoreEvents: [],
			// ---------------------------------------------------
			// Bind functions

			bindFunctions: [
				'addToCollection',
				'destroy',
				'fetch',
				'save',
				'forwardEvent',
				'makeAttribute',
				'removeFromCollection',
				'set'
			]
		}, options ) );

		// ---------------------------------------------------
		// Non-attribute Properties

		this._collections = [];

		// ---------------------------------------------------
		// Record Attributes
		let defaultAttributes = {};
		defaultAttributes[ this.idField ] = _.uniqueId();
		this._attributes = _.extend( defaultAttributes, attributes );

		// ---------------------------------------------------
		// Make Attribute getters & setters

		_.each( this._attributes, this.makeAttribute );
	}

	[ Symbol.iterator ]() {
		return this._attributes.values();
	}

	// ---------------------------------------------------

	fetch() {
		// load stuff in here
		// resolve the deferred when load is complete

		if ( this.url ) {
			// get the data at the url
			return $.get( this.url, {
					id: this[ this.idField ]
				} )
				.then( ( data ) => {
					data = this.parse( data );
					_.each( data, this.makeAttribute );
				} );
		} else {
			// we're all set!
			var deferred = $.Deferred();
			deferred.resolve( this );
			return deferred;
		}
	}

	// ---------------------------------------------------

	parse( data ) {
		return data;
	}

	// ---------------------------------------------------

	save( options = {} ) {
		if ( this.options.url ) {
			// set the data at the url
			return $.ajax( _.defaults( options, {
				type: 'POST',
				url: this.options.url,
				data: JSON.stringify( this.toJSON() ),
				crossDomain: true,
				contentType: 'application/json',
				dataType: 'JSON'
			} ) );
		} else {
			// we're all set!
			var deferred = $.Deferred();
			deferred.resolve( this );
			return deferred;
		}
	}

	// ---------------------------------------------------

	toJSON( justId ) {
		if ( justId ) return this._attributes.id;

		return _( this._attributes )
			.omit( this.options.omitAttributes )
			.cloneDeepWith( ( a ) => {
				// pass toJSONRefs to tell collections that may be children of this model whether to
				// save their children as objects or just IDs that can be picked up as references from a master collection when rebuilding
				if ( a.toJSON ) {
					return a.toJSON( this.options.toJSONRefs );
				};
				if ( this.token ) a.token = this.token;
				return a;
			} );
	}

	// ---------------------------------------------------

	static deRef( sourceCollection, idList ) {
		return new Collection( sourceCollection.get( idList ) );
	}

	// ---------------------------------------------------

	addToCollection( collection, options ) {
		if ( this._collections.indexOf( collection ) === -1 ) {
			this._collections.push( collection );

			// create listeners on collection for attribute changes
			_.each( this._attributes, ( val, key ) => {
				collection.listenTo( this, `change:${key}`, collection.forwardEvent );
			} );

			// only trigger if model is not already a member
			if ( !options.silent ) {
				this.trigger( 'addToCollection', {
					collection: collection,
					model: this
				} );
			}
		}
		return this;
	}

	// ---------------------------------------------------

	removeFromCollection( collection, options ) {
		if ( this._collections.indexOf( collection ) > -1 ) {
			_.remove( this._collections, collection );
			// only trigger if model is a member
			if ( !options.silent ) {
				this.trigger( 'removeFromCollection', {
					collection: collection,
					model: this
				} );
			}
		}
		return this;
	}

	// ---------------------------------------------------

	destroy() {
		this.undelegateEvents();
		this.stopListening();
		_.each( this._collections, ( c ) => {
			// create forwarder on collection for attribute
			c.remove( this );
		} );
		this._collections = [];
		this._attributes = [];
		this.trigger( 'destroy', this );
		return this;
	}

	// ---------------------------------------------------

	makeAttribute( value, name ) {
		let desc = Object.getOwnPropertyDescriptor( this, name );
		if ( desc && desc.get !== undefined ) {
			this[ name ] = value;
			return this;
		}

		// // if it's already defined, just set the new value
		_.each( this._collections, ( c ) => {
			// create forwarder on collection for attribute
			c.listenTo( this, `change:${name}`, c.forwardEvent );
		} );
		Object.defineProperty( this, name, {
			set: ( val ) => {
				// don't trigger a change if the value isn't changed
				if ( _.isEqual( this._attributes[ name ], val ) ) return;
				this._attributes[ name ] = val;
				var event = {
					model: this,
					name: name,
					value: val,
					type: `change:${name} change`
				};
				if ( !this.silent ) this.trigger( event.type, event, val );

				// if it is an emitter, listen for change events
				if ( val && _.isFunction( val.trigger ) ) {
					this.listenTo( val, 'change', this.forwardEvent );
				}
			},
			get: () => this._attributes[ name ]
		} );
		this._attributes[ name ] = value;
		return this;
	}

	// ---------------------------------------------------

	forwardEvent( data ) {
		if ( data.forward === false ) return this;
		if ( this.ignoreEvents.indexOf( data.type ) > -1 ) return this;
		data.parents = data.parents || [];
		data.parents = data.parents || [];
		data.parents.push( this );
		this.trigger( data.type, data, data.value );
		return this;
	}

	// ---------------------------------------------------

	set( data, name ) {
		if ( name ) {
			data = {
				[ name ]: data
			};
		}
		_.each( data, this.makeAttribute );
	}

	// ---------------------------------------------------

	get attributes() {
		return this._attributes;
	}
}
module.exports = Model;
