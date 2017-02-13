const _ = require( 'lodash' );
const $ = require( 'jquery' );
const Events = require( 'backbone-events-standalone' );

class Base {
	constructor( options ) {
		this.options = Base.merge( {
			// ---------------------------------------------------
			// Event Listeners

			events: [],

			// ---------------------------------------------------
			// Function Scope Binding

			bindFunctions: [
				'getLocalObject',
				'makeBoundFunctions',
				'delegateEvents',
				'undelegateEvents'
			]
		}, options );
		_.extend( this, this.options );
		this.makeBoundFunctions( this.options.bindFunctions, this );
	}

	// ---------------------------------------------------
	// Bind functions named in the 'bindFunctions' hash
	makeBoundFunctions( funcNames, context ) {
		context = context || this;
		_.each( funcNames, ( funcName ) => {
			if ( !context[ funcName ] ) {
				console.error( `You tried to bind "${funcName}", but it doesn't exist on `, context );
			}
			context[ funcName ] = context[ funcName ].bind( context );
		} );
		return context;
	}

	// ---------------------------------------------------

	delegateEvents() {
		_( this.options.events )
			.each( ( e ) => {

				let handler = this.getLocalObject( e.handler );
				let target = this.getLocalObject( e.target );

				// use jquery for ui events
				if ( target instanceof $ ) {
					target.on( e.eventName, handler );
				} else {
					// use backbone for all other events
					this.listenTo( target, e.eventName, handler );
				}
			} );
		return this;
	}

	// ---------------------------------------------------

	undelegateEvents() {
		_( this.options.events )
			.each( ( e ) => {
				// check to see if event has been delegated
				if ( typeof e.target === 'string' ) return;
				let target = this.getLocalObject( e.target );
				if ( target instanceof $ ) {
					target.off( e.eventName );
				} else {
					this.stopListening( target, e.eventName );
				}
			} );
		return this;
	}

	// ---------------------------------------------------

	getLocalObject( name ) {
		if ( name === 'this' ) {
			return this;
		} else if ( typeof name === 'string' ) {
			// try to resolve the name as an object on this
			var target = this[ name ];
			// var target = _.get( this, name );

			// if there is no object on this with that name, try to find it as selector in the a local jquery object
			if ( !target && this.$ ) target = this.$( name );

			// consider it a global selector and use jquery to find it
			if ( !target || ( target instanceof $ && target.length === 0 ) ) {
				target = $( name );
			}

			// Shaka. When the walls fell
			if ( !target || ( target instanceof $ && target.length === 0 ) ) {
				console.warn( `Peak was unable to delegate event to ${name} on ${this.name}` );
			}

			return target;
		} else if ( typeof name === 'object' ) {
			if ( typeof name.on === 'function' ) {
				target = name;
			} else {
				// last ditch effort to catch window/document events;
				target = $( name );
			}
			return target;
		}

		return name;
	}

	// ---------------------------------------------------

	static merge( ...opts ) {
		opts.push( Base.mergeRules );
		return _.mergeWith.apply( this, opts );
	}

	// ---------------------------------------------------

	static mergeRules( objValue, srcValue ) {
		if ( _.isArray( objValue ) ) {
			return objValue.concat( srcValue );
		} else if ( typeof srcValue === 'string' || typeof srcValue === 'function' ) {
			return srcValue;
		} else if ( objValue && typeof objValue === 'object' && typeof srcValue === 'object' ) {
			return _.extend( {}, objValue, srcValue );
		}
		return srcValue;
	}
}
Base.prototype.templates = [];
Events.mixin( Base.prototype );
module.exports = Base;
