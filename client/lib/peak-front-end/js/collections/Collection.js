const _ = require( 'lodash' );
const $ = require( 'jquery' );

const Base = require( '../Base' );
const Model = require( '../models/Model' );

module.exports = class Collection extends Base {
	constructor( models, options ) {
		// make models array optional
		if ( !_.isArray( models ) && typeof models === 'object' && typeof options === 'undefined' ) {
			options = models;
			models = [];
		}
		super( _.mergeWith( {
			model: Model,
			url: null,
			idField: 'id',
			ignoreEvents: [],
			bindFunctions: [
				'reset',
				'get',
				'set',
				'add',
				'remove',
				'empty',
				'parse',
				'fetch',
				'getRefs',
				'forwardEvent',
				'toJSON'
			]
		}, options, Base.mergeRules ) );

		this.sort = this.getLocalObject( this.sort );

		this._models = [];
		this.reset( models, {
			silent: true
		} );
	}

	// ---------------------------------------------------

	[ Symbol.iterator ]() {
		return this._models.values();
	}

	// ---------------------------------------------------

	reset( models, options ) {
		options = options || {};
		// kill existing models
		this.empty();
		// create new models
		_.each( models, ( m ) => this.add( m, options ) );
		if ( !options.silent ) {
			this.trigger( 'reset', this );
		}
		return this;
	}

	// ---------------------------------------------------

	set( models, options ) {
		options = options || {};
		if ( options.reset === true ) this.empty();
		models = _.isArray( models ) ? models : [ models ];
		_.each( models, ( attributes ) => {
			var found = this.get( attributes.id );
			if ( found[ 0 ] ) {
				// if the model exists, update it's attributes
				_.extend( found[ 0 ], attributes );
			} else {
				// otherwise, add it
				this.add( attributes );
			}

		} );
		return this;
	}

	// ---------------------------------------------------

	add( models, options ) {
		options = options || {};
		// if models isn't an array, make it one
		models = _.isArray( models ) ? models : [ models ];
		var updated = _.map( models, ( attributes ) => {
			// create new models
			if ( attributes[ this.idField ] ) {
				var existingModels = this.get( attributes[ this.idField ] );
				if ( existingModels.length ) {
					if ( options.merge ) {
						// update other model
						existingModels[ 0 ].set( attributes );
						// we're done here
						return existingModels;
					} else {
						// remove other model
						this.remove( existingModels[ 0 ] );
					}
				}
			} else {
				// create a unique id
				attributes[ this.idField ] = _.uniqueId();
			}
			// create new model
			let Model = this.model;
			var m = new Model( attributes );

			// register in list only once
			// already check above to see if it exists
			this._models.push( m );
			// tell the model it's a member here
			m.addToCollection( this, options );
			// listen to them
			this.listenTo( m, 'change', this.forwardEvent );
			if ( !options.silent ) {
				this.trigger( 'add', m );
			}

			return m;
		} );
		// sort the models
		if ( this.sort ) {
			this._models = this._models.sort( this.sort );
			updated = updated.sort( this.sort );
		}
		return updated;
	}

	// ---------------------------------------------------

	remove( models, options ) {
		options = options || {};
		// if models isn't an array, make it one
		// create an internal copy of the models array to iterate on
		models = _.isArray( models ) ? models.slice() : [ models ];
		_.each( models, ( model ) => {
			// allow ids to be passed
			if ( typeof model !== 'object' ) {
				model = this.get( model );
			}
			var index = this._models.indexOf( model );

			if ( index > -1 ) {
				this.stopListening( model );
				this._models.splice( index, 1 );
				model.removeFromCollection( this, options );
				if ( !options.silent ) {
					this.trigger( 'remove', {
						collection: this,
						model: model
					} );
				}
			} else {
				console.error( 'couldnt find model', model );
			}
		} );
		return this;
	}

	// ---------------------------------------------------

	empty( options ) {
		this.remove( this._models, options );
	}

	// ---------------------------------------------------

	get( matchConditions ) {
		// make sure match conditions is an array
		matchConditions = _.isArray( matchConditions ) ? matchConditions : [ matchConditions ];

		// an array of objects is assumed to be a list of match condition objects
		// an array of non-objects is assumed to be a list of ids
		if ( typeof matchConditions[ 0 ] !== 'object' ) {
			// convert to match condition objects
			matchConditions = _.map( matchConditions, ( _id ) => {
				let cond = {};
				cond[ this.idField ] = _id;
				return cond;
			} );
		}

		var models = _.chain( matchConditions )
			// for each condition, find a list of models that matches
			.map( ( condition ) => {
				return _.filter( this._models, condition );
			} )
			.flatten()
			// only include models once in list
			.uniq()
			.value();
		return models;
	}

	// ---------------------------------------------------

	at( index ) {
		return this._models[ Math.abs( index % this.length ) ];
	}

	// ---------------------------------------------------

	fetch( options ) {
		options = _.defaults( options, {
			reset: true,
			merge: false,
			parse: this.parse,
			url: this.url,
			query: this.query
		} );
		// default fetch action is to replace from json api

		if ( options.url ) {
			// get the data at the url
			return $.get( options.url, options.query )
				.then( options.reset ? ( data ) => this.reset( options.parse( data ), options ) :
					( data ) => _.each( options.parse( data ),
						options.merge ? this.add :
						this.set
					) );
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

	forwardEvent( data ) {
		if ( data.forward === false ) return this;
		if ( this.ignoreEvents.indexOf( data.type ) > -1 ) return this;
		data.parents = data.parents || [];
		data.parents.push( this );
		this.trigger( data.type, data, data.value );
		return this;
	}

	// ---------------------------------------------------

	toJSON( refs ) {
		return _.map( this._models, ( m ) => m.toJSON( refs ) );
	}

	// ---------------------------------------------------

	getRefs() {
		return _.map( this._models, ( m ) => m.id );
	}

	// ---------------------------------------------------

	// TODO: create wrapped convenience accessor functions from lodash

	map( fn ) {
		return _.map( this.models, fn );
	}

	each( fn ) {
		_.each( this.models, fn );
		return this;
	}

	where( fn ) {
		return _.filter( this.models, fn );
	}

	find( fn ) {
		return _.find( this.models, fn );
	}

	filter( fn ) {
		return _.filter( this.models, fn );
	}

	reduce( fn, init ) {
		return _.reduce( this.models, fn, init );
	}

	// ---------------------------------------------------

	get length() {
		return this._models.length;
	}

	get models() {
		return this._models;
	}

	// ---------------------------------------------------

	set sortBy( attr ) {
		this._options.sort = ( a, b ) => b[ attr ] - a[ attr ];
		return attr;
	}

}
