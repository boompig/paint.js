function KineticDrawer() {
	this.stage = new Kinetic.Stage({
		container: "canvasContainer",
		width: 600,
		height: 400,
	});
	
	// this.counter = 0;
};

/**
 * Return a random hex colour as string.
 * Taken from this SOF question: http://stackoverflow.com/q/1484506/755934
 */
KineticDrawer.prototype.randomColour = function() {
	var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
};

KineticDrawer.prototype.drawCircleLayer = function() {
	var layer = new Kinetic.Layer();
	var shapeIndex = Math.floor(Math.random() * 3);
	var colour = this.randomColour()
	var shape;
	var drawStart = {
		"x" : Math.random() * this.stage.getWidth() - 25,
		"y" : Math.random() * this.stage.getHeight() - 25
	};
	
	switch (shapeIndex) {
		case 0:
			var r = Math.random() * 50 + 25;
		
			shape = new Kinetic.Circle({
				x : drawStart.x + r,
				y : drawStart.y + r,
				radius : r,
				fill : colour,
				strokeWidth : 3
			});
			break;
		case 1:
			shape = new Kinetic.Rect({
				x : drawStart.x,
				y : drawStart.y,
				width : Math.random() * 50 + 25,
				height : Math.random() * 50 + 25,
				fill : colour,
				strokeWidth : 3
			});
			break;
		case 2:
			shape = new Kinetic.Line({
				points : [drawStart.x, drawStart.y, drawStart.x + Math.random() * 50 + 25, drawStart.y + Math.random() * 50 + 25],
				stroke : colour,
				strokeWidth : 3
			});
			break;
	}
	
	layer.add(shape);
	this.stage.add(layer);
};

/**
 * Undo the latest drawing action.
 */
KineticDrawer.prototype.undoDraw = function() {
	var id = this.counter;
	var layerList = this.stage.getLayers();
	if (layerList.length > 0) {
		layerList[layerList.length - 1].destroy(); // remove top layer
	} else {
		alert("Nothing to undo");
	}
};

KineticDrawer.prototype.clear = function() {
	this.stage.removeChildren();
};