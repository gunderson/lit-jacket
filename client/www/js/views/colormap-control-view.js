const _ = require( 'lodash' );
import View from '../../../lib/peak-front-end/js/views/View';
export default class ColormapControlView extends View {
	constructor( options ) {
		super( View.merge( {
			template: 'colormap-control',
			events: [ {
				target: 'model',
				eventName: 'change:colors',
				handler: 'onChangeColors'
			}, {
				target: 'model',
				eventName: 'change:colormapName',
				handler: 'onChangeColormapName'
			} ],
			dataBindings: [],
			bindFunctions: [ 'onChangeColors', 'onChangeColormapName' ]
		}, options ) );
	}

	onChangeColormapName( event, val ) {
		let colormapFilename = this.model.colormaps[ val ];
		if ( !colormapFilename ) {
			return _.defer( () => this.onChangeColormapName.call( this, event, val ) );
		}
		let $img = this.$( 'img.colormap' )
		$img.attr( 'src', `colormaps/${colormapFilename}` )
			.on( 'load', () => {

			} )
	}


	onChangeColors( event, colors ) {
		let $cells = this.$( 'td' );
		if ( $cells.length != colors.length / 3 ) {
			console.log( 'rendering' )
			this.render();
		}
		this.$( 'td' )
			.each( ( i, el ) => {
				$( el )
					.css( {
						'backgroundColor': `rgba( ${ colors[( i * 3 ) ] }, ${ colors[ ( i * 3 ) + 1 ] }, ${ colors[ ( i * 3 ) + 2 ] },1)`
					} );
			} );
	}
}
