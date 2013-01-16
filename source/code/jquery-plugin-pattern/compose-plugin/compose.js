(function($) {
	$.fn.compose = function(options) {
		options = $.extend({
			number: 2,
			ul: null
		}, options);
		
		function setNumber(number) {
			options.number = number;
		}
		
		this.change(function() {
			if (options.ul !== null) {
				var value = $(this).val();
				var ul = $(options.ul).empty();
				for(var i=0;i<options.number;i++) {
					ul.append('<li>' + value + '</li>');
				}
			}
		});
		
		this.data('compose', {
			setNumber: setNumber
		});
		
		return this;
	};
})(jQuery);
