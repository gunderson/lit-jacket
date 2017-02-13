var _ = require( 'lodash' );
var $ = require( 'jquery' );
var io = require( 'socket.io-client' );
var Model = require( './Model' );

class SocketModel extends Model {
	constructor( attributes, options ) {
		super( Model.merge( {
				// default attributes
			}, attributes ),
			Model.merge( {
				events: [ {
					target: 'socket',
					eventName: 'sync',
					handler: 'onSync'
				} ],
				bindFunctions: [
					'sync',
					'onSync',
					'connect',
					'onConnect'
				]
			}, options )
		);

		// ---------------------------------------------------
		// Local Properties
	}

	sync() {
		this.socket.emit( 'sync', this.toJSON() );
	}

	onSync( data ) {
		this.silent = true;
		_.each( data, ( val, key ) => this[ key ] = val );
		this.silent = false;
	}

	connect() {
		this.socket = io( this.url );
		this.socket.on( 'connect', this.onConnect );
	}
	onConnect() {
		_.each( this._attributes, ( val, name ) => {

			this.on( `change:${name}`, ( data ) => {
				if ( this.incoming ) return;
				this.socket.emit( `change:${name}`, data )
			} );
			this.socket.on( `change:${name}`, ( data ) => {
				this.incoming = true;
				this[ name ] = data.value;
				this.incoming = false;
			} )
		} );
		this.trigger( 'connect' );
	}
}
module.exports = SocketModel;
