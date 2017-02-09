const _ = require( 'lodash' );
import View from '../../../lib/peak-front-end/js/views/View';

export default class ControlFormView extends View {
	constructor( options ) {
		super( View.merge( {
			template: 'settings-form',
			events: [ {
				target: 'button.play',
				eventName: 'click',
				handler: 'onClickPlay'
			}, {
				target: 'button.pause',
				eventName: 'click',
				handler: 'onClickPause'
			}, {
				target: 'button.reset',
				eventName: 'click',
				handler: 'onClickReset'
			}, {
				target: 'button.save-preset',
				eventName: 'click',
				handler: 'onClickSavePreset'
			}, {
				target: 'button.upload-colormap',
				eventName: 'click',
				handler: 'onClickUploadColormap'
			}, {
				target: 'model',
				eventName: 'change:presets',
				handler: 'onChangePresets'
			}, {
				target: 'model',
				eventName: 'change:presetName',
				handler: 'onChangePresetName'
			}, {
				target: 'model',
				eventName: 'change:colormaps',
				handler: 'onChangeColormaps'
			} ],
			dataBindings: [ {
				element: '.enable-gestures>input',
				attributeName: 'gesturesEnabled',
				elementChangeEventName: 'change',
				setElementData: 'toggleChecked',
				getElementData: 'checkCheckbox'
			}, {
				element: '.enable-mic>input',
				attributeName: 'micEnabled',
				elementChangeEventName: 'change',
				setElementData: 'toggleChecked',
				getElementData: 'checkCheckbox'
			}, {
				element: 'select[name=presets]',
				attributeName: 'presetName',
				elementChangeEventName: 'change'
			}, {
				element: 'select[name=colormap-tile-mode]',
				attributeName: 'colormapTileMode',
				elementChangeEventName: 'change'
			}, {
				element: 'select[name=colormap-name]',
				attributeName: 'colormapName',
				elementChangeEventName: 'change'
			}, {
				element: '.drift-x>input[type=range]',
				attributeName: 'driftX',
				elementChangeEventName: 'input',
				setElementData: 'onRangeInput',
				getElementData: 'valToFloat'
			}, {
				element: '.drift-y>input[type=range]',
				attributeName: 'driftY',
				elementChangeEventName: 'input',
				setElementData: 'onRangeInput',
				getElementData: 'valToFloat'
			}, {
				element: '.colormap-scale-x>input[type=range]',
				attributeName: 'colormapScaleX',
				elementChangeEventName: 'input',
				setElementData: 'onRangeInput',
				getElementData: 'valToFloat'
			}, {
				element: '.colormap-scale-x>input[type=number]',
				attributeName: 'colormapScaleX',
				elementChangeEventName: 'change',
				setElementData: 'onRangeInput',
				getElementData: 'valToFloat'
			}, {
				element: '.colormap-scale-y>input[type=range]',
				attributeName: 'colormapScaleY',
				elementChangeEventName: 'input',
				setElementData: 'onRangeInput',
				getElementData: 'valToFloat'
			} ],
			bindFunctions: [
				'onRangeInput',
				'valToFloat',
				'toggleChecked',
				'checkCheckbox',
				'onClickPlay',
				'onClickPause',
				'onClickReset',
				'onClickSavePreset',
				'onClickUploadColormap',
				'onChangeColormaps',
				'onChangePresets',
				'prepColormapAndUpload',
				'onChangePresetName'
			]
		}, options ) );
		this.colormapTmp = $( '<img>' )[ 0 ];
		this.scratchpad = $( '<canvas width=256 height=256 />' )[ 0 ];
		this.scratchpadCtx = this.scratchpad.getContext( '2d' );

	}

	onChangePresetName( event ) {
		console.log( event.value );
	}

	onRangeInput( val, $el ) {
		$el.parent()
			.find( 'input' )
			.val( val );
	}
	valToFloat( $el ) {
		return parseFloat( $el.val() );
	}

	checkCheckbox( $el ) {
		return $el.is( ':checked' );
	}
	toggleChecked( val, $el ) {
		return $el.is( ':checked' );
	}
	onChangePresets( event, val ) {
		let $select = this.$( 'select[name=presets]' );
		let $els = _.map( val, ( data, name ) => $( `<option value='${name}'>${name}</option>` ) );
		$select.empty()
			.append( $els );
	}
	onChangeColormaps( event, val ) {
		let $select = this.$( 'select[name=colormap-name]' );
		let $els = _.map( val, ( data, name ) => $( `<option value='${name}'>${name}</option>` ) );
		$select.empty()
			.append( $els );
	}
	onClickPlay() {
		this.model.playPlayback();
	}
	onClickPause() {
		this.model.pausePlayback();
	}
	onClickReset() {
		this.model.resetPlayback();
	}
	onClickSavePreset() {
		return this.model.savePreset( this.$( '.preset-name input[type=text]' )
			.val() );
	}
	onClickUploadColormap( event ) {
		let colormapFileInput = this.$( 'input[name=colormap-image]' )[ 0 ]
		if ( !colormapFileInput.files || colormapFileInput.files.length <= 0 ) {
			return console.log( 'Please Choose a colormap' );
		}
		var selectedFile = colormapFileInput.files[ 0 ];
		var reader = new FileReader();
		reader.onload = this.prepColormapAndUpload;
		reader.readAsDataURL( selectedFile );
	}
	prepColormapAndUpload( e ) {
		// load into image
		this.colormapTmp.src = e.target.result;
		// draw image into scratchpad at a uniform 256x256 size
		this.scratchpadCtx.drawImage( this.colormapTmp, 0, 0, this.colormapTmp.width, this.colormapTmp.height, 0, 0, 256, 256 );
		let imageData = this.scratchpadCtx.getImageData( 0, 0, 256, 256 );
		let colormapData = {
			name: this.$( '.colormap-name input[type=text]' )
				.val() || Date.now()
				.toString(),
			data: Array.prototype.slice.apply( imageData.data ),
			width: imageData.width,
			height: imageData.height
		}
		this.model.uploadColormap( colormapData );
	}
}
