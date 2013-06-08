/**
 * Create a new vector (or point) object in 2D space.
 * @param {Number} x The x-coordinate
 * @param {Number} y The y-coordinate
 */
function Vector(x, y) {
	this.x = x, this.y = y;
}

/**
 * Return the squared magnitude of this vector.
 * @returns {Number}
 */
Vector.prototype.sizeSquared = function() {
	return Math.pow(this.x, 2) + Math.pow(this.y, 2);
};

/**
 * Return the magnitude of this vector.
 * @returns {Number}
 */
Vector.prototype.size = function() {
	return Math.sqrt(this.sizeSquared());
};

/**
 * Return the dot-product of this vector and v2.
 * @param {Vector} v2 The other vector.
 * @returns {Number}
 */
Vector.prototype.dotProduct = function(v2) {
	return (v2.x * this.x) + (v2.y * this.y);
};

/**
 * Return scalar projection of this vector onto v2.
 * @param {Vector} v2 The other vector.
 * @returns {Number}
 */
Vector.prototype.projectScalar = function(v2) {
	// `this <dot> v2` / || v2 ||
	return Math.abs(this.dotProduct(v2)) / v2.size();
};

/**
 * Return the resulting vector after performing `this - v2`
 * @param {Vector} v2 The other vector.
 * @returns {Vector}
 */
Vector.prototype.sub = function(v2) {
	return new Vector(this.x - v2.x, this.y - v2.y);
};

/**
 * Return the resulting vector after performing `this + v2`
 * @param {Vector} v2 The other vector.
 * @returns {Vector}
 */
Vector.prototype.add = function(v2) {
	return new Vector(this.x + v2.x, this.y + v2.y);
};

/**
 * Scalar multiply this vector by c
 * @param {Number} c The scalar.
 * @returns {Vector}
 */
Vector.prototype.mul = function(c) {
	return new Vector(c * this.x, c * this.y);
};

/**
 * Return the string representation of this Vector
 * @returns {String}
 */
Vector.prototype.toString = function() {
	return "(" + Math.round(this.x) + ", " + Math.round(this.y) + ")"; 
};

/**
 * Return True iff this vector is the zero vector.
 * @returns {boolean}
 */
Vector.prototype.isZero = function () {
	return this.x === 0 && this.y === 0;
};

/**
 * Return a vector copy of itself
 * @returns {Vector}
 */
Vector.prototype.copy = function () {
	return new Vector(this.x, this.y);
};

/**
 * Return true iff this vector is the same as v2
 * @param {Vector} v2 Another vector.
 * @returns {bool}
 */
Vector.prototype.equals = function(v2) {
	return this.x == v2.x && this.y == v2.y;
};

/**
 * Return a new unit vector in the same direction as this vector.
 * @returns {Vector}
 */
Vector.prototype.unitVector = function() {
	var v = this.copy();
	
	if (v.isZero())
		return v;
	else
		return v.mul(1 / v.size());
};
