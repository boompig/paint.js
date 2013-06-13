/**
 * Make sure that all the info from the toolbar is kept up to date
 */

/**
 * Wrapper for the Toolbar.prototype.
 */
function Toolbar() {
	/** how much off the preview canvas border to draw the preview shape */
	this.offset = 2;
	this.changed = false;
	
	/** uninstantiated stuff, it's fine if they are undefined for now */
	this.tool;
	this.fillColour;
	this.lineColour;
	this.lineWidth;	
	/* the shape currently being worked on */
	this.currentShape;
}

/**
 * Update the display which shows which tool is selected.
 * @param {String} toolText The name of the tool.
 */
Toolbar.prototype.setTool = function(toolText) {
	this.tool = toolText;
	
	if (this.tool != "select") {
		// hide when there is no select
		$("#applyColoursButton").hide();
		// shape being worked on has changed
		this.currentShape = false;
	}
	
	this.previewColour(); 
};

/**
 * Set the preview to show details of selected shape.
 * @param {Shape} shape The selected shape.
 */
Toolbar.prototype.setPreview = function(shape) {
	var canvas = $("#colourPreview")[0];
	var context = canvas.getContext("2d");
	
	this.currentShape = shape.copy();
	
	var drawStart = new Vector(this.offset, this.offset);
	var drawEnd = new Vector(canvas.width - this.offset, canvas.height - this.offset);
	this.currentShape.setSize(drawStart, drawEnd);
	
	// change colours accordingly
	$("#lineColour").val(this.currentShape.lineColour.substring(1, this.currentShape.lineColour.length)).change();
	$("#outlineWidth").val(this.currentShape.lineWidth).change();
	
	if (this.currentShape.fillColour)
		$("#fillColour").val(this.currentShape.fillColour.substring(1, this.currentShape.fillColour.length)).change();
	
	Utils.clearCanvas(canvas);
	this.currentShape.draw(context);
	
	// show the applyColoursButton, but disable it
	$("#applyColoursButton").show();
	$("#applyColoursButton").attr("disabled", "disabled");
	
	this.changed = false;
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
	
	if (this.tool == "select" && ! this.currentShape) {
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
	
	if(Utils.isColour(bg)) {
		$(".colourField.fill").css("border-color", "green");
		if (bg != this.fillColour) {
			this.fillColour = bg;
		}
	} else {
		$(".colourField.fill").css("border-color", "red");
		allGood = false;
	}
	
	if(Utils.isColour(outline)) {
		$(".colourField.line").css("border-color", "green");
		if (outline != this.lineColour) {
			this.lineColour = outline;
		}
	} else {
		$(".colourField.line").css("border-color", "red");
		allGood = false;
	}
	
	Utils.clearCanvas(canvas);
	
	if (allGood) {
		// there is a different 'good' configuration from what was there before
		this.changed = true;
		
		// if there is a 'model', we can re-enable the apply button
		if (this.currentShape)
			$("#applyColoursButton").removeAttr("disabled");
			
		var context = canvas.getContext("2d"), shape;
		
		if (this.tool == "select" && this.currentShape) {
			shape = this.currentShape;
			shape.setColours(this.lineColour, this.lineWidth, this.fillColour);
		} else {
			var drawStart = new Vector(this.offset, this.offset);
			var drawEnd = new Vector(canvas.width - this.offset, canvas.height - this.offset);
			shape = new Shape(this.tool, drawStart, drawEnd, this.lineColour, this.lineWidth, this.fillColour);
		}
		
		shape.draw(context);
	} else {
		$("#applyColoursButton").attr("disabled", "disabled");
	}
};
