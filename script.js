/**
 * Written by Daniel Kats
 * May 31, 2013
 */

/**
 * Serves as a namespace for these disparate functions.
 */
function Script() {
	// constructor
	var canvas = $("#myCanvas")[0];
	this.context = canvas.getContext("2d");
	
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
 * Slightly modified to exclude leading hashtag
 */
Script.prototype.isColour = function(colour) {
	var pattern = /(^[0-9A-F]{6}$)|(^[0-9A-F]{3}$)/i;
	return pattern.test(colour);
};

/**
 * Given a hex string, turn it to RGB.
 * Return an array [<red>, <blue>, <green>]
 * Taken from: http://stackoverflow.com/q/5623838/755934
 */
Script.prototype.hexToRGB = function(c) {
	var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
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
 * Preview the colour of the given type.
 * Update the div responsible for the colour preview with correct fill and outline values.
 */
Script.prototype.previewColour = function() {
	var bg = $(".colourField.fill").val();
	var outline = $(".colourField.line").val();
	var w = $("#outlineWidth").val();
	
	if (isNaN(w) || parseInt(w) < 0 || parseInt(w) > parseInt($("#outlineWidth").attr("max"))) {
		$("#outlineWidth").css("border-color", "red");
	} else {
		$("#outlineWidth").css("border-color", "green");
		// $("#colourPreview").css("border-width", w);
		this.lineWidth = parseInt(w);
	}
	
	if(this.isColour(bg)) {
		$(".colourField.fill").css("border-color", "green");
		// $("#colourPreview").css("background-color", "#" + bg);
		this.fillColour = "#" + bg;
	} else {
		$(".colourField.fill").css("border-color", "red");
	}
	
	if(this.isColour(outline)) {
		$(".colourField.line").css("border-color", "green");
		// $("#colourPreview").css("border-color", "#" + outline);
		this.lineColour = "#" + outline;
	} else {
		$(".colourField.line").css("border-color", "red");
	}
	
	this.clearCanvas(true);
	this.drawShape();
};

/******** END REACT TO USER PREFERENCES *****************/

Script.prototype.updateMousePos = function(x, y) {
	$("#coordsViewer").text("(" + x +  ", " + y + ")");
	
	if(toolStarted == 1) {
		// this.context.restore();
		// add current context back onto the stack for next restore
		// this.context.save(); 
		// console.log("saved!");
		this.drawShape({"x" : x, "y" : y});
	}
};

/**
 * Remove all elements from the canvas.
 * If preview is true, then clear the preview canvas instead.
 */
Script.prototype.clearCanvas = function(preview) {
	// according to this SOF question, this clears the canvas
	// http://stackoverflow.com/questions/10865398/how-to-clear-an-html-canvas
	var canvas = preview ? $("#colourPreview")[0] : $("#myCanvas")[0];	
	canvas.width = canvas.width;
};

Script.prototype.updateToolStart = function(x, y) {
	if (this.tool) {
		// $("#toolStart").text("(" + x +  ", " + y + ")");
		this.drawStart = {"x" : x, "y" : y};
		toolStarted += 1;
	} else {
		alert("You have to select a tool!");	
	}
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
 * Can use this to preview the shape by leaving drawEnd as undefined
 * 
 * Return True iff the shape was drawn. Can return false if:
 * 		+ `this.tool` is improperly specified
 * 		+ `this.lineWidth` hasn't been instantiated
 * 		+ `this.lineColour` hasn't been instantiated
 * 		+ `this.fillColour` hasn't been instantiated
 */
Script.prototype.drawShape = function(drawEnd) {
	if (! (this.lineWidth && this.lineColour && this.fillColour && ["line", "rect", "circle"].indexOf(this.tool) >= 0)) {
		return false;
	}
	
	if(! drawEnd) {
		context = this.previewContext;
		drawStart = {"x" : 4, "y" : 4};
		drawEnd = {"x" : $("#colourPreview").width() - 4, "y" : $("#colourPreview").height() - 4};
	} else {
		context = this.context;
		drawStart = this.drawStart;
	}
	
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
	// $("#toolEnd").text("(" + x +  ", " + y + ")");
	var toolEnd = {"x" : x, "y" : y};
	this.drawShape(toolEnd);
	// this.context.save();
	
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
	$(".drawtoolButton").click(function() {
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
 * Add listeners to interact with the canvas
 */
Script.prototype.addCanvasListeners = function() {
	// so can have access to this object in JQuery functions
	var obj = this;
	
	$("#myCanvas").mousedown(function(event) {
		if (toolStarted == 0) {
			// $("#toolEndViewer").hide();
			obj.updateToolStart(event.clientX - this.offsetLeft, event.clientY - this.offsetTop);
			// $("#toolStartViewer").show();
		} else if (toolStarted == 1) {
			obj.updateToolEnd(event.clientX - this.offsetLeft, event.clientY - this.offsetTop);$("#toolEndViewer").show();
			// $("#toolEndViewer").show();
			toolStarted = 0;
		} else {
			// this state should actually never be reached
			alert("error");
			
			// hide displays for start and end points
			// $("#toolStartViewer").hide();
			// $("#toolEndViewer").hide();
			
			// clear start and end points
			this.drawStart = toolEnd = false;
			
			// clear the canvas
			// obj.clearCanvas();
			
			// reset 
			toolStarted = 0;
		}
	});
	
	// so can have access to this object inside JQuery function
	var obj = this;
	
	$("#myCanvas").mousemove(function(event) {
		obj.updateMousePos(event.clientX - this.offsetLeft, event.clientY - this.offsetTop);
	});
};

/************ END CREATING LISTENERS ************************/
