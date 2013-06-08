var toolbar = new Toolbar();

/**
 * The main wrapper class for this application.
 */
function Canvas() {
	this.previewCanvas = $("#previewLayer")[0];
	this.previewLayer = this.previewCanvas.getContext("2d");
	
	this.baseCanvas = $("#baseLayer")[0];
	this.baseLayer = this.baseCanvas.getContext("2d");
	
	this.shapeStack = new Array();
	this.previewShapeStack = new Array();
	
	/** Instantiate a bunch of vars (it's fine if they are undefined for now) */
	
	/**
	 * @returns {Vector}
	 */
	this.mouseStart;
	
	/**
	 * @returns {Number}
	 */
	this.mode;
	
	/**
	 * @returns {Shape}
	 */
	this.selectedShape;
	
	/**
	 * @returns {Shape}
	 */
	this.currentShape;
}

/**
 * Different possible actions depending on where mouse was clicked
 */
Canvas.moveMode = {
	RESIZE : 1,
	MOVE : 2
};

/**
 * Called at the start of the preview. Usually mousedown or click on canvas.
 * @param {Vector} drawStart The starting point for the shape.
 */
Canvas.prototype.startPreview = function(drawStart) {
	this.currentShape = new Shape(toolbar.tool, drawStart, drawStart, toolbar.lineColour, toolbar.lineWidth, toolbar.fillColour);
	// this._updatePreviewShapeStack();
};

/**
 * Draw a preview of the shape on the preview canvas.
 * @param {Vector} drawEnd The end point for the shape.
 */
Canvas.prototype.previewShape = function (drawEnd) {
	this.clear(this.previewCanvas);
	this.currentShape.resize(drawEnd);
	
	this.currentShape.draw(this.previewLayer);
};

/**
 * Move the shape from the preview canvas to the base canvas.
 * @param {Vector} drawEnd The end point for the shape.
 */
Canvas.prototype.endPreviewShape = function (drawEnd) {
	if (drawEnd)
		this.currentShape.resize(drawEnd);
	
	this.shapeStack.push(this.currentShape);
    this.currentShape.draw(this.baseLayer);
    this.clear(this.previewCanvas);
	this.currentShape = false; // destroy this pointer to the shape
	this.previewShapeStack = new Array();
};

/**
 * Try to select a shape at the given coordinates.
 * Try to select top-most elements first.
 * @param {Vector} selectPos Where selection is being applied.
 */
Canvas.prototype.trySelect = function (selectPos) {
	// first check for an intersection on the preview stack
	for(var j = 0; j < this.previewShapeStack.length; j++) {
		if (this.previewShapeStack[j].intersects(selectPos)) {
			console.log("resize detected");
			// console.log(this.previewShapeStack[j]);
			this.selectedShape.setDragPt(this.previewShapeStack[j].getCenter());
			this.mode = Canvas.moveMode.RESIZE;
			return;
		}
	}
	
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
			this.mode = Canvas.moveMode.MOVE;
			return;
		}
		
		i--;
	}
};

/**
 * Redraw all the objects on the main canvas.
 */
Canvas.prototype.redraw = function () {
	// use function call to not destroy resident shapes
	Utils.clearCanvas(this.baseCanvas);
	
    for (var i = 0; i < this.shapeStack.length; i++) {
    	this.shapeStack[i].draw(this.baseLayer);
    }
};

/**
 * Clear the given canvas. Remove all objects from that canvas. Return true.
 * @param {Object} canvas The canvas.
 * @returns {boolean} True.
 */
Canvas.prototype.clear = function (canvas) {
	// deselect before clear
	if (canvas == this.baseCanvas) 
		this.deselectShape();
	
    Utils.clearCanvas(canvas);
    
    if(canvas === this.baseCanvas) {
    	this.shapeStack = new Array();
    	
    	// update the toolbar
    	toolbar.currentShape = false;
    	toolbar.previewColour()
    } else {
    	this.previewShapeStack = new Array();
    }
    
    return true; // done for debugging purposes
};

/**
 * Erase the currently selected shape
 */
Canvas.prototype.eraseSelectedShape = function () {
	if (this.selectedShape) {
		this.clear(this.previewCanvas);
		this.selectedShape = false; // remove shape before deselecting it to prevent it from being re-added
		this.deselectShape();
	} else {
		alert("No shape selected");
	}
};

/**
 * Select the given shape.
 * @param {Shape} shape The shape to select
 */
Canvas.prototype.selectShape = function (shape) {
	this.selectedShape = shape;
	shape.selected = true;
	
	// remove from the main canvas (will work even if not on main canvas)
	var i = this.shapeStack.length - 1;
	while (i >= 0) {
		if (this.shapeStack[i].uid === this.selectedShape.uid) {
			this.shapeStack.splice(i, 1);
			break;
		}
		
		i--;
	}
	
	// redraw the main canvas
	this.redraw();
	
	// clear the preview canvas
	this.clear(this.previewCanvas);
	
	// add to the preview canvas
	this.selectedShape.draw(this.previewLayer);
	
	// add resize circles to preview canvas
	this._updatePreviewShapeStack();
	this._drawPreviewShapeStack();
	
	// preview the shape on the toolbar preview canvas
	toolbar.setPreview(this.selectedShape);
	
	$("#eraseShapeButton").removeAttr("disabled");
	$("#copyShapeButton").removeAttr("disabled");
};

/**
 * Redraw the preview shape stack.
 */
Canvas.prototype._drawPreviewShapeStack = function () {
	for (var i = 0; i < this.previewShapeStack.length; i++) {
		this.previewShapeStack[i].draw(this.previewLayer);
	}
};

/**
 * Update this.previewShapeStack based on this.selectedShape
 * Throw out the old items in this.previewShapeStack
 */
Canvas.prototype._updatePreviewShapeStack = function () {
	this.previewShapeStack = new Array();
	
	var circles = this.selectedShape.getResizeCircles();
	for (var j = 0; j < circles.length; j++) {
		this.previewShapeStack.push(circles[j]);
	}
};

/**
 * Deselect all shapes.
 */
Canvas.prototype.deselectShape = function () {
	if (this.selectedShape) {
		this.selectedShape.selected = false;
		
		// add the selected shape back to the main canvas
		this.selectedShape.draw(this.baseLayer);
	    this.shapeStack.push(this.selectedShape);
	    this.clear(this.previewCanvas);
	}
	
	this.selectedShape = false;
	this.mode = false;
	
	// update the toolbar
	toolbar.currentShape = false;
	toolbar.previewColour();
	
	$("#eraseShapeButton").attr("disabled", "disabled");
	$("#copyShapeButton").attr("disabled", "disabled");
	$("#applyColoursButton").attr("disabled", "disabled");
};

/**
 * Start the action of moving the selected shape.
 * @param {Vector} mouseStart The starting position of the mouse.
 */
Canvas.prototype.startMoveSelectedShape = function (mouseStart) {
	if (! this.selectedShape) {
		alert("No shape selected")
		return;
	}
	
	this.mouseStart = mouseStart;
	$("#previewLayer").css("cursor", "move");
};

/**
 * End the action of moving the selected shape (or resize).
 * @param {Vector} mouseEnd The final position of the mouse.
 */
Canvas.prototype.endMoveSelectedShape = function (mouseEnd) {
	this.mouseStart = false;
	this.mode = false;
	$("#previewLayer").css("cursor", "pointer");
};



/**
 * Move the currently selected shape by the mouse delta
 * @param {Vector} mouseEnd The current position of the mouse.
 */
Canvas.prototype.moveSelectedShape = function (mouseEnd) {
	if (! this.selectedShape) {
		alert("No shape selected")
		return;
	}
	
	var delta = mouseEnd.sub(this.mouseStart);
	this.mouseStart = mouseEnd;
	
	Utils.clearCanvas(this.previewCanvas); // don't want to remove all objects, just clear it
	
	if (this.mode == Canvas.moveMode.MOVE) {
		this.selectedShape.move(delta);
		
		// update the items that move with it
		for (var i = 0; i < this.previewShapeStack.length; i++) {
			this.previewShapeStack[i].move(delta);
		}
	} else {
		// on resize
		this.selectedShape.resize(mouseEnd);
		this._updatePreviewShapeStack();
	}
	
	this.selectedShape.draw(this.previewLayer);
	this._drawPreviewShapeStack();
};

/**
 * Copy the currently selected shape back onto the canvas.
 */
Canvas.prototype.copySelectedShape = function () {
	var canvasCenter = new Vector(this.baseCanvas.width / 2, this.baseCanvas.height / 2);
	var shapeCenter = this.selectedShape.getCenter();
	
	// offset from original shape
	var delta = new Vector(20, 20);
	
	// vector from shape center to canvas center
	var v = canvasCenter.sub(shapeCenter);
	
	if (! v.isZero()) {
		delta = v.unitVector().mul(delta.size());
	}
	
	var newShape = this.selectedShape.copy();
	newShape.move(delta);
	
	// deselect the old shape
	this.deselectShape();
	
	// select the new shape
	this.selectShape(newShape);
};

/**
 * Change the colouring of the currently selected shape.
 */
Canvas.prototype.recolourSelectedShape = function () {
	if (toolbar.changed && this.selectedShape) {
		// change properties of the selected shape
		this.selectedShape.setColours(toolbar.lineColour, toolbar.lineWidth, toolbar.fillColour);
		
		// redraw the shape on the preview layer
		this.clear(this.previewCanvas);
		this.selectedShape.draw(this.previewLayer);
	} else {
		alert("Error - nothing selected");
	}
}

var t = new Canvas();

/* listeners */

/********************* Toolbar button events ********************/

$(".drawtoolButton").change(function() {
	if (this.value != "select")
		t.deselectShape();
});

$("#clearButton").click(function () {
    t.clear(t.baseCanvas);
    t.clear(t.previewCanvas);
    t.selectedShape = false; // remove shape without deselecting it (so just destroy it)
});

$("#copyShapeButton").click(function() {
	if(t.selectedShape) {
		t.copySelectedShape();
	} else {
		alert("Nothing selected");
	}
});

$("#eraseShapeButton").click(function() {
	t.eraseSelectedShape();
});

$("#applyColoursButton").click(function() {
	t.recolourSelectedShape();
});

/********************* End toolbar button events ********************/

/************************ Canvas mouse events *******************/

$("#previewLayer").mousedown(function (e) {
	var coords = Utils.toCanvasCoords(e);
	
	if (toolbar.tool == "select") {
		t.trySelect(coords);

		if (t.selectedShape) {
			// a move or a resize, or a simple select
			t.startMoveSelectedShape(coords);
		}
	} else {
		// it's a preview if a shape is selected
		t.deselectShape();
		t.startPreview(coords);	
	}
});

$("#previewLayer").mousemove(function (e) {
	var coords = Utils.toCanvasCoords(e);
	$("#canvasCoords").text(coords.toString());
	
	if (t.selectedShape && t.selectedShape.intersects(coords)) {
		if (t.mouseStart) {
			// i.e. the mouse is currently down
			$("#previewLayer").css("cursor", "move");
		} else {
			$("#previewLayer").css("cursor", "pointer");
		}	
	} else {
		$("#previewLayer").css("cursor", "auto");
	}

	if(toolbar.tool == "select" && t.selectedShape && t.mouseStart) {
		// mouse is down and select tool, so it's a move or resize
		t.moveSelectedShape(coords);
	} else if (t.currentShape) {
		// mouse is down and shape being created
        t.previewShape(coords);
    }
});

$("#previewLayer").mouseup(function (e) {
	if (toolbar.tool == "select" && t.selectedShape && t.mouseStart) {
		// mouse was down and select tool
		t.endMoveSelectedShape();
	} else if (t.currentShape) {
   		t.endPreviewShape(Utils.toCanvasCoords(e));
	}
});

// degenerate case of user moving mouse away from canvas while dragging something
$("#previewLayer").mouseout(function (e) {
	if (toolbar.tool == "select" && t.selectedShape && t.mouseStart) {
		// mouse was down and select tool
		t.endMoveSelectedShape();
	} else if (t.currentShape) {
   		t.endPreviewShape();
	}
});

/************************ End canvas mouse events *******************/