import View from '../../../lib/peak-front-end/js/views/View';

export default class ControlFormView extends View {
	constructor( options ) {
		super( View.merge( {
			template: 'settings-form',
			events: [],
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
				'logEvent',
				'toggleChecked',
				'checkCheckbox'
			]
		}, options ) );
	}
	onRangeInput( val, $el ) {
		console.log( 'onRangeInput', arguments )
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
	logEvent( event, val ) {
		console.log( val );
	}
}
