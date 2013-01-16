// jQuery plugin template for plugin that does work on element
(function($) {
	$.extend($.fn, {
		pluginName: function(param, options) {
			options = $.extend({
				// Options Defaults
			}, options);

			this.each(function() {
				// Operations for each DOM element
			}).data('pluginName', {
				// Plugin interface object
			});
		
			return this;
		}
	});
})(jQuery);