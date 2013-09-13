/**
 * Create a new vector (or point) object in 2D space.
 * @param {Number} x The x-coordinate
 * @param {Number} y The y-coordinate
 */
function Vector(x, y) {
    "use strict";

    this.x = x;
    this.y = y;
}

/**
 * Return the squared magnitude of this vector.
 * @returns {Number}
 */
Vector.prototype.sizeSquared = function () {
    "use strict";
    return Math.pow(this.x, 2) + Math.pow(this.y, 2);
};

/**
 * Return the magnitude of this vector.
 * @returns {Number}
 */
Vector.prototype.size = function () {
    "use strict";
    return Math.sqrt(this.sizeSquared());
};

/**
 * Return the dot-product of this vector and v2.
 * @param {Vector} v2 The other vector.
 * @returns {Number}
 */
Vector.prototype.dotProduct = function (v2) {
    "use strict";
    return (v2.x * this.x) + (v2.y * this.y);
};

/**
 * Return scalar projection of this vector onto v2.
 * @param {Vector} v2 The other vector.
 * @returns {Number}
 */
Vector.prototype.projectScalar = function (v2) {
    // `this <dot> v2` / || v2 ||
    "use strict";
    return Math.abs(this.dotProduct(v2)) / v2.size();
};

/**
 * Return the resulting vector after performing `this - v2`
 * @param {Vector} v2 The other vector.
 * @returns {Vector}
 */
Vector.prototype.sub = function (v2) {
    "use strict";
    return new Vector(this.x - v2.x, this.y - v2.y);
};

/**
 * Return the resulting vector after performing `this + v2`
 * @param {Vector} v2 The other vector.
 * @returns {Vector}
 */
Vector.prototype.add = function (v2) {
    "use strict";
    return new Vector(this.x + v2.x, this.y + v2.y);
};

/**
 * Scalar multiply this vector by c
 * @param {Number} c The scalar.
 * @returns {Vector}
 */
Vector.prototype.mul = function (c) {
    "use strict";
    return new Vector(c * this.x, c * this.y);
};

/**
 * Return the string representation of this Vector
 * @returns {String}
 */
Vector.prototype.toString = function () {
    "use strict";
    return "(" + Math.round(this.x) + ", " + Math.round(this.y) + ")";
};

/**
 * Return True iff this vector is the zero vector.
 * @returns {boolean}
 */
Vector.prototype.isZero = function () {
    "use strict";
    return this.x === 0 && this.y === 0;
};

/**
 * Return a vector copy of itself
 * @returns {Vector}
 */
Vector.prototype.copy = function () {
    "use strict";
    return new Vector(this.x, this.y);
};

/**
 * Return true iff this vector is the same as v2
 * @param {Vector} v2 Another vector.
 * @returns {bool}
 */
Vector.prototype.equals = function (v2) {
    "use strict";
    return this.x === v2.x && this.y === v2.y;
};

/**
 * Return a new unit vector in the same direction as this vector.
 * @returns {Vector}
 */
Vector.prototype.unitVector = function () {
    "use strict";
    var v = this.copy();

    if (v.isZero()) {
        return v;
    }

    return v.mul(1 / v.size());
};
