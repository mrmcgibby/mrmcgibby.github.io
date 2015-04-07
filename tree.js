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
	    if (xfirst) {
		return new Box(node.value * ratio, y, node.name);
	    } else {
		return new Box(x, node.value * ratio, node.name);
	    }
	}
    });
}

function desired(node, xfirst) {
    var p = node.points[0];
    return xfirst ? p.x : p.y;
}

function actual(node, xfirst) {
    return xfirst ? node.x : node.y;
}

function size(node) {
    return _.reduce(node, function (memo, node) {
	if (node instanceof Array) {
	    return memo + size(node);
	} else {
	    return memo + node.value;
	}
    }, 0);
}

function append(div, tree, widthfirst) {
    _.each(tree, function (node) {
	var ndiv = $("<div></div>").appendTo(div);
	if (node.name) {
	    $("<div></div>").appendTo(ndiv).addClass("subleaf").html(node.name);
	    ndiv.attr("person", node.name);
	}
	if (widthfirst) {
	    ndiv.css("float","left");
	}
	if (node.isleaf()) {
	    ndiv.addClass("leaf");
	    ndiv.width(node.x-2).height(node.y-2);
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

function rand(a, b) {
    a = a || 0;
    b = b || 0;
    var low = Math.min(a,b);
    var high = Math.max(a,b);
    var r = Math.random();
    return low+r*r*r*(high-low);
}

function random_data(count) {
    return _.map(_.range(count), function(index) {
	return {
	    name:"box"+index,
	    value:Math.floor(rand(20, 100)),
	    points:[
		{x:Math.random(),y:Math.random()},
		{x:Math.random(),y:Math.random()},
		{x:Math.random(),y:Math.random()}
	    ]
	};
    });
}
