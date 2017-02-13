var _ = require( 'lodash' );
var $ = require( 'jquery' );
var TweenLite = require( 'gsap/src/uncompressed/TweenLite' );
var CSSPlugin = require( 'gsap/src/uncompressed/plugins/CSSPlugin' );
var Easing = require( 'gsap/src/uncompressed/easing/EasePack' );
import Page from './Page';

var PAGE_TRANSITION_DURATION = 1.5;

export default class GridPage extends Page {
	constructor( options ) {
		super( Page.merge( {

			// ---------------------------------------------------
			// Class Properties

			name: '',

			// ---------------------------------------------------
			// Local Properties

			col: 0,
			row: 0,
			page: null,
			layerAnimationOffset: 0.25,

			// ---------------------------------------------------
			// Event Listeners

			events: [],
			bindFunctions: []
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

	transitionIn( prev ) {
		this.$( '.cover' )
			.on( 'mousewheel', function( e ) {
				e.preventDefault();
			} );

		this.$el.addClass( 'active' );
		this.$el.find( '>.content' )
			.scrollTop( 0 );

		this.$el.show();
		this.onResize();

		if ( !prev ) {
			// console.log('No Previous Page');
			TweenLite.to( this.$( '.cover' ), 0, {
				autoAlpha: 0
			} );
			this.trigger( 'transitionInComplete' );
			return this;
		}

		// hide the cover
		TweenLite.fromTo( this.$( '.cover' ), PAGE_TRANSITION_DURATION, {
			autoAlpha: 1
		}, {
			autoAlpha: 0,
			ease: Easing.Power4.easeOut,
			overwrite: true
		} );

		var startX = 0,
			startY = 0;

		if ( this.col < prev.col ) {
			startX = '-100';
			// this.app.media.playSound( 'page-forward' );
		} else if ( this.col > prev.col ) {
			startX = '100';
			// this.app.media.playSound( 'page-back' );
		} else if ( this.row < prev.row ) {
			startY = '100';
		} else if ( this.row > prev.row ) {
			startY = '-100';
		}

		// animate page layer
		TweenLite.fromTo( this.$el, PAGE_TRANSITION_DURATION, {
			display: 'block',
			x: startX + '%',
			y: startY + '%'
		}, {
			x: '0%',
			y: '0%',
			ease: Easing.Power4.easeOut,
			onComplete: () => {
				this.$el.css( {
					transform: ''
				} );
				this.trigger( 'transitionInComplete' );
			},
			overwrite: true
		} );

		// animate content layer
		console.log( 'Page::transitionIn', this.$( '> .content' ) );
		TweenLite.fromTo( this.$( '> .content' ), PAGE_TRANSITION_DURATION, {
			x: ( startX * this.layerAnimationOffset ) + '%',
			y: ( startY * this.layerAnimationOffset ) + '%'
		}, {
			x: '0%',
			y: '0%',
			ease: Easing.Power4.easeOut,
			overwrite: true
		} );

		return [ startX, startY ];
	}

	transitionOut( next ) {
		this.$el.removeClass( 'active' );
		this.$( '.cover' )
			.off( 'mousewheel' );
		TweenLite.fromTo( this.$( '.cover' ), PAGE_TRANSITION_DURATION, {
			autoAlpha: 0
		}, {
			autoAlpha: 1,
			ease: Easing.Power4.easeOut,
			overwrite: true
		} );

		var endX = 0,
			endY = 0;

		// transition out to the right by default
		if ( !next || this.col > next.col ) {
			endX = '100';
		} else if ( this.col < next.col ) {
			endX = '-100';
		} else if ( this.row < next.row ) {
			endY = '100';
		} else if ( this.row > next.row ) {
			endY = '-100';
		}

		// animate page layer
		TweenLite.fromTo( this.$el, PAGE_TRANSITION_DURATION, {
			// display: 'block',
			x: '0%',
			y: '0%'
		}, {
			x: endX + '%',
			y: endY + '%',
			ease: Easing.Power4.easeOut,
			onComplete: () => {
				this.$el.hide();
				this.trigger( 'transitionOutComplete' );
			},
			overwrite: true
		} );

		// animate content layer
		TweenLite.fromTo( this.$el.find( '> .content' ), PAGE_TRANSITION_DURATION, {
			// display: 'block',
			x: '0%',
			y: '0%'
		}, {
			x: ( endX * this.layerAnimationOffset ) + '%',
			y: ( endY * this.layerAnimationOffset ) + '%',
			ease: Easing.Power4.easeOut,
			overwrite: true
		} );

		return [ endX, endY ];
	}

	transitionInComplete() {}

	transitionOutComplete() {

		this.$el.css( {
			transform: ''
		} );
		this.$el.find( '>.content' )
			.scrollTop( 0 );

		this.$( '.cover' )
			.off( 'mousewheel' );
	}
}
