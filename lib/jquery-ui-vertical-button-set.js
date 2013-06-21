/**
 * Got from http://stackoverflow.com/a/4569274/755934
 * Used to create a vertical button set (instead of typical horizontal set).
 * Modified slightly with syntactic annotations and minor wrappers.
 */

(function( $ ){
	$.fn.buttonsetv = function() {
		$(':radio, :checkbox', this).wrap('<div style="margin: 1px"/>');
		$(this).buttonset();
		$('label:first', this).removeClass('ui-corner-left').addClass('ui-corner-top');
		$('label:last', this).removeClass('ui-corner-right').addClass('ui-corner-bottom');
		var maxWidth = 0, w;
		$('label', this).each(function(index){
			 w = $(this).width();
			 if (w > maxWidth) 
			 	maxWidth = w; 
		});
		$('label', this).each(function(index){
			$(this).width(maxWidth);
		});
	};
})( jQuery );