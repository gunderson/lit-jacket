var _ = require( 'lodash' );
var $ = require( 'jquery' );
var Base = require( '../Base' );

class View extends Base {
	constructor( options ) {
		super( Base.merge( {
			// ---------------------------------------------------
			// Local Properties

			el: undefined,
			model: undefined,
			template: '',
			id: '',
			tagname: 'div',
			classname: '',
			keep: false,
			insert: true,
			domUpdates: [],
			// hasRendered: false,
			loadPromise: undefined,
			parentView: undefined,
			hasRendered: false,

			// ---------------------------------------------------
			// Child Views

			views: {
				/*
					'childView0': new ChildView0({
						el: '#child-id-0',
						model: this.model.widgets.at(0)
					}),
					'childView1': new ChildView1({
						el: '#child-id-1',
						model: this.model.widgets.at(1)
					}), ...
				*/
			},

			// ---------------------------------------------------
			// Event Listeners

			events: [ {
				target: 'APP',
				eventName: 'resize',
				handler: 'onResize'
			} ],

			// ---------------------------------------------------
			// Data Binding

			dataBindings: [
				/*
				{
					element: '.selector',
					attributeName: 'attr',
					model: 'model',
					elementChangeEventName: 'change',
					mode: 'get' || 'send'
				}
				*/
			],

			// ---------------------------------------------------
			// Function Scope Binding

			bindFunctions: [
				'bindData',
				'unbindData',
				'delegateEvents',
				'createDataBinding',
				'destroy',
				'undelegateEvents',
				'updateDOM',
				'render',
				'setupElement',
				'onResize',
				'beforeRender',
				'afterRender'
			]
		}, options ) );

		// ---------------------------------------------------
		// Finish setup

		this.parseName( this.options );
		this.dates = [];
	}

	// ---------------------------------------------------

	static getTemplate( name ) {
		// TEMPLATES is a global object on window
		return name ? Base.prototype.templates[ name ] : () => '';
	}

	// ---------------------------------------------------

	parseName( options ) {
		if ( options.name ) {
			if ( !options.el ) this.el = options.el = '.' + options.name;
		}
		return options;
	}

	// ---------------------------------------------------

	getView( name ) {
		return _.find( this.views, {
			name: name
		} );
	}

	// ---------------------------------------------------

	onResize() {
		// override me
	}

	// ---------------------------------------------------

	beforeRender() {
		// override me

	}

	// ---------------------------------------------------

	afterRender() {
		// override me
	}

	// ---------------------------------------------------

	setupElement() {
		// use a template if defined
		// only render it if it hasn't been rendered before && it's not marked for keeping
		if ( !this.hasRendered || !this.keep ) {

			if ( this.el ) {
				// try to find it locally
				this.el = this.parentView.$( this.el )
					.first()[ 0 ] ||
					// try to find it globally
					$( this.el )
					.first()[ 0 ] ||
					// create one
					$( `<${this.tagname} class='${this.classname}' id='${this.id}' />` )
					.first()[ 0 ];
				this.$el = $( this.el );
			}

			if ( this.template ) {
				let $prev, $next;
				if ( this.$el && this.$el.parent() ) {
					$prev = this.$el.prev();
					$next = this.$el.next();
					this.$el.remove();
					this.insert = true;
				}

				var templateFn = View.getTemplate( this.template );
				if ( !templateFn ) {
					console.warn( `PEAK: Could not find template named ${this.template}.` );
				}
				var html = templateFn( this.serialize() );
				this.$el = $( html );
				// if it was already in the view, attempt to put the new element where the old one was
				if ( this.insert ) {
					if ( $prev && $prev.length ) {
						$prev.after( this.$el );
					} else if ( $prev && $next.length ) {
						$next.before( this.$el );
					} else {
						this.parentView.$el.append( this.$el );
					}
				}
			}
			// save the primary element
			this.el = this.$el[ 0 ];
			// setup helper find function
			this.$ = this.$el.find.bind( this.$el );
		}
		return this.$el;
	}

	// ---------------------------------------------------

	render( parentView ) {
		this.parentView = parentView instanceof View ? parentView : this.parentView || window;
		this.undelegateEvents();
		this.unbindData();
		this.setupElement();
		this.beforeRender();
		this.trigger( 'beforeRender', this );

		// render child views
		_.each( this.views, ( v ) => v.render( this ) );

		this.delegateEvents();
		this.bindData();
		this.afterRender();
		this.trigger( 'afterRender', this );
		this.onResize();
		this.hasRendered = true;
	}

	// ---------------------------------------------------
	// bind the value of an HTMLElement to a model or collection

	createDataBinding( hash ) {
		let attributeName = hash.attributeName;
		let element = hash.element;
		let model = hash.model;
		let elementChangeEventName = hash.elementChangeEventName || 'change';
		let mode = hash.mode;
		// TODO document get/setElementData
		let setElementData = this.getLocalObject( hash.setElementData );
		let getElementData = this.getLocalObject( hash.getElementData );

		// parse argument options
		let $element = this.getLocalObject( element );
		model = typeof model === 'string' ? this[ model ] : this.model || model;

		// FIXME: Add in special handling for checkboxes

		// hack to handle radio button groups
		let isRadio = $element.attr( 'type' ) === 'radio';
		// handle <input>s differently than regular elements
		let updateMethod = $element.is( 'input, select' ) ? 'val' : 'text';

		// set listeners
		if ( mode !== 'send' ) this.listenTo( model, `change:${attributeName}`, updateElement ) && updateElement.call( this, {
			value: model[ attributeName ],
			model: model
		} );
		if ( mode !== 'get' ) $element.on( elementChangeEventName, updateModel );

		// assign a destroy function for convenient destruction
		hash.unbindData = unbindData.bind( hash );

		return hash;

		function updateElement( event ) {
			var val = event.value;
			let fn = setElementData ? () => setElementData( val, $element ) : () => $element[ updateMethod ]( [ val ], $element );
			this.domUpdates.push( fn );
			if ( !this.domUpdateRequest ) {
				this.domUpdateRequest = requestAnimationFrame( this.updateDOM );
			}
		}

		function updateModel( event ) {
			let $activeEl = !isRadio ? $element : $element.filter( ':checked' );
			model[ attributeName ] = ( getElementData && getElementData( $activeEl ) ) || $activeEl.val();
		}

		function unbindData() {
			this.stopListening( model, `change:${attributeName}`, updateElement );
			$element.off( elementChangeEventName, updateModel );
			delete hash.unbindData;
		}
	}

	// ---------------------------------------------------

	bindData() {
		_.each( this.dataBindings, this.createDataBinding );
		return this;
	}

	// ---------------------------------------------------

	unbindData() {
		_.each( this.dataBindings, ( hash ) => hash.unbindData && hash.unbindData() );
		return this;
	}

	// ---------------------------------------------------
	// batch DOM updates

	updateDOM() {
		this.domUpdateRequest = null;
		this.domUpdates.forEach( ( fn ) => {
			fn();
		} );
		this.domUpdates = [];
	}

	// ---------------------------------------------------

	delegateEvents() {
		// FIXME: this is a pass-through to translate old code from using selector to use target
		_( this.options.events )
			.filter( ( e ) => e.selector )
			.each( ( e ) => {
				e.target = e.selector;
			} );
		super.delegateEvents();
		return this;
	}

	// ---------------------------------------------------

	undelegateEvents() {
		_( this.options.events )
			.filter( ( e ) => e.selector )
			.each( ( e ) => {
				e.target = e.selector;
			} );
		super.undelegateEvents();
		return this;
	}

	// ---------------------------------------------------

	destroy() {
		this.unbindData();
		this.undelegateEvents();
		this.stopListening();
		_.each( this.views, ( v ) => v.destroy() );
	}

	// ---------------------------------------------------

	serialize() {
		var model = this.model ? this.model.attributes : {};
		return _.extend( {
			// "this.ENV" is a prototype property of all Base objects
			env: this.ENV
		}, model );
	}

	// ---------------------------------------------------

	$( selector ) {
		return this.$el ? this.$el.find( selector ) : $( selector );
	}

	// ---------------------------------------------------

	static mergeRules( objValue, srcValue ) {
		if ( _.isArray( objValue ) ) {
			if ( objValue.length && objValue[ 0 ] instanceof View ) return objValue;
			return objValue.concat( srcValue );
		}
	}
}
module.exports = View;
