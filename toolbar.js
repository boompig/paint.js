/**
 * Make sure that all the info from the toolbar is kept up to date
 */

/**
 * Wrapper for the toolbar.
 */
function Toolbar() {
	/** how much off the preview canvas border to draw the preview shape */
	this.offset = 2;
	
	/** uninstantiated stuff */
	this.tool;
	this.fillColour;
	this.lineColour;
	this.lineWidth;	
	
	/* make listeners */
	var obj = this;
	
	$(".drawtoolButton").change(function() {
		obj.setTool(this.value);
	});
	
	$(".userField").each(function(i, elem) {
		$(elem).keyup(function(e) {
			obj.previewColour();
		});
		
		$(elem).change(function(e) {
			obj.previewColour();
		});
	});
	
	/* trigger listeners */
	$(".drawtoolButton:checked").change();
}

/**
 * Update the display which shows which tool is selected.
 * @param {String} toolText The name of the tool.
 */
Toolbar.prototype.setTool = function(toolText) {
	this.tool = toolText;
	this.previewColour(); 
};

/**
 * Set the preview to show details of selected shape.
 * @param {Shape} shape The selected shape.
 */
Toolbar.prototype.setPreview = function(shape) {
	var canvas = $("#colourPreview")[0];
	var context = canvas.getContext("2d");
	
	var newShape = shape.copy();
	console.log(newShape);
	
	var drawStart = new Vector(this.offset, this.offset);
	var drawEnd = new Vector(canvas.width - this.offset, canvas.height - this.offset);
	newShape.setSize(drawStart, drawEnd);
	
	util.clearCanvas(canvas);
	newShape.draw(context);
};

/**
 * Preview the shape the user is about to draw. Use all user-selected preferences:
 * 		+ fill colour
 * 		+ line colour
 * 		+ shape
 */
Toolbar.prototype.previewColour = function() {
	var canvas = $("#colourPreview")[0];
	var allGood = true;
	var bg = "#" + $(".colourField.fill").val();
	var outline = "#" + $(".colourField.line").val();
	var w = $("#outlineWidth").val();
	
	if (this.tool == "select") {
		allGood = false;
	}
	
	if (isNaN(w) || parseInt(w) < 0 || parseInt(w) > parseInt($("#outlineWidth").attr("max"))) {
		$("#outlineWidth").css("border-color", "red");
		allGood = false;
	} else {
		$("#outlineWidth").css("border-color", "green");
		if (w != this.lineWidth) {
			this.lineWidth = parseInt(w);
			// console.log("changed line width");
		} 
	}
	
	if(util.isColour(bg)) {
		$(".colourField.fill").css("border-color", "green");
		if (bg != this.fillColour) {
			this.fillColour = bg;
		}
	} else {
		$(".colourField.fill").css("border-color", "red");
		allGood = false;
	}
	
	if(util.isColour(outline)) {
		$(".colourField.line").css("border-color", "green");
		if (outline != this.lineColour) {
			this.lineColour = outline;
		}
	} else {
		$(".colourField.line").css("border-color", "red");
		allGood = false;
	}
	
	util.clearCanvas(canvas);
	
	if (allGood) {
		var context = canvas.getContext("2d");
		var drawStart = new Vector(this.offset, this.offset);
		var drawEnd = new Vector(canvas.width - this.offset, canvas.height - this.offset);
		var shape = new Shape(this.tool, drawStart, drawEnd, this.lineColour, this.lineWidth, this.fillColour);
		shape.draw(context);
	}
};
