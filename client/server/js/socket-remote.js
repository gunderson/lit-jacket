const _ = require( 'lodash' );
const io = require( 'socket.io-client' );
const chalk = require( 'chalk' );

let socket;

module.exports = function SetupRemoteSocket( model, controller ) {
	socket = io( `http://${model.remotes.remote.address}` );
	socket.on( 'connect', () => {
		console.log( `${chalk.green('>>>')} Remote Socket Connected` );

		socket.on( 'setColor', ( colorname ) => {
			controller.setColor( colorname );
		} )
		socket.on( 'disconnect', () => {
			SetupRemoteSocket( model, controller );
		} )
	} );
}
