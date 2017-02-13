const _ = require( 'lodash' );
const View = require( 'peak/js/views/View' );

class ViewTemplate extends View {
	constructor( options ) {
		super( View.Merge( {
			// el: undefined,
			// model: undefined,
			// template: 'View-Template',
			// id: 'View-Template',
			// tagname: 'div',
			// classname: 'view-template',
			// keep: false,
			// insert: true,
			// loadPromise: undefined,
			// parentView: undefined,
			// hasRendered: false,

			// ---------------------------------------------------
			// Child Views

			views: {
				/*
					'childView0': new ChildView0({
						el: '#child-id-0',
						model: this.model.widgets.at(0)
					}),
					'childView1': new ChildView1({
						el: '#child-id-1',
						model: this.model.widgets.at(1)
					}), ...
				*/
			},

			// ---------------------------------------------------
			// Event Listeners

			events: [
				/*{
					target: 'member' || '.selector' || 'this',
					eventName: 'event-name',
					handler: 'functionName'
				} */
			],

			// ---------------------------------------------------
			// Data Binding

			dataBindings: [
				/*
				{
					element: '.selector',
					attributeName: 'attr',
					model: 'model',
					elementChangeEventName: 'change',
					mode: 'get' || 'send'
				}
				*/
			],

			// ---------------------------------------------------
			// Function Scope Binding

			bindFunctions: [
				// 'functionName'
			]
		}, options ) );
	}
}

module.exports = ViewTemplate;
