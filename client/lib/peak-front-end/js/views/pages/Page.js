var _ = require( 'lodash' );
var $ = require( 'jquery' );
import View from '../View';

export default class Page extends View {
	constructor( options ) {
		super( View.merge( {

			// ---------------------------------------------------
			// Class Properties

			name: '',
			type: 'page',

			// ---------------------------------------------------
			// Local Properties

			// ---------------------------------------------------
			// Event Listeners

			events: [ {
				target: 'this',
				eventName: 'transitionInComplete',
				handler: 'transitionInComplete'
			}, {
				target: 'this',
				eventName: 'transitionOutComplete',
				handler: 'transitionOutComplete'
			} ],
			bindFunctions: [
				'fetch',
				'onRoute',
				'transitionIn',
				'transitionOut',
				'transitionInComplete',
				'transitionOutComplete'
			]
		}, options ) );
	}

	// ---------------------------------------------------

	loadAssets() {
		var deferred = $.Deferred();
		// load stuff in here
		// resolve the deferred when load is complete
		deferred.resolve();
		return deferred.promise();
	}

	// ---------------------------------------------------

	parseName( options ) {
		if ( options.name ) {
			if ( !options.el ) this.el = options.el = '#' + options.name;
		}
		return options;
	}

	// ---------------------------------------------------

	fetch( params, promise ) {

		promise = promise || $.Deferred();

		var recallFetch = () => {
			this.fetch( params, promise );
			return promise;
		};

		var fetchModel = () => {
			console.log( this.name + ' fetching the model' );
			this.loadPromise = this.model.fetch()
				.done( recallFetch );
		};

		var renderView = () => {
			console.log( this.name + ' render' );
			this.render();
			recallFetch();
		};

		var loadAssets = () => {
			console.log( this.name + ' waiting for load' );
			this.trigger( 'loadStart', {
				type: this.type,
				id: this.route
			} );

			this.loadAssets();
			this.loadPromise
				.then( recallFetch );
		};

		var finishRender = () => {
			// console.log( this );
			console.log( this.name + ' finished fetching view' );
			if ( this.loadPromise ) {
				console.log( this.name, 'loadpromise state:', this.loadPromise.state() );
			}
			_.defer( function() {
				promise.resolve();
			} );
			this.trigger( 'fetchComplete', this );
			this.trigger( 'loadComplete', {
				type: 'page',
				id: this.name
			} );
		};

		// first load the model if there is one
		// TODO Reenable loading the model if needed
		if ( false && this.model && this.model.url ) {
			fetchModel();
			// then render
		} else if ( !this.hasRendered ) {
			renderView();
			// then wait for the components to load
		} else if ( this.loadPromise && this.loadPromise.state() === 'pending' ) {
			loadAssets();
			// then you're good to go
		} else {
			finishRender();
		}

		return promise;

	}

	onRoute( route ) {
		var prevRoute = route.prevRoute;

		var currentPage = this.page;
		var newPage = null;

		// console.log( this, route, prevRoute );

		// only change pages if new base-route is different from the last
		if ( route.parts.length > 0 && route.parts[ 0 ] !== prevRoute.parts[ 0 ] ) {

			// remove the old page
			$( 'html' )
				.removeClass( prevRoute.parts[ 0 ] + '-page' );

			if ( route ) {
				$( 'html' )
					.addClass( route.parts[ 0 ] + '-page' );

				// determine new page
				newPage = _.find( this.views, {
					name: route.parts[ 0 ]
				} );
			}

			// if the route doesn't match any pages, do nothing
			if ( !newPage ) return;

			newPage.fetch( route )
				.done( () => {
					this.trigger( 'loadEnd' );

					if ( currentPage ) {
						currentPage.transitionOut( newPage );
					}

					var subRoute = _.cloneDeep( route );
					subRoute.parts.slice( 1 );
					subRoute.prevRoute.parts.slice( 1 );

					newPage.transitionIn( currentPage, subRoute );

					if ( subRoute.parts.length > 0 ) {
						// this means it's a sub-route, recurse child pages
						newPage.onRoute( subRoute );
					}
				} );

			this.page = newPage;
		} else if ( route.parts.length === 0 && currentPage ) {
			// currentPage.transitionOut();

		} else if ( route.parts.length > 0 && currentPage ) {
			// it's probably a sub-page
			// tell the current page to display the new info
			currentPage.onRoute( route );
		}
	}

	clearSubPage() {

	}

	transitionIn() {
		var deferred = $.Deferred();
		this.trigger( 'transitionIn' );
		this.$el.show( {
			complete: deferred.resolve
		} );
		return deferred.promise()
			.then( this.transitionInComplete );
	}

	transitionOut() {
		var deferred = $.Deferred();
		// override me
		this.trigger( 'transitionOut' );
		this.$el.hide( {
			complete: deferred.resolve
		} );
		return deferred.promise()
			.then( this.transitionOutComplete );
	}

	transitionInComplete() {
		// override me
		this.trigger( 'transitionInComplete' );
	}

	transitionOutComplete() {
		// override me
		this.trigger( 'transitionOutComplete' );
	}
}
