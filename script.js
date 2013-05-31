/**
 * Written by Daniel Kats
 * May 31, 2013
 */

/**
 * Serves as a namespace for these disparate functions.
 */
function Script() {
	// constructor
	var canvas = document.getElementById("myCanvas");
	this.context = canvas.getContext("2d");
	
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
		this.drawStart = {"x" : x, "y" : y};
		toolStarted += 1;
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
		var centerX = (toolEnd.x + this.drawStart.x) / 2;
		var centerY = (toolEnd.y + this.drawStart.y ) / 2;
		
		var radiusX = Math.abs(toolEnd.x - this.drawStart.x);
		var radiusY = Math.abs(toolEnd.y - this.drawStart.y);
		var radius = Math.min(radiusX, radiusY);
		
		this.context.beginPath();
		this.context.arc(centerX, centerY, radius, 2* Math.PI, false);
		this.context.closePath();
		this.context.fillStyle = "red";
		this.context.fill();
		this.context.lineWidth = 3;
		this.context.strokeStyle = "black";
		this.context.stroke();
	} else if (this.tool == "rect") {
		this.context.beginPath();
		// note that the third and fourth parameters are width and height resp.
		
		this.context.rect(this.drawStart.x, this.drawStart.y, toolEnd.x - this.drawStart.x, toolEnd.y - this.drawStart.y);
		this.context.fillStyle = "yellow";
		this.context.fill();
		this.context.lineWidth = 3;
		this.context.strokeStyle = "black";
		this.context.stroke();
	} else if (this.tool == "line") {
		this.context.beginPath();
		this.context.lineWidth = 2;
		this.context.strokeStyle = "blue";
		this.context.moveTo(this.drawStart.x, this.drawStart.y);
		this.context.lineTo(toolEnd.x, toolEnd.y);
		this.context.stroke();
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
			this.drawStart = toolEnd = false;
			
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

