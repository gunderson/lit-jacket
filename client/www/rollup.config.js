import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import rstring from 'rollup-plugin-string';
import babelrc from 'babelrc-rollup';

let pkg = require( './package.json' );
let external = Object.keys( pkg.dependencies );

export default {

	entry: './js/index.js',
	plugins: [
		nodeResolve( {
			jsnext: true,
			module: false,
			// browser: false,
			extensions: [ '.js', '.json' ]
		} ),
		commonjs( {
			include: 'node_modules/**', // Default: undefined
			sourceMap: true, // Default: true
		} ),
		rstring( {
			// Required to be specified
			include: [ '**/*.glsl', '**/*.vert', '**/*.frag' ]
		} ),
		babel( babelrc() ),
	],
	targets: [ {
		dest: pkg.browser,
		format: 'iife',
		sourceMap: true
	}, ]
};
