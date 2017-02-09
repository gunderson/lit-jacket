const _ = require( 'lodash' );

module.exports = function socket( io, model ) {
	return io.on( 'connection', ( socket ) => {
		socket.on( 'subscribe:mic', () => model.on( 'change:mic', ( event ) => socket.emit( `change:${event.name}`, event.val ) ) );
		socket.on( 'subscribe:motion', () => model.on( 'change:motion', ( event ) => socket.emit( `change:${event.name}`, event.val ) ) );

		socket.on( 'create:preset', ( data ) => model.savePreset( data )
			.then( () => socket.emit( 'state', model.toJSON() ) )
		);

		socket.on( 'create:colormap', ( data ) => model.saveColormap( data )
			.then( () => socket.emit( 'state', model.toJSON() ) )
		);

		socket.on( 'playback:play', () => model.trigger( 'play' ) );
		socket.on( 'playback:pause', () => model.trigger( 'pause' ) );
		socket.on( 'playback:reset', () => model.trigger( 'reset' ) );

		// for all attributes
		let modelListeners = {};
		_.each( model.attributes, ( val, name ) => {
			socket.on( `change:${name}`, ( event ) => {
				model.incoming = true;
				model[ event.name ] = event.value;
				model.incoming = false;
			} );
			modelListeners[ `change:${name}` ] = ( event ) => {
				if ( model.incoming ) return;
				socket.emit( `change:${name}`, _.pick( event, [ 'name', 'value' ] ) );
			}

			model.on( `change:${name}`, modelListeners[ `change:${name}` ] );
		} )
		model.on( 'change:colormapTileMode', ( event ) => console.log( event.name, event.value ) );

		// for wholesale state changes
		modelListeners[ 'change:state' ] = ( event ) => {
			socket.emit( 'state', _.extend( model.toJSON(), _.pick( model.credentials, [ 'deviceId', 'localAddress', 'port' ] ) ) );
		}
		model.on( 'change:state', modelListeners[ 'change:state' ] );


		socket.on( 'disconnect', () => {
			_.each( modelListeners, ( fn, name ) => {
				// FIXME: this kills all model listners
				model.off( `change:${name}`, fn );
			} )
		} );
		model.trigger( 'change:state' );
		// socket.emit( 'state', _.extend( model.toJSON(), _.pick( model.credentials, [ 'deviceId', 'localAddress', 'port' ] ) ) );
	} )
}
