const auth = require('basic-auth')

/*
	middleware for password protection
	ignores localhost

	options: {
		user: String,
		pass: String,
		realm: String (optional)
	}
*/
function Credentials (options){
	var realm = options.realm || 'express-o'
	
	// password protection
	return function(req, res, next){
		var credentials = auth(req)

		// skip if it's local
		if(process.env.NODE_ENV === 'local' || req.connection.remoteAddress.match('127.0.0.1') !== null){
			return next()
		}

		if (!credentials || credentials.name !== options.user || credentials.pass !== options.pass) {
			res.statusCode = 401
			res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`)
			res.end('Access denied')
		} else {
			next()
		}		
	}
}
module.exports = Credentials