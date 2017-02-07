const chalk = require( 'chalk' );

function fourOhFour ( req, res, next ) {
	console.log( chalk.red( '------ Caught 404' ) );
	res.redirect( '/' );
	next();
}

module.exports = fourOhFour;
