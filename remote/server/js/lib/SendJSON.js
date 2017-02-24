const HeaderUtils = require( './HeaderUtils' );
module.exports = ( res, obj ) => {
	HeaderUtils.addJSONHeader( res );
	HeaderUtils.addCORSHeader( res );
	res.send( obj );
	return res;
}
