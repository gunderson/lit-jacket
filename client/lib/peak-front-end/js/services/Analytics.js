var _ = require( 'lodash' );
var $ = require( 'jquery' );
var log = require( '../utils/log' );

var GA_ACCOUNTS = [
	"UA-xxxxxxxx-1"
];
var GTM_ACCOUNT = "GTM-xxxxxx";
var OMNNITURE_IDS = {
	pageid: '',
	pagesite: ''
};

var GoogleAnalytics = function( document, window ) {
	var _this = this;
	this.accountLabels = [];
	this.accountIds = [];
	this.accounts = {};
	this.setAccounts = function( accounts ) {
		_this.accountIds = accounts;
		_.each( accounts, function( accountId, i ) {
			// make a unique alphabetical label for each account
			var label = String.fromCharCode( 97 + i );
			_this.accounts[ label ] = accountId;
			_setAccount = [ label + "._setAccount", accountId ];
			window._gaq.push( _setAccount );
		} );
		return this;
	};
	this.trackPageview = function( args ) {
		_.each( _this.accounts, function( accountId, label ) {
			var _trackPageview = [ label + "._trackPageview" ];
			if ( args[ 0 ] ) _trackPageview.push( args[ 0 ] );
			window._gaq.push( _trackPageview );
		} );
		return this;
	};
	this.trackEvent = function( args ) {
		_.each( _this.accounts, function( accountId, label ) {
			var _trackEvent = [ label + "._trackEvent" ];
			window._gaq.push( ( _trackEvent.concat( args ) ) );
		} );
		return this;
	};
	// Add the GA tag to stage
	( function() {
		window._gaq = [];
		window._gaq.push( [ '_setDomainName', 'none' ] );
		var ga = document.createElement( 'script' );
		ga.type = 'text/javascript';
		ga.async = true;
		ga.src = ( 'https:' == document.location.protocol ? 'https://ssl' : 'http://www' ) + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName( 'script' )[ 0 ];
		s.parentNode.insertBefore( ga, s );
		ga.onload = function() {
			var gaqpush = _gaq.push;
			window._gaq.push = function( args ) {
				log( "\n***************************************************" );
				log( "google analytics: ", args.join( " | " ) );
				log( "***************************************************\n" );
				// RL.warn("google analytics: ", args.join( " | " ));
				gaqpush( args );
			};
		};
	} )();

	// STOCK ANALYTICS.JS IMPLEMENTATION
	( function( i, s, o, g, r, a, m ) {
		i[ 'GoogleAnalyticsObject' ] = r;

		i[ r ] = i[ r ] || function() {
				(
					i[ r ].q = i[ r ].q || [] )
				.push( arguments );
			},
			i[ r ].l = 1 * new Date();
		a = s.createElement( o ),
			m = s.getElementsByTagName( o )[ 0 ];
		a.async = 1;
		a.src = g;
		m.parentNode.insertBefore( a, m );
	} )( window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga' );

	ga( 'create', 'UA-XXXX-Y', 'auto' ); // Replace with your property ID.
	ga( 'send', 'pageview' );

	return this;
};

var GoogleTagManager = function( document, window ) {
	this.id = null;
	var _this = this;
	this.init = function( id ) {
		this.id = id || "a";
		( function( w, d, s, l, i ) {
			w[ l ] = w[ l ] || [];
			w[ l ].push( {
				'gtm.start': new Date()
					.getTime(),
				event: 'gtm.js'
			} );
			var f = d.getElementsByTagName( s )[ 0 ],
				j = d.createElement( s ),
				dl = l != 'dataLayer' ? '&l=' + l : '';
			j.async = true;
			j.src = '//www.googletagmanager.com/gtm.js?id=' + i + dl;
			f.parentNode.insertBefore( j, f );
		} )( window, document, 'script', 'dataLayer', id );
		return this;
	};
	this.trackPageview = function( data ) {

		return this;
	};
	this.trackEvent = function( data ) {
		window.dataLayer.push( data );
		return this;
	};
	return this;
};

var Omniture = function( $ ) {
	this.trackPageview = function() {};
	this.trackEvent = function() {};
	// Add the Omniture tag to stage
	$( 'body' )
		.append( $( `<script src="/js/crm/engine.js" id="crmEngine" vlp="false" pageid="${OMNNITURE_IDS.pageid}" pagelocale="en" pagesite="${OMNNITURE_IDS.pagesite}"/>` ) );
	return this;
};

var trackers = {};
var initialized = false;

export default class Analytics {
	static init( options ) {
		if ( initialized ) {
			log( 'Analytics already initialized' );
			return this;
		}
		GA_ACCOUNTS = options.GA_ACCOUNTS || GA_ACCOUNTS;
		GTM_ACCOUNT = options.GTM_ACCOUNT || GTM_ACCOUNT;
		OMNNITURE_IDS = options.OMNNITURE_IDS || OMNNITURE_IDS;
		// console.log("Tracking."+"init()", arguments);
		// trackers.ga = new GoogleAnalytics(document, window);
		trackers.gtm = new GoogleTagManager( document, window );
		// trackers.o = new Omniture($)
		// window.env == "dev" ? id += "2" : id += "1";
		// trackers.ga.setAccounts(GA_ACCOUNTS);
		trackers.gtm.init( GTM_ACCOUNT );
		Analytics.trackPageview();
		initialized = true;
	}
	static trackPageview( data ) {
		_.each( this.trackers, function( tracker ) {
			tracker.trackPageview( data );
		} );
		Analytics.report( data );
		return this;
	}
	static trackEvent( data ) {
		_.each( this.trackers, function( tracker ) {
			try {
				tracker.trackEvent( data );
			} catch ( e ) {}
		} );
		Analytics.report( data );
		return this;
	}
	static report( data ) {
		log( '-- Tracking Report', data );
		return this;
	}
};
