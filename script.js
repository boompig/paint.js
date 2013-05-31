/**
 * Written by Daniel Kats
 * May 31, 2013
 */

/**
 * Serves as a namespace for these disparate functions.
 */
function Script() {
	// constructor
	
	/* Create a buttload of uninstantiated variables */
	this.tool;
	this.drawStart;
}

/**
 * Update the display which shows which tool is selected.
 * The mode is given.
 */
Script.prototype.setTool = function(toolText) {
	if (! $("#selectedToolViewer").is(":visible")) {
		$("#selectedToolViewer").show();
	}
	
	$("#selectedTool").text(toolText.toUpperCase())
	this.tool = toolText;
};

/**
 * Draw stuff on the canvas.
 * Do this as a sanity check that JS is working and canvas is still there.
 */
Script.prototype.drawOnCanvas = function() {
	var canvas = document.getElementById("myCanvas");
	context = canvas.getContext("2d");
	
	// everything will be green for now
	context.fillStyle = "green";
	// context.fillRect(100, 100, 250, 275);
};

Script.prototype.updateMousePos = function(x, y) {
	$("#coordsViewer").text("(" + x +  ", " + y + ")");
	
	if(toolStarted == 1) {
		this.clearCanvas();
		this.updateToolEnd(x, y);
		toolStarted = 1;
	}
};

/**
 * Remove all elements from the canvas.
 */
Script.prototype.clearCanvas = function() {
	// according to this SOF question, this clears the canvas
	// http://stackoverflow.com/questions/10865398/how-to-clear-an-html-canvas
	var canvas = $("#myCanvas")[0];
	canvas.width = canvas.width;
};

Script.prototype.updateToolStart = function(x, y) {
	if (this.tool) {
		$("#toolStart").text("(" + x +  ", " + y + ")");
		toolStart = {"x" : x, "y" : y};
		toolStarted += 1;
		// console.log(toolStart);
		
		// start drawing
		// context.beginPath();
	} else {
		alert("You have to select a tool!");	
	}
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
	$("#toolEnd").text("(" + x +  ", " + y + ")");
	var toolEnd = {"x" : x, "y" : y};
	// console.log(toolEnd);
	
	
	if(this.tool == "circle") {
		var centerX = (toolEnd.x + toolStart.x) / 2;
		var centerY = (toolEnd.y + toolStart.y ) / 2;
		
		var radiusX = Math.abs(toolEnd.x - toolStart.x);
		var radiusY = Math.abs(toolEnd.y - toolStart.y);
		var radius = Math.min(radiusX, radiusY);
		
		context.beginPath();
		context.arc(centerX, centerY, radius, 2* Math.PI, false);
		context.closePath();
		context.fillStyle = "red";
		context.fill();
		context.lineWidth = 3;
		context.strokeStyle = "black";
		context.stroke();
	} else if (this.tool == "rect") {
		context.beginPath();
		// note that the third and fourth parameters are width and height resp.
		
		context.rect(toolStart.x, toolStart.y, toolEnd.x - toolStart.x, toolEnd.y - toolStart.y);
		context.fillStyle = "yellow";
		context.fill();
		context.lineWidth = 3;
		context.strokeStyle = "black";
		context.stroke();
	} else if (this.tool == "line") {
		context.beginPath();
		context.lineWidth = 2;
		context.strokeStyle = "blue";
		context.moveTo(toolStart.x, toolStart.y);
		context.lineTo(toolEnd.x, toolEnd.y);
		context.stroke();
	}
	
	// show updates
	toolStarted += 1;
};

/**
 * Add listeners to interact with the canvas
 */
Script.prototype.addCanvasListeners = function() {
	// so can have access to this object in JQuery functions
	var obj = this;
	
	$("#myCanvas").mousedown(function(event) {
		if (toolStarted == 0) {						
			obj.updateToolStart(event.clientX - this.offsetLeft, event.clientY - this.offsetTop);
			$("#toolStartViewer").show();
		} else if (toolStarted == 1) {
			obj.updateToolEnd(event.clientX - this.offsetLeft, event.clientY - this.offsetTop);$("#toolEndViewer").show();
			$("#toolEndViewer").show();
		} else {
			// hide displays for start and end points
			$("#toolStartViewer").hide();
			$("#toolEndViewer").hide();
			
			// clear start and end points
			toolStart = toolEnd = false;
			
			// clear the canvas
			obj.clearCanvas();
			
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

