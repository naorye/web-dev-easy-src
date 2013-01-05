require.config({
	paths: {
		jQuery: 'libs/jquery-1.8.2.min',
		Underscore: 'libs/underscore-min',
		Backbone: 'libs/backbone',
		tooltipster: 'libs/jquery-plugins/jquery.tooltipster',
		text: 'libs/text'
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