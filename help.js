/**
 * A help dialog to give suggestions to the user.
 */
function Help() {
	this.shm = false;
	this.ahm = 0; // dirty hack
}

/**
 * Show a help message on how to use the select tool.
 * Only show this message once.
 */
Help.prototype.selectHelpMessage = function () {
	if (! this.shm) {
		this.showMsg("To alter the shape you just created, choose the 'Select' tool in the left toolbar, then select your shape");
		this.shm = true;
	}
};

/**
 * Show a help message on how to use the apply button.
 * Only show this message once.
 */
Help.prototype.applyHelpMessage = function () {
	// dirty hack
	if (this.ahm < 4) {
		this.showMsg("To apply the colour and line width changes, press the 'Apply' button in the right toolbar");
		this.ahm++;
	}
};

/**
 * Show the given message in the help container.
 * @param {String} msg The message.
 */
Help.prototype.showMsg = function(msg) {
	$("#helpMsg").html(msg)
	$("#helpContainer").show();
};

/**
 * Hide the help container.
 */
Help.prototype.hide = function() {
	$("#helpContainer").hide();
};
