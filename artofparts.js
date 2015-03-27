$(document).ready(function() {
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/json");

    editor.getSession().on('change', function(e) {
	try {
	    var data = JSON.parse(editor.getValue());
	    if (data) {
		var div = $("#tree");
		div.html("");
		var t = treemap(data, div.width(), div.height());
		append(div, t);
	    }
	} catch (e) {
	    $("#tree").html(e.toString());
	}
    });

    editor.setValue(JSON.stringify([
	{"mike":60},
	{"jon":35},
	{"lisa":60},
    ], null, "\t"));

});
