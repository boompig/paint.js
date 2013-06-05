function Shape(name, drawStart, drawEnd, lineColour, lineWidth, fillColour) {
	// we're going to order drawStart and drawEnd based on x-coordinates
	// drawStart goes first, with lowest x-coordinate
	if (drawStart.x > drawEnd.x) {
		var t = drawEnd;
		drawEnd = drawStart;
		drawStart = t;
	}
	
	this.name = name;
	this.drawStart = drawStart;
	this.drawEnd = drawEnd;
	this.lineColour = lineColour;
	this.lineWidth = lineWidth;
	
	if (fillColour)
		this.fillColour = fillColour
	
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
}

/**
 * Return True iff the point intersects the shape.
 * @param p The point being tested.
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
			console.log(dist);
			return dist <= closeEnough;
	}
};

Shape.prototype.prepareDraw = function(context) {
	context.save();
	if (this.fillColour)
		context.fillStyle = this.fillColour;
	context.strokeStyle = this.lineColour;
	context.lineWidth = this.lineWidth;
};

Shape.prototype.endDraw = function(context) {
	context.stroke();
	context.restore();
};

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

Shape.prototype.drawLine = function(context) {
	this.prepareDraw(context);
	
	context.beginPath();
	context.moveTo(this.drawStart.x, this.drawStart.y);
	context.lineTo(this.drawEnd.x, this.drawEnd.y);
	context.closePath();
	
	this.endDraw(context);
};

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