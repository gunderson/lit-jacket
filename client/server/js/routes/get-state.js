const route = ( model ) => ( req, res ) => {
	res.send( {
		status: 200,
		state: model.toJSON()
	} )
};

module.exports = route;
