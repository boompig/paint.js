/**
 * Create a new shape with all the given parameters.
 * @param {String} name The shape name - one of "line", "rect", "circle"
 * @param {Vector} drawStart The starting point of the bounding rect (point a)
 * @param {Vector} drawEnd The ending point of the bounding rect (point b)
 * @param {String} lineColour A hex for the line colour
 * @param {Number} lineWidth An int for the line width
 * @param {String} fillColour A hex for the fill colour
 */
function Shape(name, drawStart, drawEnd, lineColour, lineWidth, fillColour) {
	this.name = name;
	this.uid = Shape.uid++;
	
	this.resizePoints = new Array();
	// setColours must be before setSize
	this.setColours(lineColour, lineWidth, fillColour);
	this.setSize(drawStart, drawEnd);
	this.selected = false;
}

/** 
 * Used to assign unique IDs to shapes. 
 * @returns {Number}
 */
Shape.uid = 0;

/**
 * Radius of selection circles.
 * @returns {Number}
 */
Shape.resizeCircleRadius = 7;

/**
 * Colour of selection circle outline.
 * @returns {String} 
 */
Shape.resizeCircleColour = "#1B94E0"; // light blue

/**
 * @returns {Number}
 */
Shape.resizeCircleLineWidth = 2;

/**
 * Create a resize circle around the given center.
 * @param {Vector} center The center of the circle.
 * @param {Shape} parent The parent of this resize circle.
 * @returns {Shape} A resize circle with a pointer to its parent.
 */
Shape.createResizeCircle = function (center, parent) {
	var rVector = new Vector(Shape.resizeCircleRadius, Shape.resizeCircleRadius);
	var a = center.sub(rVector), b = center.add(rVector);
	return new Shape("circle", a, b, Shape.resizeCircleColour, Shape.resizeCircleLineWidth);;
};

/**
 * Const governing what to return if a point intersects the resize circle
 * @returns {Number}
 */
Shape.intersectsResizeCircle = 2;

/**
 * Return the selection circles for this shape.
 */
Shape.prototype.getResizeCircles = function () {
	var circles = new Array();
	
	if (this.selected) {
		for(var i = 0; i < this.resizePoints.length; i++) {
			circles.push(Shape.createResizeCircle(this.resizePoints[i], this));
		}
	}
	
	return circles;
};

/**
 * Set the size of the shape by changing the endpoints.
 * @param {Vector} drawStart The new starting point for the shape
 * @param {Vector} drawEnd The new ending point for the shape
 */
Shape.prototype.setSize = function(drawStart, drawEnd) {
	this.drawStart = drawStart, this.drawEnd = drawEnd;
	
	switch (this.name) {
		case "rect":
			this.w = drawEnd.x - drawStart.x;
			this.h = drawEnd.y - drawStart.y;
			break;
		case "circle":
			// the radius will be the maximum of horizontal and vertical radius
			var radiusVector = this.getCenter().sub(drawEnd);
			this.radius = Math.max(Math.abs(radiusVector.x), Math.abs(radiusVector.y));
			break;
		default: // line
			// do nothing
			break;
	}
	
	// update the resize points
	this._makeResizePoints();
};

/**
 * Set the dragPt for this shape. The dragPt should be one of the resizePoints. 
 * Call this method as part of a resize.
 * @param {Vector} dragPt The new point being dragged.
 */
Shape.prototype.setDragPt = function(dragPt) {
	var found = false, i;
	
	// find the index of dragPt in resizePoints
	for(i = 0; i < this.resizePoints.length; i++) {
		if (this.resizePoints[i].equals(dragPt)) {
			found = true;
			break;
		}
	}
	
	if (! found) {
		alert("anchor is not one of the resize points");
		return false;
	}
	
	this.drawEnd = dragPt;
	// point opposite the anchor
	this.drawStart = this.resizePoints[(i + this.resizePoints.length / 2) % this.resizePoints.length];;
};

/**
 * Resize the shape by dragging the dragPt relative to the anchor.
 * @param {Vector} dragPt The point being dragged.
 */
Shape.prototype.resize = function (dragPt) {
	this.setSize(this.drawStart, dragPt);
};

/**
 * Set the colours and line width of this shape.
 * @param {String} lineColour A hex for the line colour
 * @param {Number} lineWidth An int for the line width
 * @param {String} fillColour A hex for the fill colour
 */
Shape.prototype.setColours = function(lineColour, lineWidth, fillColour) {
	this.lineColour = lineColour, this.fillColour = fillColour;
	
	if (lineWidth !== this.lineWidth && this.selected) {
		this.lineWidth = lineWidth;
		this._makeResizePoints(); // re-calculate resize points
	} else {
		this.lineWidth = lineWidth;
	}
};

/**
 * Move the shape by the given deltas.
 * By that, it means modify the shape.
 * @param {Vector} moveVector The amount by which to move the shape.
 */
Shape.prototype.move = function(moveVector) {
	this.drawStart = this.drawStart.add(moveVector);
	this.drawEnd = this.drawEnd.add(moveVector);
	
	for(var i = 0; i < this.resizePoints.length; i++) {
		this.resizePoints[i] = this.resizePoints[i].add(moveVector);
	}
};

/**
 * Create the resize points for this shape.
 * Recreate the array, so don't even try to keep another pointer to it
 * Use only internally
 */
Shape.prototype._makeResizePoints = function() {
	var a = this.drawStart, b = this.drawEnd;
	
	switch (this.name) {
		case "line":
			this.resizePoints = [a, b];
			break;
		case "circle":
			var r = this.radius + this.lineWidth + 1; // some breathing room around the circle
			var rVector = new Vector(r, r);
			var c = this.getCenter();
			a = c.sub(rVector), b = c.add(rVector);
			
			// fall through
		case "rect":
			this.resizePoints = new Array();
		
			// not using halfway points for now
			this.resizePoints.push(a);
			// this.resizePoints.push(new Vector((a.x + b.x) / 2, a.y));
			this.resizePoints.push(new Vector(b.x, a.y));
			// this.resizePoints.push(new Vector(b.x, (a.y + b.y) / 2));
			this.resizePoints.push(b);
			// this.resizePoints.push(new Vector((a.x + b.x) / 2, b.y));
			this.resizePoints.push(new Vector(a.x, b.y));
			// this.resizePoints.push(new Vector(a.x, (a.y + b.y) / 2));
			break;
	}
};

/**
 * Return True iff the point intersects the shape.
 * @param {Vector} p The point being tested.
 */
Shape.prototype.intersects = function(p) {
	// rename for ease of use
	var a = this.drawStart, b = this.drawEnd;
	var closeEnough = 9; // has to be this close to the line
	
	switch (this.name) {
		case "circle":
			// special case for very small shape
			var minRadiusSq = closeEnough;
			var rSquared = p.sub(this.getCenter()).sizeSquared();
			return rSquared <= Math.max(minRadiusSq, Math.pow(this.radius, 2));
		case "rect":
			// rectangle size shall be measured as size of vector from a to b
			// if that vector's size < 9 px, then this is a small shape
			if (a.sub(b).size() < closeEnough) {
				var rSquared = p.sub(this.getCenter()).sizeSquared();
				return rSquared <= closeEnough; // within 3 px of the center diagonally
			} else {
				return (((a.x <= p.x) && (p.x <= b.x)) || ((b.x <= p.x) && (p.x <= a.x))) && (((a.y <= p.y) && (p.y <= b.y)) || ((b.y <= p.y) && (p.y <= a.y)));
			}
		case "line":
			var dist = Utils.minLineSegmentDist(this, p);
			return dist <= closeEnough;
	}
};

/**
 * Prepare the given context to start drawing.
 * Called internally only.
 * @param {Object} context
 */
Shape.prototype._prepareDraw = function(context) {
	context.save();
	if (this.fillColour)
		context.fillStyle = this.fillColour;
	context.strokeStyle = this.lineColour;
	context.lineWidth = this.lineWidth;
};

/**
 * Finish the drawing.
 * Called internally only.
 * @param {Object} context
 */
Shape.prototype._endDraw = function(context) {
	if (this.fillColour)
		context.fill();
	// lineWidth = 0 still seems to create a border. To stop that, don't do a stroke at the end
	if (this.lineWidth > 0)
		context.stroke();
	context.restore();
};

/**
 * Draw the current shape on the given context.
 * @param {Object} context
 */
Shape.prototype.draw = function(context) {
	switch(this.name) {
		case "line":
			this.drawLine(context);
			break;
		case "rect":
			this.drawRect(context);
			break;
		case "circle":
			this.drawCircle(context);
			break;
	}	
};

/**
 * Draw a selection square around the given center.
 * @param {Object} context
 * @param {Vector} center The centre of the square.
 * @param {Number} radius Half the side length of the square
 */
Shape.prototype._drawSelectionSquare = function(context, center, radius) {
	var c = "#1B94E0"; // line colour
	
	context.save();
	
	context.lineWidth = 1;
	context.strokeStyle = c;
	
	var rVector = new Vector(radius, radius);
	var a = center.sub(rVector), b = center.add(rVector);
	
	// create the square / rectangle
	context.beginPath();
	// context.rect(this.drawStart.x, this.drawStart.y, v.x, v.y);
	context.rect(center.x - radius, center.y - radius, radius  * 2, radius * 2);
	context.closePath();
	context.stroke();
	
	context.restore();
};

/**
 * Draw a line on the given context.
 * @param {Object} context
 */
Shape.prototype.drawLine = function(context) {
	this._prepareDraw(context);
	
	context.beginPath();
	context.moveTo(this.drawStart.x, this.drawStart.y);
	context.lineTo(this.drawEnd.x, this.drawEnd.y);
	context.closePath();
	
	this._endDraw(context);
};

/**
 * Draw a circle on the given context.
 * @param {Object} context
 */
Shape.prototype.drawCircle = function(context) {
	this._prepareDraw(context);
	
	var center = this.getCenter();
	context.beginPath();
	context.arc(center.x, center.y, this.radius, 2 * Math.PI, false);
	context.closePath();
	
	this._endDraw(context);
	
	if (this.selected) {
		this._drawSelectionSquare(context, center, this.radius + this.lineWidth + 1);
	}
};

/**
 * Draw a rectangle on the given context.
 * @param {Object} context
 */
Shape.prototype.drawRect = function(context) {
	this._prepareDraw(context);
	
	context.beginPath();
	context.rect(this.drawStart.x, this.drawStart.y, this.w, this.h);
	context.closePath();
	
	this._endDraw(context);
};

/**
 * Return a copy of this shape.
 * @returns Shape
 */
Shape.prototype.copy = function() {
	return new Shape(this.name, this.drawStart, this.drawEnd, this.lineColour, this.lineWidth, this.fillColour);
};

/**
 * Return the center of this shape.
 * @returns Vector
 */
Shape.prototype.getCenter = function() {
	return this.drawStart.add(this.drawEnd).mul(.5);
};
