import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
let pkg = require( './package.json' );
let external = Object.keys( pkg.dependencies );

export default {
	entry: './src/js/index.js',
	plugins: [
		babel( babelrc() ),
	],
	external: external,
	targets: [ {
		dest: pkg.main,
		format: 'es',
		sourceMap: true
	}, ]
};
