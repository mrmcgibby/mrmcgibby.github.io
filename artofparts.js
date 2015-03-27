function Box(x, y, name){
    this.x = x;
    this.y = y;
    this.name = name;
    this.isleaf = function() {
	return $.isNumeric(x) && $.isNumeric(y);
    }
}

function testmap(treemap) {
    return _.map(treemap, function (node) {
	if (node instanceof Box) {
	    return node.x*node.y;
	} else {
	    return testmap(node);
	}
    });
}

function Person(obj) {
    var pair = _.pairs(obj)[0];
    this.name = pair[0];
    this.value = pair[1];
}

function treemap(tree, x, y, xfirst) {
    var ratio = (xfirst ? x : y) / size(tree);
    return _.map(tree, function (node) {
	if (node instanceof Array) {
	    var tm;
	    if (xfirst) {
		tm = treemap(node, size(node) * ratio, y, !xfirst);
		return new Box(tm, y);
	    } else {
		tm = treemap(node, x, size(node) * ratio, !xfirst);
		return new Box(x, tm);
	    }
	} else {
	    var person = new Person(node);
	    if (xfirst) {
		return new Box(person.value * ratio, y, person.name);
	    } else {
		return new Box(x, person.value * ratio, person.name);
	    }
	}
    });
}

function size(node) {
    return _.reduce(node, function (memo, node) {
	if (node instanceof Array) {
	    return memo + size(node);
	} else {
	    var person = new Person(node)
	    return memo + person.value;
	}
    }, 0);
}

function append(div, tree, widthfirst) {
    _.each(tree, function (node) {
	var ndiv = $("<div></div>").appendTo(div);
	if (node.name) {
	    ndiv.html(node.name);
	}
	if (widthfirst) {
	    ndiv.css("float","left");
	}
	if (node.isleaf()) {
	    var randomColor = Math.floor(Math.random()*16777215).toString(16);
	    ndiv.css("background-color", randomColor);
	    ndiv.width(node.x).height(node.y);
	} else {
	    if (widthfirst) {
		ndiv.width(node.x[0].x);
		append(ndiv, node.x, !widthfirst);
	    } else {
		append(ndiv, node.y, !widthfirst);
		ndiv.height(node.y[0].y);
	    }
	}
    });
}

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
