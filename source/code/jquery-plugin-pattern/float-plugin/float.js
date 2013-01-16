(function($) {
	function changePosition(elem, posX, posY) {
		elem.css({
			left: getPosWithPX(posX),
			top: getPosWithPX(posY)
		});
	}
	
	function remove(elem) {
		elem.remove();
	}

	function getPosWithPX(pos) {
		if (/px$/.test(pos) === false) {
			pos = pos + "px";
		}
		return pos;
	}

	$.float = function(posX, posY, text) {
		var elem = $('<div>'+text+'</div>').appendTo('body').css({
			left: getPosWithPX(posX),
			top: getPosWithPX(posY),
			position: 'absolute'
		});
		
		return {
			changePosition: function(posX, posY) {
				changePosition(elem, posX, posY);
			},
			remove: function() { remove(elem); }
		};
	};
})(jQuery);
