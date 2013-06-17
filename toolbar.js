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
	
	this.canvas = $("#colourPreview")[0];
	this.context = this.canvas.getContext("2d");
	
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
	
	if (this.tool == "line" || (this.tool == "select" && this.currentShape && this.currentShape.name == "line")) {
		$(".colourType[value=fill]").attr("disabled", "disabled");
		$(".colourType[value=line]").click();
	} else {
		$(".colourType[value=fill]").removeAttr("disabled");
	}
	
	if (this.tool != "select") {
		// hide when there is no select
		$("#applyColoursButton").hide();
		// shape being worked on has changed
		this.currentShape = false;
		$("#colourBar").show();
	} else {
		$("#colourBar").hide();
	}
	
	this.previewColour(); 
};

/**
 * Set the outline width to the given value.
 * @param {Number} value The value to set it to.
 */
Toolbar.prototype.setOutlineWidth = function (value) {
	// make sure to trigger the callback on outlineWidth
	$("#outlineWidth").val(value).change();
};

/**
 * Set the preview to show details of selected shape.
 * @param {Shape} shape The selected shape.
 */
Toolbar.prototype.setPreview = function(shape) {
	this.currentShape = shape.copy();
	var offset = this.offset + shape.lineWidth;
	
	var drawStart = new Vector(offset, offset);
	var drawEnd = new Vector(this.canvas.width - offset, this.canvas.height - offset);
	this.currentShape.setSize(drawStart, drawEnd);
	
	// change colours accordingly
	$("#lineColour").val(this.currentShape.lineColour.substring(1)); // do not trigger event yet
	$("#outlineWidth").val(this.currentShape.lineWidth).change();
	
	if (this.currentShape.fillColour) {
		// do not trigger events here
		$("#fillColour").val(this.currentShape.fillColour.substring(1));
	}
	
	this.changed = false;
	
	// show the applyColoursButton, but disable it
	$("#applyColoursButton").show().attr("disabled", "disabled");
	
	// now that everything is set, we can trigger the events
	this.setColourSliders(); // update sliders
	$("#outlineWidth").change();
	this.setColourFromSliders(); // trigger colour-related on-change events
};

/**
 * Change the value of the colour field from an external source.
 * @param {String} colour The new colour, without leading hex.
 * @param {boolean} ignoreSliders (optional) True to ignore setting the sliders.
 * @param {String} type (optional) The type - fill or line
 */
Toolbar.prototype.setColourFromExternal = function(colour, ignoreSliders, type) {
	if (! type)
		type = $(".colourType:checked").val();
		
	// force a change action
	$(".colourField." + type).val(colour).change();
	
	if (ignoreSliders !== true)
		this.setColourSliders();
}

/**
 * Change the value of the colour field from the colour sliders.
 */
Toolbar.prototype.setColourFromSliders = function () {
	var hex = Utils.hexFromRGB($("#redSlider").slider("value"), $("#greenSlider").slider("value"), $("#blueSlider").slider("value"));
	this.setColourFromExternal(hex, true);
};

/**
 * Change the value of the colour sliders from the colour field
 */
Toolbar.prototype.setColourSliders = function () {
	var type = $(".colourType:checked").val();
	var colour = $(".colourField." + type).val();
	var rgb = Utils.hexToRGB(colour);
	var sliders = ["#redSlider", "#greenSlider", "#blueSlider"];
	
	for (var i = 0; i < rgb.length; i++) {
		// to keep number of animations low, only do this on change
		if ($(sliders[i]).slider("value") != rgb[i]) {
			$(sliders[i]).slider("value", rgb[i]);
		}
	}
};

/**
 * Preview the shape the user is about to draw. Use all user-selected preferences:
 * 		+ fill colour
 * 		+ line colour
 * 		+ shape
 */
Toolbar.prototype.previewColour = function() {
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
	
	Utils.clearCanvas(this.canvas);
	
	if (allGood) {
		// there is a different 'good' configuration from what was there before
		this.changed = true;
		
		// if there is a 'model', we can re-enable the apply button
		if (this.currentShape)
			$("#applyColoursButton").removeAttr("disabled");
			
		var shape;
		
		if (this.tool == "select" && this.currentShape) {
			shape = this.currentShape;
			shape.setColours(this.lineColour, this.lineWidth, this.fillColour);
		} else {
			var offset = this.offset + this.lineWidth;
			var drawStart = new Vector(offset, offset);
			var drawEnd = new Vector(this.canvas.width - offset, this.canvas.height - offset);
			shape = new Shape(this.tool, drawStart, drawEnd, this.lineColour, this.lineWidth, this.fillColour);
		}
		
		shape.draw(this.context);
	} else {
		$("#applyColoursButton").attr("disabled", "disabled");
	}
};

/**
 * Generate sample colours.
 */
Toolbar.prototype.generateSampleColours = function() {
	var c = Utils.genMainColours(), e;
	for (var i = 0; i < c.length; i++) {
		e = $("<div></div>").addClass("sampleColour").css("background-color", "#" + c[i]);
		$("#sampleColourContainer").append(e);
	}
};
