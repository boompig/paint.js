/**
 * Make sure that all the info from the toolbar is kept up to date
 */

function Toolbar() {
	/** uninstantiated stuff */
	this.tool;
	this.fillColour;
	this.lineColour;
	this.lineWidth;	
	
	// make listeners
	var obj = this;
	
	// change the tool
	$(".drawtoolButton").change(function() {
		obj.setTool(this.value);
	});
	
	// change colour or line width
	$(".userField").each(function(i, elem) {
		$(elem).keyup(function(e) {
			obj.previewColour();
		});
		
		$(elem).change(function(e) {
			obj.previewColour();
		});
	});
	
	// trigger listeners
	$(".drawtoolButton:checked").change();
}

/**
 * Update the display which shows which tool is selected.
 * The mode is given.
 */
Toolbar.prototype.setTool = function(toolText) {
	this.tool = toolText;
	this.previewColour(); 
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
		// console.log("redraw");
		var context = canvas.getContext("2d");
		var offset = 2;
		var drawStart = new Vector(offset, offset);
		var drawEnd = new Vector(canvas.width - offset, canvas.height - offset);
		var shape = new Shape(this.tool, drawStart, drawEnd, this.lineColour, this.lineWidth, this.fillColour);
		shape.draw(context);
		// console.log(context);
	}
};
