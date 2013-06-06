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
	// we're going to order drawStart and drawEnd based on x-coordinates
	// drawStart goes first, with lowest x-coordinate
	if (drawStart.x > drawEnd.x) {
		var t = drawEnd;
		drawEnd = drawStart;
		drawStart = t;
	}
	
	this.name = name;
	this.lineColour = lineColour;
	this.lineWidth = lineWidth;
	this.uid = uid++;
	
	if (fillColour)
		this.fillColour = fillColour
	
	this.setSize(drawStart, drawEnd);
}

/**
 * Set the size of the shape by changing the endpoints.
 * @param {Vector} drawStart The new starting point for the shape
 * @param {Vector} drawEnd The new ending point for the shape
 */
Shape.prototype.setSize = function(drawStart, drawEnd) {
	this.drawStart = drawStart;
	this.drawEnd = drawEnd;
	
	switch (this.name) {
		case "rect":
			this.w = drawEnd.x - drawStart.x;
			this.h = drawEnd.y - drawStart.y;
			break;
		case "circle":
			// the center will be the middle between drawStart and drawEnd
			this.center = new Vector((drawEnd.x + drawStart.x) / 2, (drawEnd.y + drawStart.y) / 2);
			
			// the radius will be the maximum of horizontal and vertical radius
			this.radius = Math.max(Math.abs(this.center.x - drawEnd.x), Math.abs(this.center.y - drawEnd.y));
			break;
		default:
			// do nothing
			break;
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
	
	if (this.name == "circle") {
		this.center = this.center.add(moveVector);
	}
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
			var rSquared = p.sub(this.center).sizeSquared();
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
 */
Shape.prototype.endDraw = function(context) {
	context.stroke();
	context.restore();
};

/**
 * Draw the current shape on the given context.
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
};

/**
 * Draw a circle on the given context.
 * @param {Object} context
 */
Shape.prototype.drawCircle = function(context) {
	this.prepareDraw(context);
	
	context.beginPath();
	context.arc(this.center.x, this.center.y, this.radius, 2 * Math.PI, false);
	context.closePath();
	context.fill();
	
	this.endDraw(context);
};

Shape.prototype.drawRect = function(context) {
	this.prepareDraw(context);
	
	context.beginPath();
	context.rect(this.drawStart.x, this.drawStart.y, this.w, this.h);
	context.closePath();
	context.fill();
	
	this.endDraw(context);
};

/**
 * Return a copy of this shape.
 */
Shape.prototype.copy = function() {
	return new Shape(this.name, this.drawStart, this.drawEnd, this.lineColour, this.lineWidth, this.fillColour);
};
