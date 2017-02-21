const cp = require( 'child_process' );
const path = require( 'path' );
const GitWebhooks = require( 'git-web-hooks' )

new GitWebhooks( {

		PORT: process.env.PORT || 3333

	} )
	.on( 'payload', ( req, res, payload ) => {
		console.log( payload );
		let data = payload;
		if ( data.ref_type === 'tag' ) {
			res.send( {
				status: 200,
				message: 'Webhook Server Running: tag'
			} );
		} else if ( data.ref === 'refs/heads/master' ) {
			res.send( {
				status: 200,
				message: 'Webhook Server Running: Push to master'
			} );
			res.end();
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
