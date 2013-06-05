var drag = false;
var util = new Utils(); // for quick reference to utils
var toolbar = new Toolbar();

function Tester() {
	this.previewCanvas = $("#previewLayer")[0];
	this.previewLayer = this.previewCanvas.getContext("2d");
	
	this.baseCanvas = $("#baseLayer")[0];
	this.baseLayer = this.baseCanvas.getContext("2d");
	
	this.shapeStack = new Array();
	this.uid = 0;
	
	/** Instantiate a bunch of vars */
	this.drawStart;
	this.fillColour;
	this.selectedShape;
}

/**
 * Called at the start of the preview. Usually mousedown or click on canvas.
 */
Tester.prototype.startPreview = function(drawStart) {
	this.drawStart = drawStart;
	drag = true;
	this.fillColour = toolbar.fillColour;
	this.lineColour = toolbar.lineColour;
	this.lineWidth = toolbar.lineWidth;
	this.tool = toolbar.tool;
};

Tester.prototype.previewShape = function (drawEnd) {
	this.clear(this.previewCanvas);
	var shape = new Shape(this.tool, this.drawStart, drawEnd, this.lineColour, this.lineWidth, this.fillColour);
	shape.draw(this.previewLayer);
};

Tester.prototype.endPreviewShape = function (drawEnd) {
	var shape = new Shape(this.tool, this.drawStart, drawEnd, this.lineColour, this.lineWidth, this.fillColour);
	
	// for finding that shape later
	shape.uid = this.uid;
	this.uid++;
	
    shape.draw(this.baseLayer);
    this.shapeStack.push(shape);
    this.clear(t.previewCanvas);
    drag = false;
    
    // select the newly-added shape
    this.selectShape(shape);
    
    
    console.log("Added: ");
    console.log(this.selectedShape);
};

/**
 * Try to select a shape at the given coordinates.
 * Try to select top-most elements first.
 */
Tester.prototype.trySelect = function (selectPos) {
	var shape, i = this.shapeStack.length - 1;
	
	while (i >= 0) {
		shape = this.shapeStack[i];
		
		if (shape.intersects(selectPos)) {
			// move the element to the end of the array			
			this.shapeStack.splice(i, 1);
			this.shapeStack.push(shape);
			
			this.selectShape(shape);
			this.redraw();
			return;
		}
		
		i--;
	}
	
	// if nothing
	this.deselectShape();
};

Tester.prototype.draw

/**
 * Redraw all the objects on the main canvas.
 */
Tester.prototype.redraw = function () {
	// console.log(this.shapeStack);
	util.clearCanvas(this.baseCanvas);
	
    for (var i = 0; i < this.shapeStack.length; i++) {
    	this.shapeStack[i].draw(this.baseLayer);
    }
};

/**
 * Clear the given canvas.
 * @param canvas The canvas.
 */
Tester.prototype.clear = function (canvas) {
    util.clearCanvas(canvas);
    
    if(canvas === this.baseCanvas) {
    	this.shapeStack = new Array();
    	this.deselectShape();
    }
};

/**
 * Erase the currently selected shape
 */
Tester.prototype.eraseSelectedShape = function () {
	if (this.selectedShape) {
		// find that shape and delete it
		var i = this.shapeStack.length - 1;
		while (i >= 0) {
			if (this.shapeStack[i].uid === this.selectedShape.uid) {
				this.shapeStack.splice(i, 1);
				// redraw the canvas
				this.redraw();
				
				this.deselectShape();
				break;
			}
			
			i--;
		}
		
		
	} else {
		alert("No shape selected");
	}
};

/**
 * Select the given shape.
 */
Tester.prototype.selectShape = function (shape, redraw) {
	this.selectedShape = shape;
	$("#eraseShapeButton").removeAttr("disabled");
};

/**
 * Deselect all shapes.
 */
Tester.prototype.deselectShape = function (enable) {
	this.selectedShape = false;
	$("#eraseShapeButton").attr("disabled", "disabled");
};

var t = new Tester();

// listeners
$("#clearButton").click(function () {
    t.clear(t.baseCanvas);
});

$("#eraseShapeButton").click(function() {
	t.eraseSelectedShape();
});

$("#randomColourButton").click(function() {
	$("#fillColour").val(util.randomColour().substring(1));
	$("#fillColour").change();
});

$(".drawtoolButton").change(function() {
	t.tool = this.value;
});

$("#previewLayer").mousedown(function (e) {
	if (t.tool == "select") {
		t.trySelect(util.toCanvasCoords(e));
	} else {
		t.startPreview(util.toCanvasCoords(e));	
	}
});

$("#previewLayer").mousemove(function (e) {
	var coords = util.toCanvasCoords(e);
	$("#canvasCoords").text(coords.toString());
	
    if (drag) {
        t.previewShape(coords);
    }
});

$("#previewLayer").mouseup(function (e) {
	if (drag) {
		if (t.tool != "select")
   			t.endPreviewShape(util.toCanvasCoords(e));
	}
});