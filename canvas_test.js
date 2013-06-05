var drag = false;
var util = new Utils(); // for quick reference to utils
var toolbar = new Toolbar();
var mouseStart = false; // for check of whether this is click or drag

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
	
	this.shapeStack.push(shape);
    shape.draw(this.baseLayer);
    
    this.clear(this.previewCanvas);
    drag = false;
    
    // select the newly-added shape
    this.selectShape(shape);
};

/**
 * Try to select a shape at the given coordinates.
 * Try to select top-most elements first.
 */
Tester.prototype.trySelect = function (selectPos) {
	// deselect the current shape before picking up a new one
	this.deselectShape();
	
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
};

/**
 * Redraw all the objects on the main canvas.
 */
Tester.prototype.redraw = function () {
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
	
	// remove from the main canvas
	var i = this.shapeStack.length - 1;
	while (i >= 0) {
		if (this.shapeStack[i].uid === this.selectedShape.uid) {
			this.shapeStack.splice(i, 1);
			break;
		}
		
		i--;
	}
	
	// add to the preview canvas
	this.selectedShape.draw(this.previewLayer);
	
	$("#eraseShapeButton").removeAttr("disabled");
};

/**
 * Deselect all shapes.
 */
Tester.prototype.deselectShape = function (enable) {
	if (this.selectedShape) {
		// add the selected shape back to the main canvas
		this.selectedShape.draw(this.baseLayer);
	    this.shapeStack.push(this.selectedShape);
	    this.clear(this.previewCanvas);
	}
	
	this.selectedShape = false;
	$("#eraseShapeButton").attr("disabled", "disabled");
};

/**
 * Move the currently selected shape by the mouse delta
 * @param {Vector} delta The vector by which to move.
 */
Tester.prototype.moveSelectedShape = function (delta) {
	if (! this.selectedShape) {
		alert("No shape selected")
		return;
	}
	
	this.clear(this.previewCanvas);
	this.selectedShape.move(delta);
	this.selectedShape.draw(this.previewLayer);
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
		var coords = util.toCanvasCoords(e)
		
		t.trySelect(coords);
		if (t.selectedShape) {
			mouseStart = coords;
		} else {
			console.log("none selected");
		}
	} else {
		t.startPreview(util.toCanvasCoords(e));	
	}
});

$("#previewLayer").mousemove(function (e) {
	var coords = util.toCanvasCoords(e);
	$("#canvasCoords").text(coords.toString());

	if(t.tool == "select" && t.selectedShape && mouseStart) {
		var mouseDelta = util.toCanvasCoords(e).sub(mouseStart);
		t.moveSelectedShape(mouseDelta);
		mouseStart = coords;
	} else if (t.tool == "select") {
		// console.log(t.selectedShape);
		// console.log(mouseStart);
	}else if (drag) {
        t.previewShape(coords);
    }
});

$("#previewLayer").mouseup(function (e) {
	if (t.tool == "select" && t.selectedShape && mouseStart) {
		t.deselectShape();
		mouseStart = false;
	} else if (drag) {
   		t.endPreviewShape(util.toCanvasCoords(e));
	}
});