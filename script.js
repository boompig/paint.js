

/**
 * Update the display which shows which tool is selected.
 * The mode is given.
 */
function setTool(toolText) {
	if (! $("#selectedToolViewer").is(":visible")) {
		$("#selectedToolViewer").show();
	}
	
	$("#selectedTool").text(toolText.toUpperCase())
	tool = toolText;
}

/**
 * Draw stuff on the canvas.
 * Do this as a sanity check that JS is working and canvas is still there.
 */
function drawOnCanvas() {
	var canvas = document.getElementById("myCanvas");
	context = canvas.getContext("2d");
	
	// everything will be green for now
	context.fillStyle = "green";
	// context.fillRect(100, 100, 250, 275);
}

function updateMousePos(x, y) {
	$("#coordsViewer").text("(" + x +  ", " + y + ")");
	
	if(toolStarted == 1) {
		clearCanvas();
		updateToolEnd(x, y);
		toolStarted = 1;
	}
}

/**
 * Remove all elements from the canvas.
 */
function clearCanvas() {
	// according to this SOF question, this clears the canvas
	// http://stackoverflow.com/questions/10865398/how-to-clear-an-html-canvas
	var canvas = $("#myCanvas")[0];
	canvas.width = canvas.width;
}

function updateToolStart(x, y) {
	if (tool) {
		$("#toolStart").text("(" + x +  ", " + y + ")");
		toolStart = {"x" : x, "y" : y};
		toolStarted += 1;
		// console.log(toolStart);
		
		// start drawing
		// context.beginPath();
	} else {
		alert("You have to select a tool!");	
	}
}

/**
 * Draws the shape.
 * Assumes toolStart variable already set.
 * 
 * TODO: for now sets fill color and line color, will change later:
 * 		+ Rectangle -	yellow fill, black outline
 * 		+ Circle	-	red fill, black outline
 * 		+ Line		-	blue
 */
function updateToolEnd(x, y) {
	$("#toolEnd").text("(" + x +  ", " + y + ")");
	var toolEnd = {"x" : x, "y" : y};
	// console.log(toolEnd);
	
	
	if(tool == "circle") {
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
	} else if (tool == "rect") {
		context.beginPath();
		// note that the third and fourth parameters are width and height resp.
		
		context.rect(toolStart.x, toolStart.y, toolEnd.x - toolStart.x, toolEnd.y - toolStart.y);
		context.fillStyle = "yellow";
		context.fill();
		context.lineWidth = 3;
		context.strokeStyle = "black";
		context.stroke();
	} else if (tool == "line") {
		context.beginPath();
		context.lineWidth = 2;
		context.strokeStyle = "blue";
		context.moveTo(toolStart.x, toolStart.y);
		context.lineTo(toolEnd.x, toolEnd.y);
		context.stroke();
	}
	
	// show updates
	toolStarted += 1;
}

/**
 * Add listeners to interact with the canvas
 */
function addCanvasListeners() {
	$("#myCanvas").mousedown(function(event) {
		if (toolStarted == 0) {						
			updateToolStart(event.clientX - this.offsetLeft, event.clientY - this.offsetTop);
			$("#toolStartViewer").show();
		} else if (toolStarted == 1) {
			updateToolEnd(event.clientX - this.offsetLeft, event.clientY - this.offsetTop);$("#toolEndViewer").show();
			$("#toolEndViewer").show();
		} else {
			// hide displays for start and end points
			$("#toolStartViewer").hide();
			$("#toolEndViewer").hide();
			
			// clear start and end points
			toolStart = toolEnd = false;
			
			// clear the canvas
			clearCanvas();
			
			// reset 
			toolStarted = 0;
		}
	});
	
	$("#myCanvas").mousemove(function(event) {
		updateMousePos(event.clientX - this.offsetLeft, event.clientY - this.offsetTop);
	});
}

