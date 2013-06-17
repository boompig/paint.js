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
	/**************************** Colour Bar Events ********************************/
	
	 $("#redSlider, #greenSlider, #blueSlider").slider({
		orientation: "horizontal",
		range: "min",
		max: 255,
		value: 127,
		slide: function (e, elem) { toolbar.setColour(); },
		change: function (e, elem) { toolbar.setColour(); }
	});
	
	$("#lineWidthSlider").slider({
		orientation: "horizontal",
		range: "min",
		min: 1,
		max: 35,
		value: 3,
		slide: function (e, elem) { toolbar.setOutlineWidth(elem.value); },
		change: function (e, elem) { toolbar.setOutlineWidth(elem.value); }
	});
	
	$("#outlineWidth").val($("#lineWidthSlider").slider("value"));
	
	$(".colourType").change(function() {
		var type = $(this).val();
		toolbar.setColourSliders();
		
		$(".colourField").not("." + type).hide();
		
		$(".colourField." + type).show().keyup(); // trigger event on given colourField
	});
	
	/**************************** End Colour Bar Events ****************************/
	
	/********************* Toolbar button events ********************/
	
	$("#clearButton").click(function() { canvas.clearAll(); });
	
	$("#copyShapeButton").click(function() { canvas.copySelectedShape(); });
	
	$("#eraseShapeButton").click(function() { canvas.eraseSelectedShape(); });
	
	$("#applyColoursButton").click(function() { canvas.recolourSelectedShape(); });
	
	$("#randomColourButton").click(function() {
		var colour = Utils.randomColour().substring(1);
		var type = $(".colourType:checked").val();
		
		$(".colourField." + type).val(colour).change();
		toolbar.setColourSliders();
	});
	
	/********************* End toolbar button events ********************/
	
	/********************* Toolbar change events **********************/
	
	$(".drawtoolButton").change(function() {
		toolbar.setTool(this.value);
		if (this.value != "select")
			canvas.deselectShape();
	});
	
	$(".userField").each(function(i, elem) {
		$(elem).keyup(function(e) {
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

