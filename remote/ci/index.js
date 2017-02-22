const cp = require( 'child_process' );
const path = require( 'path' );
const GitWebhooks = require( 'git-web-hooks' )

console.log( "starting hook server" );

new GitWebhooks( {

		PORT: process.env.PORT || 3333

	} )
	.on( 'payload', ( req, res, payload ) => {
		let data = payload;
		if ( data.ref_type === 'tag' ) {
			res.setHeader( 'Content-Type', 'application/json' )
			res.end( JSON.stringify( {
				status: 200,
				message: 'Webhook Server Running: tag'
			} ) );
		} else if ( data.ref === 'refs/heads/master' ) {
			res.setHeader( 'Content-Type', 'application/json' )
			res.end( JSON.stringify( {
				status: 200,
				message: 'Webhook Server Running: Push to master'
			} ) );
			let gitcp = cp.spawn( 'git', [ 'pull', '-f' ], {
				detached: true
			} );
			gitcp.on( 'close', () => {
				let npmcp = cp.spawn( 'npm', [ 'i' ] );
				npmcp.on( 'close', () => {
					let pm2cmd = cp.exec( 'pm2 restart all' );
				} );
			} );
		}
	} )
