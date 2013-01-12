require.config({
	paths: {
		jQuery: '../../assets/js/libs/jquery.min',
		Underscore: '../../assets/js/libs/underscore-min',
		Backbone: '../../assets/js/libs/backbone',
		tooltipster: '../../assets/js/plugins/jquery.tooltipster',
		text: '../../assets/js/libs/text'
	},
	shim: {
		'jQuery': {
			exports: '$'
		},
		'Underscore': {
			exports: '_'
		},
		'Backbone': {
			deps: [
				'Underscore',
				'jQuery'
			],
			exports: 'Backbone'
		},
		'tooltipster': {
			deps: [
				'jQuery'
			]
		}
	}
});

require([
	'Backbone',
	'router',
	'app'
], function(Backbone, Router, app) {

	var router = new Router();
	app.initialize(router);

	Backbone.history.start();
});