/**
 * Make sure that all the info from the toolbar is kept up to date
 */

/**
 * Wrapper for the Toolbar.prototype.
 */
function Toolbar() {
	/** how much off the preview canvas border to draw the preview shape */
	this.offset = 2;
	
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
 * Show the apply button.
 * @param {boolean} show True to show button. If not set, show the button.
 */
Toolbar.prototype.showApplyButton = function(show) {
	if (show === undefined || show === true) {
		$("#applyColoursButton").show();
	} else {
		$("#applyColoursButton").hide();
		help.hide();
	}
	
	// return the toolbar object to allow for chaining
	return this;
};

/**
 * Enable the apply button.
 * @param {boolean} enable True to enable button. If not set, enable the button.
 */
Toolbar.prototype.enableApplyButton = function(enable) {
	if (enable === undefined || enable === true) {
		$("#applyColoursButton").button({disabled: 0});
		help.applyHelpMessage();
	} else {
		$("#applyColoursButton").button({disabled: true});
		help.hide();
	}
	
	// return the toolbar object to allow for chaining
	return this;
};

/**
 * Update the display which shows which tool is selected.
 * @param {String} toolText The name of the tool.
 */
Toolbar.prototype.setTool = function(toolText) {
	this.tool = toolText;
	
	if (this.tool == "line" || (this.tool == "select" && this.currentShape && this.currentShape.name == "line")) {
		// $(".colourType[value=fill]").button({disabled: true});
		$(".colourType[value=fill]").button({disabled: true});
		$(".colourType[value=line]").click();
	} else {
		$(".colourType[value=fill]").button({disabled: false});
		// $(".colourType[value=fill]").button({disabled: false});
	}
	
	if (this.tool != "select") {
		// hide when there is no select
		this.showApplyButton(false);
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
	$("#outlineWidth").val(this.currentShape.lineWidth);
	
	if (this.currentShape.fillColour) {
		// do not trigger events here
		$("#fillColour").val(this.currentShape.fillColour.substring(1));
	}
	
	// now that everything is set, we can trigger the events
	this.setColourSliders(); // update sliders
	$("#lineWidthSlider").slider("value", this.currentShape.lineWidth);
	this.setColourFromSliders(); // trigger colour-related on-change events
	
	// dirty hack (corrects for other hack in setColourFromExternal)
	this.enableApplyButton(false);
};

/**
 * Change the value of the colour field from an external source.
 * @param {String} colour The new colour, without leading hex.
 * @param {boolean} ignoreSliders (optional) True to ignore setting the sliders.
 */
Toolbar.prototype.setColourFromExternal = function(colour, ignoreSliders) {
	var type = $(".colourType:checked").val();
	$(".colourField." + type).val(colour);
	
	if (ignoreSliders !== true)
		this.setColourSliders();
		
	// dirty hack
	if(this.tool == "selected" && this.currentShape)
		this.enableApplyButton();
		
	this.previewColour();
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
	// checks for errors in input
	var allGood = true;
	
	// read in configuration
	var bg = "#" + $(".colourField.fill").val();
	var outline = "#" + $(".colourField.line").val();
	var w = $("#outlineWidth").val();
	
	// means nothing selected
	if (this.tool == "select" && ! this.currentShape) {
		allGood = false;
	}
	
	// line width
	if (isNaN(w) || parseInt(w) < 0 || parseInt(w) > parseInt($("#outlineWidth").attr("max"))) {
		$("#outlineWidth").css("border-color", "red");
		allGood = false;
	} else {
		$("#outlineWidth").css("border-color", "green");
		if (w != this.lineWidth) {
			this.lineWidth = parseInt(w);
		} 
	}
	
	// fill colour
	if(Utils.isColour(bg)) {
		$(".colourField.fill").css("border-color", "green");
		if (bg != this.fillColour) {
			this.fillColour = bg;
		}
	} else {
		$(".colourField.fill").css("border-color", "red");
		allGood = false;
	}
	
	// line colour
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
		var shape;
		
		if (this.tool == "select" && this.currentShape) {
			this.enableApplyButton().showApplyButton();
		
			shape = this.currentShape;
			
			// should be negative if shape.lineWidth is less than new
			var diff = shape.lineWidth - this.lineWidth;
			var vDiff = new Vector(diff, diff);
			
			// have to resize shape :(
			shape.setSize(shape.drawStart.sub(vDiff), shape.drawEnd.add(vDiff));
			
			shape.setColours(this.lineColour, this.lineWidth, this.fillColour);
		} else {
			var offset = this.offset + this.lineWidth;
			var drawStart = new Vector(offset, offset);
			var drawEnd = new Vector(this.canvas.width - offset, this.canvas.height - offset);
			shape = new Shape(this.tool, drawStart, drawEnd, this.lineColour, this.lineWidth, this.fillColour);
		}
		
		shape.draw(this.context);
	} else {
		this.enableApplyButton(false);
	}
};

/**
 * Generate sample colours, by adding fixed-size divs to #sampleColourContainer div.
 */
Toolbar.prototype.generateSampleColours = function() {
	var c = Utils.genMainColours(), e;
	for (var i = 0; i < c.length; i++) {
		e = $("<div></div>").addClass("sampleColour").css("background-color", "#" + c[i]);
		$("#sampleColourContainer").append(e);
	}
};
