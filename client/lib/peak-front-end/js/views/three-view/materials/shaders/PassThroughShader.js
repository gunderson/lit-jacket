module.exports = {
	uniforms: {
		'tDiffuse': {
			type: 't',
			value: null
		}
	},
	vertexShader: require( './Identity.vert' ),
	fragmentShader: require( './PassThrough.frag' )

};
