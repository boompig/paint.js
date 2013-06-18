/**
 * Written by Daniel Kats
 * June 13, 2013
 * 
 * This is the main file which adds all the listeners and assigns them events
 */

var toolbar = new Toolbar();
var canvas = new Canvas();

/**
 * attach events after load
 */
$(function (){
	/**************************** Colour Bar Events + JQuery UI ********************************/
	
	toolbar.generateSampleColours();
	
	$(".sampleColour").click(function() {
		// comma-seperated list
		var rgb = $(this).css("background-color").replace("rgb(", "").replace(")", "").split(", ");
		var hex = Utils.hexFromRGB(rgb[0], rgb[1], rgb[2]);
		toolbar.setColourFromExternal(hex);
	});
	
	$("#colourTypeButtons").buttonset();
	
	$("#accordion").accordion({
		collapsible: true,
		active: false,
		heightStyle: "content",
		autoHeight: false,
		clearStyle: true
	});
	
	 $("#redSlider, #greenSlider, #blueSlider").slider({
	 	animate: true,
		orientation: "horizontal",
		range: "min",
		max: 255,
		value: 127,
		slide: function (e, elem) { toolbar.setColourFromSliders(); },
		change: function (e, elem) { toolbar.setColourFromSliders(); }
	});
	
	$("#lineWidthSlider").slider({
		orientation: "horizontal",
		range: "min",
		min: 1,
		max: 30, // strategically set - if any higher, looks very odd
		value: 3,
		slide: function (e, elem) { toolbar.setOutlineWidth(elem.value); },
		change: function (e, elem) { toolbar.setOutlineWidth(elem.value); }
	});
	
	$("#outlineWidth").val($("#lineWidthSlider").slider("value"));
	
	$(".colourType").change(function() {
		var type = $(this).val();
		toolbar.setColourSliders();
		
		$(".colourField").not("." + type).hide();
		
		$(".colourField." + type).show().change(); // trigger event on given colourField
	});
	
	// $(".sampleColourContainer").selectable();
	
	/**************************** End Colour Bar Events ****************************/
	
	/********************* Toolbar button events + JQuery UI ********************/
	
	$("#toolContainer").buttonsetv();
	
	$("#clearButton").click(function() { canvas.clearAll(); });
	
	$("#copyShapeButton").click(function() { canvas.copySelectedShape(); });
	
	$("#eraseShapeButton").click(function() { canvas.eraseSelectedShape(); });
	
	$("#applyColoursButton").click(function() { canvas.recolourSelectedShape(); });
	
	$("#randomColourButton").click(function() {
		var colour = Utils.randomColour().substring(1);
		toolbar.setColourFromExternal(colour);
	});
	
	/********************* End toolbar button events ********************/
	
	/********************* Toolbar change events **********************/
	
	$(".drawtoolButton").change(function() {
		toolbar.setTool(this.value);
		if (this.value != "select")
			canvas.deselectShape();
	});
	
	$(".userField").each(function(i, elem) {
		$(elem).change(function(e) {
			toolbar.previewColour();
		});
		
		$(elem).change(function(e) {
			toolbar.previewColour();
		});
	});
		
	/********************* End toolbar change events **********************/
	
	/************************ Canvas mouse events *******************/
	
	$("#previewCanvas").mousedown(function (e) {
		var coords = Utils.toCanvasCoords(e);
		
		if (toolbar.tool == "select") {
			canvas.trySelect(coords);
	
			if (canvas.selectedShape) {
				// a move or a resize, or a simple select
				canvas.startMoveSelectedShape(coords);
			}
		} else {
			// it's a preview if a shape is selected
			canvas.deselectShape();
			canvas.startPreview(coords);	
		}
	});
	
	$("#previewCanvas").mousemove(function (e) {
		var coords = Utils.toCanvasCoords(e);
		$("#canvasCoords").text(coords.toString());
		
		if (canvas.selectedShape && canvas.mouseStart) {
			// shape being moved
			$("#previewCanvas").css("cursor", "move");
		} else if (canvas.selectedShape && canvas.selectedShape.intersects(coords)) {
			// shape being hovered over
			$("#previewCanvas").css("cursor", "pointer");
		} else {
			$("#previewCanvas").css("cursor", "auto");
		}
	
		if(toolbar.tool == "select" && canvas.selectedShape && canvas.mouseStart) {
			// mouse is down and select tool, so it's a move or resize
			canvas.moveSelectedShape(coords);
		} else if (canvas.currentShape) {
			// mouse is down and shape being created
	        canvas.previewShape(coords);
	    }
	});
	
	$("#previewCanvas").mouseup(function (e) {
		if (toolbar.tool == "select" && canvas.selectedShape && canvas.mouseStart) {
			// mouse was down and select tool
			canvas.endMoveSelectedShape();
		} else if (canvas.currentShape) {
	   		canvas.endPreviewShape(Utils.toCanvasCoords(e));
		}
	});
	
	// degenerate case of user moving mouse away from canvas while dragging something
	$("#previewCanvas").mouseout(function (e) {
		if (toolbar.tool == "select" && canvas.selectedShape && canvas.mouseStart) {
			// mouse was down and select tool
			canvas.endMoveSelectedShape();
		} else if (canvas.currentShape) {
	   		canvas.endPreviewShape();
		}
	});
	
	/************************ End canvas mouse events *******************/
	
	/************************ Trigger events ***************************/
	
	$(".drawtoolButton:checked").change();
	$(".colourType:checked").change();
	
	/************************ End trigger events ***********************/
});

