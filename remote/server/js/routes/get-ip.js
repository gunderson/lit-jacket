// simple route to bounce an IP address back at requester
module.exports = ( req, res ) => {
	res.send( {
		status: 200,
		ip: req.ip
	} );
};
