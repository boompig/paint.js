/**
 * Written by Daniel Kats
 * May 31, 2013
 */

/**
 * Serves as a namespace for these disparate functions.
 */
function Script() {
	// constructor
	// var canvas = $("#myCanvas")[0];
	// this.context = canvas.getContext("2d");
	
	this.drawer = new KineticDrawer();
	
	var previewCanvas = $("#colourPreview")[0];
	this.previewContext = previewCanvas.getContext("2d");
	
	/* Create a buttload of uninstantiated variables */
	this.tool;
	this.drawStart;
	this.lineWidth;
	this.fillColour;
	this.lineColour;
}

/************* GENERAL-PURPOSE UTILS *****************/

/**
 * Return true iff the colour given is a valid hex colour.
 * Taken from: http://stackoverflow.com/q/8027423/755934
 */
Script.prototype.isColour = function(colour) {
	var pattern = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
	return pattern.test(colour);
};

/************* END GENERAL-PURPOSE UTILS *****************/

/******** REACT TO USER PREFERENCES *****************/

/**
 * Update the display which shows which tool is selected.
 * The mode is given.
 */
Script.prototype.setTool = function(toolText) {
	this.tool = toolText;
	this.previewColour();
};

/**
 * Preview the shape the user is about to draw. Use all user-selected preferences:
 * 		+ fill colour
 * 		+ line colour
 * 		+ shape
 */
Script.prototype.previewColour = function() {
	var bg = "#" + $(".colourField.fill").val();
	var outline = "#" + $(".colourField.line").val();
	var w = $("#outlineWidth").val();
	
	// console.log("changing preview");
	
	if (isNaN(w) || parseInt(w) < 0 || parseInt(w) > parseInt($("#outlineWidth").attr("max"))) {
		$("#outlineWidth").css("border-color", "red");
	} else {
		$("#outlineWidth").css("border-color", "green");
		if (w != this.lineWidth) {
			this.lineWidth = parseInt(w);
			// console.log("changed line width");
		} 
	}
	
	if(this.isColour(bg)) {
		$(".colourField.fill").css("border-color", "green");
		if (bg != this.fillColour) {
			this.fillColour = bg;
			// console.log("changed fill colour");
		}
	} else {
		$(".colourField.fill").css("border-color", "red");
	}
	
	if(this.isColour(outline)) {
		$(".colourField.line").css("border-color", "green");
		if (outline != this.lineColour) {
			this.lineColour = outline;
			// console.log("changed line colour");
		}
	} else {
		$(".colourField.line").css("border-color", "red");
	}
	
	this.clearCanvas(true);
	this.drawShape();
};

/******** END REACT TO USER PREFERENCES *****************/

/**
 * Update the position of the mouse on the page.
 * Preview a shape on the canvas, if relevant.
 */
Script.prototype.updateMousePos = function(x, y) {
	$("#coordsViewer").text("(" + x +  ", " + y + ")");
	
	if(toolStarted == 1) {
		// this.drawShape({"x" : x, "y" : y});
		this.drawKineticShape({"x" : x, "y" : y})
	}
};

/**
 * Remove all elements from the canvas.
 * If preview is true, then clear the preview canvas instead.
 * Taken from SOF question: // http://stackoverflow.com/q/10865398/755934
 */
Script.prototype.clearCanvas = function(preview) {
	if (preview) {
		var canvas = $("#colourPreview")[0];
		canvas.width = canvas.width;
	} else {
		this.drawer.clear();
		$("canvas").not("#colourPreview").css("border", "1px #000 solid");
		addCanvasListener(this);
	}
};

Script.prototype.updateToolStart = function(x, y) {
	if (this.tool) {
		this.drawStart = {"x" : x, "y" : y};
		toolStarted += 1;
		this.drawer.paintStart(this.drawStart);
	} else {
		alert("You have to select a tool!");	
	}
};

/**
 * Draw a shape on the Kinetic rendition of the canvas.
 * Return True iff the shape was drawn. Can return false if:
 * 		+ `this.tool` is improperly specified
 * 		+ `this.lineWidth` hasn't been instantiated
 * 		+ `this.lineColour` hasn't been instantiated
 * 		+ `this.fillColour` hasn't been instantiated
 */
Script.prototype.drawKineticShape = function(drawEnd) {
	if (! (this.lineWidth && this.lineColour && this.fillColour && ["line", "rect", "circle"].indexOf(this.tool) >= 0)) {
		return false;
	}
	
	this.drawer.drawShape(this.drawStart, drawEnd, this.tool, this.fillColour, this.lineColour, this.lineWidth);
};

/**
 * Draw a shape.
 * Shape type is specified in `self.tool` and is one of:
 * 		+ "line"
 * 		+ "rect"
 * 		+ "circle"
 * 
 * Starting position of shape is specified in `self.drawStart`. It is a dictionary with the following form:
 * 		{"x" : <integer>, "y" : <integer>}
 * 
 * Ending position of shape is specified in parameter `drawEnd`. It is a dictionary with the following form:
 * 		{"x" : <integer>, "y" : <integer>}
 * 
 * Can use this to preview the shape by leaving drawEnd as undefined.
 * 
 * Return True iff the shape was drawn. Can return false if:
 * 		+ `this.tool` is improperly specified
 * 		+ `this.lineWidth` hasn't been instantiated
 * 		+ `this.lineColour` hasn't been instantiated
 * 		+ `this.fillColour` hasn't been instantiated
 */
Script.prototype.drawShape = function() {
	
	if (! (this.lineWidth && this.lineColour && this.fillColour && ["line", "rect", "circle"].indexOf(this.tool) >= 0)) {
		return false;
	}
	
	context = this.previewContext;
	drawStart = {"x" : 4, "y" : 4};
	drawEnd = {"x" : $("#colourPreview").width() - 4, "y" : $("#colourPreview").height() - 4};
	
	context.fillStyle = this.fillColour;
	context.lineWidth = this.lineWidth;
	context.strokeStyle = this.lineColour;
	
	context.beginPath();
	
	if(this.tool == "circle") {
		var centerX = (drawEnd.x + drawStart.x) / 2;
		var centerY = (drawEnd.y + drawStart.y ) / 2;
		
		var radiusX = Math.abs(drawEnd.x - drawStart.x) / 2;
		var radiusY = Math.abs(drawEnd.y - drawStart.y) / 2;
		var radius = Math.min(radiusX, radiusY);
		
		context.arc(centerX, centerY, radius, 2* Math.PI, false);
		context.closePath();
		context.fill();
	} else if (this.tool == "rect") {
		// note that the third and fourth parameters are width and height resp.
		context.rect(drawStart.x, drawStart.y, drawEnd.x - drawStart.x, drawEnd.y - drawStart.y);
		context.closePath();
		context.fill();
	} else if (this.tool == "line") {
		context.moveTo(drawStart.x, drawStart.y);
		context.lineTo(drawEnd.x, drawEnd.y);
		context.closePath();
	}
	
	context.stroke();
	return true;
};

/**
 * Draws the shape.
 * Assumes toolStart variable already set.
 * 
 * TODO: for now sets fill color and line color, will change later:
 * 		+ Rectangle -	yellow fill, black outline
 * 		+ Circle	-	red fill, black outline
 * 		+ Line		-	blue
 */
Script.prototype.updateToolEnd = function(x, y) {
	var toolEnd = {"x" : x, "y" : y};
	this.drawKineticShape(toolEnd);
	this.drawer.finalize();
	
	// show updates
	toolStarted += 1;
};

/************ CREATE LISTENERS ************************/

/**
 * Add listeners to the elements in the toolbar.
 */
Script.prototype.addToolbarListeners = function() {
	var obj = this;
	
	// add the listener for tool selection
	$(".drawtoolButton").change(function() {
		obj.setTool(this.value);
	});
	
	$("#clearButton").click(function() {
		obj.clearCanvas();
	});
	
	// taken from this SOF question:
	// http://stackoverflow.com/q/764427/755934
	$("form").bind("keypress", function(e) {
		// the key code for enter button
		if (e.which == 13) {
			console.log("here");
			
			// obj.previewColour($(src).val(), src);
			// $(src).focus(); // focus back on the element
			return false; // ignore default event
		}
	});
	
	$(".userField").each(function(i, elem) {
		$(elem).keyup(function(e) {
			obj.previewColour();
		});
	});
};

/**
 * React to a click on the canvas.
 * canvasX and canvasY are coordinates relative to the canvas.
 */
Script.prototype.canvasClick = function(canvasX, canvasY) {
	var obj = this;
	
	if (toolStarted == 0) {
		obj.updateToolStart(canvasX, canvasY);
	} else if (toolStarted == 1) {
		obj.updateToolEnd(canvasX, canvasY);
		toolStarted = 0;
	} else {
		// this state should actually never be reached
		alert("error");
		
		// clear start and end points
		this.drawStart = toolEnd = false;
		
		// reset 
		toolStarted = 0;
	}
};

/************ END CREATING LISTENERS ************************/
