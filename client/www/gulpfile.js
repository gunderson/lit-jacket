require( 'babelify' );

var _ = require( 'lodash' );
var browserify = require( 'browserify' );
var browserifyInc = require( 'browserify-incremental' );
// var aliasify = require( 'aliasify' );
var stringify = require( 'stringify' );
var babelify = require( 'babelify' );
var helpers = require( 'babelify-external-helpers' );
var buffer = require( 'vinyl-buffer' );
var chalk = require( 'chalk' );
var cp = require( 'child_process' );
var csso = require( 'gulp-csso' );
var docco = require( 'gulp-docco' );
var domain = require( 'domain' );
var fs = require( 'fs' );
var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );
var jstConcat = require( 'gulp-jst-concat' );
var livereload = require( 'gulp-livereload' ); // Livereload plugin needed: https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdle;
var path = require( 'path' );
// var pkg = require( './package.json' );
var plumber = require( 'gulp-plumber' );
var pug = require( 'gulp-pug' );
var rename = require( 'gulp-rename' );
// var resolutions = require( 'browserify-resolutions' );
var rm = require( 'gulp-rm' );
var sass = require( 'gulp-sass' );
var source = require( 'vinyl-source-stream' );
var sourcemaps = require( 'gulp-sourcemaps' );
var tap = require( 'gulp-tap' );
// var transform = require( 'vinyl-transform' );
var uglify = require( 'gulp-uglify' );
// var watchify = require( 'watchify' );

var request = require( 'sync-request' );

var server;
var remotes = require( '../../data/remotes.json' );

// --------------------------------------------------
// Environment vars

var srcPath = './';
var peakPath = '../lib/peak-front-end/';
var distPath = './dist/';
var dataPath = '../data/';

// --------------------------------------------------

gulp.task( 'css', function() {
	return gulp
		.src( path.join( srcPath, '/sass/**/*.sass' ) )
		.pipe( sourcemaps.init( {
			loadMaps: true
		} ) )
		.pipe( plumber( onError ) )
		.pipe( sass( {

			includePaths: [ path.join( srcPath, '/sass/' ), path.join( peakPath, 'sass/' ) ],
			errLogToConsole: true
		} ) )
		.pipe( csso() )
		.pipe( sourcemaps.write() )
		.pipe( gulp.dest( distPath + '' ) )
		.pipe( livereload() )
		.on( 'error', gutil.log );
} );

// --------------------------------------------------

// TODO: process assets
gulp.task( 'copy-assets',
	function() {
		return gulp
			.src( path.join( srcPath, '/assets/**/*' ) )
			.pipe( plumber( onError ) )
			.pipe( gulp.dest( path.join( distPath, 'assets/' ) ) )
			.pipe( livereload() )
			.on( 'error', gutil.log );
	} );

// --------------------------------------------------

gulp.task( 'compile-js', [ 'dynamic-templates' ], function( cb ) {
	return gulp
		.src( path.join( srcPath, '/js/index.js' ), {
			read: false
		} )
		.pipe( tap( function( file ) {
			var d = domain.create();

			d.on( 'error', function( err ) {
				gutil.beep();
				gutil.log(
					gutil.colors.red( 'Browserify compile error:' ),
					err.message,
					'\n\t',
					gutil.colors.cyan( 'in file' ),
					file.path,
					err
				);
			} );

			d.run( function() {
				let b = browserify( _.extend( browserifyInc.args, {
					entries: [ file.path ],
					debug: true,
					paths: [ path.join( srcPath, 'js/' ), path.join( peakPath, 'js/' ), '../node_modules' ],
					externalHelpers: false,
					runtimeHelpers: true,
					// dedupe: false,
					cache: {},
					packageCache: {}
				} ) );

				browserifyInc( b, {
					cacheFile: './browserify-cache.json'
				} );
				file.contents = b
					.transform( babelify, {
						presets: [
							'es2015'
						],
						global: true,
						ignore: [
							// /\/node_modules\/(?!(postprocessing\/))/
						]
					} )
					// .transform( aliasify )
					.transform( stringify )
					.plugin( helpers )
					// .plugin( resolutions, '*' )
					.bundle()
					.pipe( plumber( onError ) )
					.pipe( source( 'index.js' ) )
					.pipe( buffer() )
					.pipe( sourcemaps.init( {
						loadMaps: true
					} ) )
					// .pipe( uglify() )
					.pipe( sourcemaps.write( './' ) )
					.pipe( gulp.dest( distPath + '' ) )
					.pipe( livereload() )
					.on( 'error', gutil.log );
			} );
		} ) );

} );

function listFolders( dir ) {
	return fs
		.readdirSync( dir )
		.filter( function( file ) {
			return fs
				.statSync( path.join( dir, file ) )
				.isDirectory();
		} );
}

function listFiles( dir ) {
	return fs
		.readdirSync( dir )
		.filter( function( file ) {
			return !fs
				.statSync( path.join( dir, file ) )
				.isDirectory();
		} );
}

var revision = 'undefined';
gulp.task( 'get-revision', function( next ) {
	var git = cp.spawn( 'git', [ 'log', -1 ] );
	var grep = cp.spawn( 'grep', [ 'commit' ] );

	git.stdout.pipe( grep.stdin );

	grep.stdout.on( 'data', ( data ) => {
		data = data.toString();
		data = data.replace( '\n', '' );
		revision = _.last( data.split( ' ' ) );
	} );
	grep.on( 'close', () => {
		next();
	} );
} );

gulp.task( 'static-templates', [ 'get-revision' ], function() {
	var copyPath = path.join( dataPath, 'copy/' );
	var langs = listFolders( copyPath );
	var langData = {};
	if ( !langs.length ) {
		throw new Error( `No language folders in ${dataPath}copy/` );
	}
	var files = listFiles( path.join( copyPath, langs[ 0 ] ) );
	if ( !files.length ) {
		throw new Error( `No data files in ${dataPath}copy/` + langs[ 0 ] );
	}
	return langs.map( ( lang ) => {
		langData[ lang ] = {};
		_.each( files, ( filename ) => {
			langData[ lang ][ path.basename( filename, '.json' ) ] = require( path.resolve( copyPath, lang, filename ) );
		} );
		return gulp
			.src( [ path.join( srcPath, 'pug/static/**/*.pug' ), '!' + path.join( srcPath, 'pug/static/**/_*.pug' ) ] )
			.pipe( plumber( onError ) )
			.pipe( rename( function( path ) {
				path.basename += `.${lang}`;
				path.extname = '.html';
			} ) )
			.pipe( pug( {
				pretty: true,
				locals: {
					copy: langData[ lang ],
					lang: lang,
					revision: revision,
					buildTime: new Date()
						.toString()
				},
				basedir: path.join( srcPath, '/' )
			} ) )
			.pipe( gulp.dest( './dist' ) )
			.pipe( livereload() )
			.on( 'error', gutil.log )
			.on( 'end', () => {
				if ( lang === 'en' ) {
					gulp
						.src( path.join( distPath, 'index.en.html' ) )
						.pipe( plumber( onError ) )
						.pipe( rename( function( path ) {
							path.basename = 'index';
							path.extname = '.html';
						} ) )
						.pipe( gulp.dest( distPath + '' ) );
				}
			} );
	} );
} );

// --------------------------------------------------

gulp.task( 'dynamic-templates', function() {
	var stream = gulp
		.src( [ path.join( srcPath, 'pug/dynamic/**/*.pug' ), '!' + path.join( srcPath, 'pug/dynamic/**/_*.pug' ) ] )
		.pipe( plumber( onError ) )
		.pipe( pug( {
			pretty: true,
			client: true,
			compileDebug: false
		} ) )
		.pipe( rename( function( path ) {
			path.extname = '';
			path.relative = true;
		} ) )
		.pipe( jstConcat( 'templates.js', {
			exportString: 'module.exports',
			requireLoDash: true,
			client: true,
		} ) )
		.pipe( gulp.dest( path.join( srcPath, 'js/' ) ) )
		// .pipe( livereload() )
		.on( 'error', gutil.log );
	return stream;
} );

// --------------------------------------------------

gulp.task( 'watch', [ 'server' ],
	function() {
		livereload.listen();
		gulp.watch( [
			path.join( srcPath, '/**/*.js' ),
			'!' + path.join( srcPath, 'js/templates.js' ), // generated from /src/pug/dynamic/**/*.pug
			path.join( srcPath, '/pug/dynamic/**/*.pug' ),
			'./package.json', 'data/**/*.json'
		], [ 'compile-js', 'copy-app' ] );
		gulp.watch( [ path.join( srcPath, 'pug/static/**/*.pug' ), path.join( eakPath, 'pug/static/**/*.pug' ) ], [ 'static-templates' ] );
		gulp.watch( [ path.join( srcPath, 'sass/**/*.sass' ), path.join( peakPath, 'sass/**/*.sass' ) ], [ 'css' ] );
	} );

gulp.task( 'server', () => {
	let pm2 = cp.spawn( 'pm2', [ 'start', 'processes.json', '--only', 'api', '--only', 'renderer', '--only', 'origin-www' ], {
		cwd: path.resolve( '../../' )
	} );
	pm2.stdout.on( 'data', ( data ) => {
		gutil.log( chalk.yellow( '----- server output -----\n' ) + data.toString( 'utf8' ) );
	} );
	pm2.stderr.on( 'data', ( data ) => {
		gutil.log( chalk.red( '----- server error -----\n' ) + data.toString( 'utf8' ) );
	} );
} );

// --------------------------------------------------

gulp.task( 'build-statics', [
	'compile-js',
	'static-templates',
	'css',
] );

// --------------------------------------------------

gulp.task( 'default', [
	'compile-js',
	'static-templates',
	'css'
] );

// --------------------------------------------------

// --------------------------------------------------
// General project tasks

gulp.task( 'clean', function() {
	return gulp
		.src( [ distPath + '', distPath + '**/*', distPath + '**/.*' ], {
			read: false
		} )
		.pipe( plumber( onError ) )
		.pipe( rm() )
		.on( 'error', gutil.log );
} );

// --------------------------------------------------

gulp.task( 'copy-app', [ 'compile-js' ], function() {
	return gulp
		.src( srcPath + '/**/*' )
		.pipe( plumber( onError ) )
		.pipe( gulp.dest( distPath + '' ) )
		.on( 'error', gutil.log );
} );

// --------------------------------------------------

gulp.task( 'copy-data', function() {
	return gulp.src( dataPath + '**/*' )
		.pipe( plumber( onError ) )
		.pipe( gulp.dest( distPath + 'data/' ) )
		.on( 'error', gutil.log );
} );

// --------------------------------------------------

gulp.task( 'docs', function() {
	return gulp.src( srcPath + '/**/*.js' )
		.pipe( plumber( onError ) )
		.pipe( docco() )
		.pipe( gulp.dest( './documentation-output' ) )
		.on( 'error', gutil.log );
} );

// --------------------------------------------------

function onError( err ) {
	gutil.beep();
	gutil.log( err );
	this.emit( 'end' );
};

process.on( 'SIGINT', () => {
	if ( server ) server.kill();
	process.exit();
} );
