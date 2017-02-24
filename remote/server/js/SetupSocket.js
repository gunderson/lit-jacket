const _ = require( 'lodash' );
const chalk = require( 'chalk' );

module.exports = function SetupSocket( io ) {
	return io.on( 'connection', ( socket ) => {
		console.log( `${chalk.green('<<<')} Socket connected` );
	} );
}
