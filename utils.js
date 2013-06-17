function Utils() {
	// empty constructor
}

/**
 * Return true iff the colour given is a valid hex colour.
 * Taken from: http://stackoverflow.com/q/8027423/755934
 * @param {String} colour The given colour
 * @returns {boolean}
 */
Utils.isColour = function(colour) {
	var pattern = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
	return pattern.test(colour);
};

/**
 * Clear the given canvas.
 */
Utils.clearCanvas = function(canvas) {
	canvas.width = canvas.width;
};

/**
 * Return a vector, relative to the canvas, of where the event was triggered.
 * Assumed that the event target is the canvas.
 * @returns {Vector}
 */
Utils.toCanvasCoords = function(evt) {
    return new Vector(evt.pageX - $(evt.target).offset().left, evt.pageY - $(evt.target).offset().top);
};

/**
 * Return a random integer in the range [a, b). If b not specified, range is [0, a).
 * @param {Number} a (optional) Hard lower limit
 * @param {Number} b Soft upper limit
 */
Utils.randInt = function(a, b) {
	if (b === undefined) {
		b = a;
		a = 0;
	}
	
	return Math.floor(Math.random() * (b - a)) + a;
};

/**
 * Return a random hex colour as string.
 * @returns {String}
 */
Utils.randomColour = function() {
	var letters = "0123456789ABCDEF".split("");
    var colour = '#';
    for (var i = 0; i < 6; i++) {
        colour += letters[this.randInt(0, letters.length)];
    }
    
    return colour;
};

/**
 * Return the minimum distance from p to the line segment `line`
 * @param {Shape} line
 * @param {Vector} p
 */
Utils.minLineSegmentDist = function(line, p) {
	// rename for ease of use
	var a = line.drawStart, b = line.drawEnd;
	
	// let v be the vector from a to b
	var v = b.sub(a);
	// let r be the vector from a to p
	var r = p.sub(a);
	// let l be the length of vector v
	var l = v.size();
	
	if (l == 0) return r.size();
	
	var t = r.projectScalar(v, r) / l;
	
	if (t < 0) {
		// before a
		return r.size();
	} else if (t > 1) {
		// after b
		return p.sub(b).size();
	} else {
		// between a and b
		// a + t(b - a)
		var closestPt = a.add(b.sub(a).mul(t));
		return closestPt.sub(p).size();
	}
};

/**
 * Return the hex colour taken from the given red, green, and blue values in decimal.
 * No prepended hashtag.
 * Taken from: http://jqueryui.com/slider/#colorpicker, slightly modded
 * @param {Number} r Red colour value
 * @param {Number} g Green colour value
 * @param {Number} b Blue colour value
 * @returns {String}
 */
Utils.hexFromRGB = function(r, g, b) {
	 var hex = [
		Number(r).toString( 16 ),
		Number(g).toString( 16 ),
		Number(b).toString( 16 )
	];
	
	for (var i = 0; i < hex.length; i++) {
		if (hex[i].length === 1 )
			hex[i] = "0" + hex[i];
	}
	
	return hex.join("").toUpperCase();
};

/**
 * Convert given hex string to array of colours [red, green, blue] where each entry is a number.
 * No prepended hashtag.
 * @param {String} hex
 * @returns {Array}
 */
Utils.hexToRGB = function (hex) {
	// force to 6 chars
	if (hex.length === 3)
		hex = "0" + hex.split("").join("0");
		
	return [
		parseInt(hex.substring(0, 2), 16),
		parseInt(hex.substring(2, 4), 16),
		parseInt(hex.substring(4, 6), 16)
	];
};
