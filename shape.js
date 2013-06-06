/** Used to assign unique IDs to shapes. */
var uid = 0;

/**
 * Create a new shape with all the given parameters.
 * @param {String} name The shape name - one of "line", "rect", "circle"
 * @param {Vector} drawStart The starting point of the bounding rect (point a)
 * @param {Vector} drawEnd The ending point of the bounding rect (point b)
 * @param {String} lineColour A hex for the line colour
 * @param {number} lineWidth An int for the line width
 * @param {String} fillColour A hex for the fill colour
 */
function Shape(name, drawStart, drawEnd, lineColour, lineWidth, fillColour) {
	this.name = name;
	this.uid = uid++;
	
	this.setSize(drawStart, drawEnd);
	this.setColours(lineColour, lineWidth, fillColour);
	
	this.selected = false;
}

/**
 * Set the size of the shape by changing the endpoints.
 * @param {Vector} drawStart The new starting point for the shape
 * @param {Vector} drawEnd The new ending point for the shape
 */
Shape.prototype.setSize = function(drawStart, drawEnd) {
	// we're going to order drawStart and drawEnd based on x-coordinates
	// drawStart goes first, with lowest x-coordinate
	if (drawStart.x > drawEnd.x) {
		var t = drawEnd, drawEnd = drawStart, drawStart = t;
	}
	
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
};

/**
 * Set the colours and line width of this shape.
 * @param {String} lineColour A hex for the line colour
 * @param {number} lineWidth An int for the line width
 * @param {String} fillColour A hex for the fill colour
 */
Shape.prototype.setColours = function(lineColour, lineWidth, fillColour) {
	this.lineColour = lineColour, this.lineWidth = lineWidth, this.fillColour = fillColour;
};

/**
 * Move the shape by the given deltas.
 * By that, it means modify the shape.
 * @param {Vector} moveVector The amount by which to move the shape.
 */
Shape.prototype.move = function(moveVector) {
	this.drawStart = this.drawStart.add(moveVector);
	this.drawEnd = this.drawEnd.add(moveVector);
};

/**
 * Return True iff the point intersects the shape.
 * @param {Vector} p The point being tested.
 */
Shape.prototype.intersects = function(p) {
	// rename for ease of use
	var a = this.drawStart, b = this.drawEnd;
	
	switch (this.name) {
		case "circle":
			var rSquared = p.sub(this.getCenter()).sizeSquared();
			return rSquared <= Math.pow(this.radius, 2);
		case "rect":
			return ((a.x < p.x) && (p.x < b.x)) && (((a.y < p.y) && (p.y < b.y)) || ((b.y < p.y) && (p.y < a.y)));
		case "line":
			var closeEnough = 9; // has to be this close to the line
			var dist = util.minLineSegmentDist(this, p);
			return dist <= closeEnough;
	}
};

/**
 * Prepare the given context to start drawing.
 * Called internally only.
 * @param {Object} context
 */
Shape.prototype.prepareDraw = function(context) {
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
Shape.prototype.endDraw = function(context) {
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
 * Draw a selection circle around the given center.
 * Meant to be used internally.
 * @param {Object} context
 * @param {Vector} center The centre of the circle.
 */
Shape.prototype.drawSelectionCircle = function(context, center) {
	var r = 7; //radius
	var c = "#1B94E0"; // line colour
	
	context.save();
	
	context.lineWidth = 1;
	context.strokeStyle = c;
	
	context.beginPath();
	context.arc(center.x, center.y, r, 2 * Math.PI, false);
	context.closePath();
	context.stroke();
	
	context.restore();
};

/**
 * Draw a selection square around the given center.
 * @param {Object} context
 * @param {Vector} center The centre of the square.
 * @param {number} radius Half the side length of the square
 */
Shape.prototype.drawSelectionSquare = function(context, center, radius) {
	var c = "#1B94E0"; // line colour
	
	context.save();
	
	context.lineWidth = 1;
	context.strokeStyle = c;
	
	context.beginPath();
	context.rect(center.x - radius, center.y - radius, 2 * radius, 2 * radius);
	context.closePath();
	context.stroke();
	
	context.restore();
};

/**
 * Draw a line on the given context.
 * @param {Object} context
 */
Shape.prototype.drawLine = function(context) {
	this.prepareDraw(context);
	
	context.beginPath();
	context.moveTo(this.drawStart.x, this.drawStart.y);
	context.lineTo(this.drawEnd.x, this.drawEnd.y);
	context.closePath();
	
	this.endDraw(context);
	
	if (this.selected) {
		this.drawSelectionCircle(context, this.drawStart);
		this.drawSelectionCircle(context, this.drawEnd);
	}
};

/**
 * Draw a circle on the given context.
 * @param {Object} context
 */
Shape.prototype.drawCircle = function(context) {
	this.prepareDraw(context);
	
	var center = this.getCenter();
	context.beginPath();
	context.arc(center.x, center.y, this.radius, 2 * Math.PI, false);
	context.closePath();
	context.fill();
	
	this.endDraw(context);
	
	if (this.selected) {
		this.drawSelectionSquare(context, center, this.radius);
		
		
		
		// this.drawSelectionCircle()
	}
};

/**
 * Draw a rectangle on the given context.
 * @param {Object} context
 */
Shape.prototype.drawRect = function(context) {
	this.prepareDraw(context);
	
	context.beginPath();
	context.rect(this.drawStart.x, this.drawStart.y, this.w, this.h);
	context.closePath();
	context.fill();
	
	this.endDraw(context);
	
	if (this.selected) {
		this.drawSelectionCircle(context, this.drawStart);
		this.drawSelectionCircle(context, this.drawEnd);
		
		// and the 2 other points
		this.drawSelectionCircle(context, new Vector(this.drawStart.x + this.w, this.drawStart.y));
		this.drawSelectionCircle(context, new Vector(this.drawStart.x, this.drawStart.y + this.h));
	}
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
