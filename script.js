/**
 * Written by Daniel Kats
 * June 13, 2013
 * 
 * This is the main file which adds all the listeners and assigns them events
 */

var toolbar = new Toolbar();
var canvas = new Canvas();

/********************* Toolbar button events ********************/

$("#clearButton").click(function() { canvas.clearAll(); });

$("#copyShapeButton").click(function() { canvas.copySelectedShape(); });

$("#eraseShapeButton").click(function() { canvas.eraseSelectedShape(); });

$("#applyColoursButton").click(function() { canvas.recolourSelectedShape(); });

$("#randomColourButton").click(function() {
	var colour = Utils.randomColour().substring(1);
	
	if (toolbar.tool == "line" || (toolbar.currentShape && toolbar.currentShape.name == "line")) {
		$("#lineColour").val(colour).change();
	} else {
		$("#fillColour").val(colour).change();
	}
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

/* trigger listeners */
$(".drawtoolButton:checked").change();
	
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
	
	if (canvas.selectedShape && canvas.selectedShape.intersects(coords)) {
		if (canvas.mouseStart) {
			// i.e. the mouse is currently down
			$("#previewCanvas").css("cursor", "move");
		} else {
			$("#previewCanvas").css("cursor", "pointer");
		}	
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
