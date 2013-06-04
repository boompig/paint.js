/**
 * A class governing drawing on a Kinetic.js rendition of an HTML5 canavs.
 */
function KineticDrawer() {
	this.mode = this.modes.none;
	this.shapeStack = new Array();
	
	/* now come a bunch of var definitions */
	this.drawStart;
	this.tool;
	this.lineWidth;
	this.fillColour;
	this.lineColour;
	
	// main stage, this is the wrapper for everything
	this.stage = new Kinetic.Stage({
		container: "canvasContainer",
		width: 600,
		height: 400,
	});
	
	this.activeLayer = new Kinetic.Layer({
		id : "activeLayer"
	});
	this.stage.add(this.activeLayer);
	
	// preview layer goes on top of active layer
	this.previewLayer = new Kinetic.Layer({
		id : "previewLayer"
	});
	this.stage.add(this.previewLayer);
	
	// access this object inside JQuery callback
	var obj = this;
	
	$("#canvasContainer canvas").last().mousedown(function(e) {
		var pos = obj.toCanvasCoords(e);
		
		if (obj.mode == obj.modes.none) {
			obj.startDrawing(pos);
		} else {
			obj.endDrawing(pos);
		}
	});
	
	$("#canvasContainer canvas").last().mousemove(function(e){
		if (obj.mode == obj.modes.preview) {
			var pos = obj.toCanvasCoords(e);
			obj.previewDrawing(pos);
		}
	});
};

/**
 * Behaviour of mouse events is determined by modes.
 * 		+ none - nothing is pressed, calmly move around the canvas
 * 		+ preview - the canvas has been pressed, and now the mouse position acts as the end point for the drawing
 */
KineticDrawer.prototype.modes = {
	"none" : 0,
	"preview" : 1
};

/**
 * Available tools to draw with
 */
KineticDrawer.prototype.tools = [
	"line",
	"circle",
	"rect"
];

/**
 * Convert event mouse coordinates to coordinates relative to the canvas.
 * Event target is assumed to be canvas.
 * Return a dictionary of the format:
 * 		{"x" : <x-coord>, "y" : <y-coord>}
 */
KineticDrawer.prototype.toCanvasCoords = function(event) {
	return {"x" : Math.round(event.pageX - $(event.target).offset().left), 
			"y" : Math.round(event.pageY - $(event.target).offset().top)};
};

/**
 * Return a random integer in the range [a, b). If b not specified, range is [0, a).
 * @param a (optional) Hard lower limit
 * @param b Soft upper limit
 */
KineticDrawer.prototype.randInt = function(a, b) {
	if (b === undefined) {
		b = a;
		a = 0;
	}
	
	return Math.floor(Math.random() * (b - a)) + a;
};

/**
 * Return a random hex colour as string.
 */
KineticDrawer.prototype.randomColour = function() {
	var letters = "0123456789ABCDEF".split("");
    var colour = '#';
    for (var i = 0; i < 6; i++ ) {
        colour += letters[this.randInt(0, letters.length)];
    }
    
    return colour;
};

/**
 * Return string representation of coordinates. Used in debugging.
 */
KineticDrawer.prototype.coordsToStr = function(coords) {
	return "(" + coords.x + "," + coords.y + ")";
};

/**
 * 
 */
KineticDrawer.prototype.startDrawing = function(drawStart) {
	// record where drawing is started
	this.drawStart = drawStart;
	
	// generate the random parameters for this drawing
	// this.tool = this.tools[this.randInt(0, this.tools.length)];
	this.tool = "rect";
	this.lineWidth = 3; //guaranteed to be random
	this.fillColour = this.randomColour();
	
	if (this.tool == this.tools.line)
		this.lineColour = this.randomColour();
	else
		this.lineColour = "#000";
	
	this.mode = this.modes.preview;
	
	var drawEnd = {"x" : drawStart.x + 1, "y" : drawStart.y + 1};
	// this.previewDrawing(drawEnd);
};

/**
 * Preview the drawing starting at `this.drawStart` and ending at `drawEnd`.
 */
KineticDrawer.prototype.previewDrawing = function(drawEnd) {
	if (this.previewLayer.getChildren().length == 0 || this.tool == "circle") {
		this.drawShape(drawEnd, this.previewLayer);
	} else {
		var shape = this.previewLayer.get("#previewShape")[0];
		
		
		var w = drawEnd.x - this.drawStart.x;
		var h = drawEnd.y - this.drawStart.y;
		
		shape.setWidth(w);
		shape.setHeight(h);
		this.previewLayer.draw();
	}
	// clear the preview layer
	// this.clear(this.previewLayer);
	
	// can actually do this quite nicely
	
	// create the drawing on the active layer
	
};

/**
 * Draw something going from `this.drawStart` to `drawEnd`. 
 */
KineticDrawer.prototype.endDrawing = function(drawEnd) {
	// move the shape from the preview layer to the active layer
	
	this.drawShape(drawEnd, this.activeLayer);
	this.clear(this.previewLayer);
	
	// change the mode
	this.mode = this.modes.none;
};

KineticDrawer.prototype.drawRandomShape = function() {
	// record where drawing is started
	this.drawStart = {
		"x" : this.randInt(0, this.stage.getWidth() - 25),
		"y" : this.randInt(0, this.stage.getHeight() - 25)
	};
	
	// generate the random parameters for this drawing
	this.tool = this.tools[this.randInt(0, this.tools.length)];
	this.lineWidth = 3; //guaranteed to be random
	this.fillColour = this.randomColour();
	
	if (this.tool == "line")
		this.lineColour = this.randomColour();
	else
		this.lineColour = "#000";
	
	this.mode = this.modes.none;
	
	var drawEnd = {
		"x" : this.drawStart.x + Math.random() * 50 + 25,
		"y" : this.drawStart.y + (Math.random() - .5) * 50 + 25
	};
	
	this.drawShape(drawEnd, this.activeLayer);
};

/**
 * Draw a shape on the canvas non-deterministically.
 * If drawStart and drawEnd are not determined, randomly generate them.
 * If the shape name is not determined, randomly pick one.
 * If fill, line colours, strokeWidth are not determined, pick them randomly.
 */
KineticDrawer.prototype.drawShape = function(drawEnd, layer) {
	var shape, id;
	
	// undoing doesn't apply to preview layer
	if (layer === this.activeLayer) {
		id = "shape_" + this.tool + "_" + this.shapeStack.length;
		this.shapeStack.push(id);
	} else {
		id = "previewShape";
	}
	
	switch (this.tool) {
		case "circle":
			var r = Math.min(Math.abs(drawEnd.x - this.drawStart.x) / 2, Math.abs(drawEnd.y - this.drawStart.y) / 2)
		
			shape = new Kinetic.Circle({
				x : this.drawStart.x + r,
				y : this.drawStart.y + r,
				radius : r,
				fill : this.fillColour,
				stroke: this.lineColour,
				strokeWidth : this.lineWidth,
				id : id
			});
			break;
		case "rect":
			shape = new Kinetic.Rect({
				x : this.drawStart.x,
				y : this.drawStart.y,
				width : drawEnd.x - this.drawStart.x,
				height : drawEnd.y - this.drawStart.y,
				fill : this.fillColour,
				stroke: this.lineColour,
				strokeWidth : this.lineWidth,
				id : id
			});
			break;
		case "line":
			shape = new Kinetic.Line({
				points : [this.drawStart.x, this.drawStart.y, drawEnd.x, drawEnd.y],
				stroke : this.lineColour,
				strokeWidth : this.lineWidth,
				id : id
			});
			break;
		default:
			alert("Unknown shape name: " + this.tool);
			break;
	}
	
	// var obj = this;
	// if (layer === this.previewLayer) {
		// console.log("attached event");
// 		
		// shape.on("mousemove", function(evt) {
			// console.log(evt.targetNode);
			// // console.log("hello world");
			// // obj.previewDrawing(obj.toCanvasCoords(e));
		// });
	// }
	
	layer.add(shape);
	
	// redraw the layer
	layer.draw();
};

/**
 * Undo the latest drawing action.
 */
KineticDrawer.prototype.undoDraw = function() {
	if (this.shapeStack.length > 0) {
		var id = this.shapeStack.pop();
		
		var shape = this.activeLayer.get("#" + id)[0];
		shape.remove();
		
		// redraw
		this.activeLayer.draw();
	} else {
		alert("Nothing to undo");
	}
};

/**
 * Clear the canvas, or the given layer.
 * 
 */
KineticDrawer.prototype.clear = function(layer) {
	if (! layer) {
		layer = this.activeLayer;
	}
	
	var shapeList = layer.getChildren();
	
	while (shapeList.length > 0) {
		shapeList.pop().remove();
	}
	
	if (layer === this.activeLayer)
		this.shapeStack = new Array();
	
	// redraw to reflect changes
	layer.draw();
};