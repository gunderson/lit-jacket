const _ = require( 'lodash' );

var route = ( model, controller ) => ( req, res ) => {
	let filename = Date.now();
	if ( req.file ) {
		// record new image option
		// set current image
		controller.setColormap( req.file.buffer, req.file.mimetype );

	}

	_.extend( model, req.body );


	res.send( {
		status: 200,
		message: 'successfully set state',
	} );
};

module.exports = route;
