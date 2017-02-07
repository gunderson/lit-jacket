// simple route to bounce an IP address back at requester
export default route = ( req, res ) => {
	res.send( {
		status: 200,
		ip: req.ip
	} );
};
