/**
 * Create a new vector (or point) object in 2D space.
 * @param {number} x The x-coordinate
 * @param {number} y The y-coordinate
 */
function Vector(x, y) {
	this.x = x;
	this.y = y;
}

/**
 * Return the squared magnitude of this vector.
 */
Vector.prototype.sizeSquared = function() {
	return Math.pow(this.x, 2) + Math.pow(this.y, 2);
};

/**
 * Return the magnitude of this vector.
 */
Vector.prototype.size = function() {
	return Math.sqrt(this.sizeSquared());
};

/**
 * Return the dot-product of this vector and v2.
 * @param {Vector} v2 The other vector.
 */
Vector.prototype.dotProduct = function(v2) {
	return (v2.x * this.x) + (v2.y * this.y);
};

/**
 * Return scalar projection of this vector onto v2.
 * @param {Vector} v2 The other vector.
 */
Vector.prototype.projectScalar = function(v2) {
	// `this <dot> v2` / || v2 ||
	return Math.abs(this.dotProduct(v2)) / v2.size();
};

/**
 * Return the resulting vector after performing `this - v2`
 * @param {Vector} v2 The other vector.
 */
Vector.prototype.sub = function(v2) {
	return new Vector(this.x - v2.x, this.y - v2.y);
};

/**
 * Return the resulting vector after performing `this + v2`
 * @param {Vector} v2 The other vector.
 */
Vector.prototype.add = function(v2) {
	return new Vector(this.x + v2.x, this.y + v2.y);
};

/**
 * Scalar multiply this vector by c
 * @param {number} c The scalar.
 */
Vector.prototype.mul = function(c) {
	return new Vector(c * this.x, c * this.y);
};

/**
 * Return the vector perpendicular to this one.
 */
Vector.prototype.perp = function() {
	return new Vector(this.y, -1 * this.x);
};

Vector.prototype.toString = function() {
	return "(" + Math.round(this.x) + ", " + Math.round(this.y) + ")"; 
};

/**
 * Return True iff this vector is the zero vector.
 */
Vector.prototype.isZero = function () {
	return this.x === 0 && this.y === 0;
};
