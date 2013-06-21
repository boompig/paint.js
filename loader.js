/**
 * Written by Daniel Kats
 * June 13, 2013
 * 
 * This is the main file which adds all the listeners and assigns them events
 */

// create these in global scope so that they are accessible from anywhere

var help = new Help(); // needs to be above the toolbar so toolbar has access to help methods
var toolbar = new Toolbar(); // needs to be above canvas, so canvas has access to toolbar methods
var canvas = new Canvas();

/**
 * This class is responsible for loading the application and attaching events, etc.
 */
function Loader() {
	// empty constructor
}

/**
 * Create page-wide visuals with JQuery UI
 */
Loader.prototype.createVisuals = function () {
	$("button").button();
};

/**
 * Add listeners and JQuery UI properties to the colourbar.
 */
Loader.prototype.configureColourbar = function () {
	toolbar.generateSampleColours();
	
	$(".sampleColour").click(function() {
		// comma-seperated list
		var rgb = $(this).css("background-color").replace("rgb(", "").replace(")", "").split(", ");
		var hex = Utils.hexFromRGB(rgb[0], rgb[1], rgb[2]);
		toolbar.setColourFromExternal(hex);
	});
	
	$("#colourTypeButtons").buttonset();
	
	$("#accordion").accordion({
		alwaysOpen: false,
		collapsible: true,
		active: false,
		heightStyle: "content",
		autoHeight: false,
		clearStyle: true
	});
	
	$("#accordion").bind("mouseleave", function() {
		$(this).accordion({"active" : false});
	}).bind("mouseover", function() {
		// open the accordion (true doesn't work, have to specify index, which is 0)
		$(this).accordion({"active" : 0});
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
		min: 0,
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
};

/**
 * Add listeners and JQuery UI properties to the toolbar.
 */
Loader.prototype.configureToolbar = function () {
	$("#toolContainer").buttonsetv();
	
	$("#clearButton").click(function() { canvas.clearAll(); });
	
	$("#copyShapeButton").click(function() { canvas.copySelectedShape(); });
	
	$("#eraseShapeButton").click(function() { canvas.eraseSelectedShape(); });
	
	$("#applyColoursButton").click(function() { canvas.recolourSelectedShape(); });
	
	$("#randomColourButton").click(function() {
		var colour = Utils.randomColour().substring(1);
		toolbar.setColourFromExternal(colour);
	});
	
	$(".drawtoolButton").change(function() {
		help.hide();
		toolbar.setTool(this.value);
		if (this.value != "select")
			canvas.deselectShape();
	});
	
	$(".userField").each(function(i, elem) {
		$(elem).change(function(e) {
			toolbar.previewColour();
		});
	});
};

/**
 * Add listeners and JQuery UI properties to the canvas.
 */
Loader.prototype.configureCanvas = function () {
	$("#previewCanvas").mousedown(function (e) {
		var coords = Utils.toCanvasCoords(e);
		help.hide();
		
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
	   		help.selectHelpMessage();
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
};

/**
 * Make the help pane look normal.
 */
Loader.prototype.configureHelp = function () {
	help.hide();
};

/**
 * Trigger the events associated with the checked buttons.
 */
Loader.prototype.triggerEvents = function() {
	$(".drawtoolButton:checked").change();
	$(".colourType:checked").change();
};

/**
 * Configure the canvas size to take up free space on screen.
 * Also makes sure that toolbars do not wrap on small screens.
 */
Loader.prototype.adjustCanvasSize = function() {
	var contentWidth = $("#toolbar").width() + $("#colourBar").width() + $("#outerCanvasContainer").width();
	var freeSpace = $(window).width() - contentWidth;
	var idealFreeSpace = 100; // very scientifically arrived at this value with 0 guesswork
	
	var expandWidth = freeSpace - idealFreeSpace;
	var canvasWidth = Number($("#canvasContainer canvas").attr("width"));
	var newCanvasWidth = canvasWidth + expandWidth;
	if (newCanvasWidth <= 100) {
		// this is far too small
		// what kind of idiotic screen size do you have!?!?!
		newCanvasWidth = 300; // this is basically the smallest usable size
	}
	
	$("#canvasContainer canvas").attr("width", newCanvasWidth);
	
	// now let's do the same thing with canvas height
	var minContentHeight = Math.min($("#toolbar").height(), $("#colourBar").height());
	$("#canvasContainer canvas").attr("height", minContentHeight);
	
	// also adjust the size of the help bar
	$("#helpContainer").css("width", newCanvasWidth - 40);
};

/**
 * attach events after load
 */
$(function (){
	// hide content container
	
	var loader = new Loader();
	loader.createVisuals();
	loader.configureColourbar();
	loader.configureToolbar();
	loader.adjustCanvasSize();
	loader.configureCanvas();
	loader.configureHelp();
	loader.triggerEvents();
});

