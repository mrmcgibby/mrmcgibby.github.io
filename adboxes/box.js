// var boxes = [
//     {width:24, height:10, payment:38, clicks:693},
//     {width:15, height:20, payment:75, clicks:1106},
//     {width:21, height:18, payment:114, clicks:182},
//     {width:15, height:15, payment:190, clicks:1902},
//     {width:10, height:27, payment:93, clicks:791},
//     {width:27, height:22, payment:203, clicks:116},
//     {width:20, height:15, payment:25, clicks:1381},
//     {width:16, height:20, payment:30, clicks:318},
//     {width:14, height:13, payment:126, clicks:1535},
//     {width:18, height:26, payment:90, clicks:1587},
//     {width:16, height:18, payment:106, clicks:768},
//     {width:16, height:12, payment:35, clicks:1172},
//     {width:14, height:28, payment:135, clicks:690},
//     {width:16, height:20, payment:76, clicks:1546},
//     {width:15, height:28, payment:54, clicks:1654},
//     {width:16, height:10, payment:192, clicks:1685},
//     {width:17, height:23, payment:56, clicks:10},
//     {width:22, height:18, payment:139, clicks:1938},
//     {width:12, height:25, payment:75, clicks:554},
//     {width:16, height:25, payment:48, clicks:337},
//     {width:24, height:18, payment:199, clicks:1282}
// ];

var boxes = [];
for (var i = 0; i < 1000; i++)
{
    // var box_array = [{
    // 	width:20,
    // 	height:20,
    // 	payment:1,
    // 	clicks:1
    // },{
    // 	width:20,
    // 	height:40,
    // 	payment:1,
    // 	clicks:1
    // },{
    // 	width:40,
    // 	height:20,
    // 	payment:1,
    // 	clicks:1
    // },{
    // 	width:40,
    // 	height:40,
    // 	payment:1,
    // 	clicks:1
    // }];
    // var box = box_array[Math.floor(Math.random()*box_array.length)];
    var area = Math.pow(Math.random(), 5)*18+2;
    var aspects = [0.5, 0.75, 1, 1.5, 2];
    //    var aspects = [0.5, 1, 2];
    var aspect = aspects[Math.floor(Math.random()*aspects.length)];
    var box = {
	width:area/Math.sqrt(aspect),
	height:area*Math.sqrt(aspect),
	payment:1,
	clicks:1
    };
    boxes[boxes.length] = box;
}

var metric = 100;

function normalize(box_list)
{
    var total_payment = _.reduce(box_list, function(memo, box){
	return memo + box.payment;
    }, 0);
    var total_clicks = _.reduce(box_list, function(memo, box){
	return memo + box.clicks;
    }, 0);
    _.each(box_list, function(box) {
	var new_area = box.payment / total_payment + box.clicks / total_clicks;
	var adj = Math.sqrt(new_area)*10;
	box.width = box.width / adj;
	box.height = box.height / adj;
    });
}

function box_size(box)
{
    // TODO use payment and clicks
    var area = box.width*box.height;
    return area;
}

function plot_box(box)
{
    var adbox = $("<div class='adbox'></div>");
    adbox.css("background-color", getRandomColor());
    adbox.css("top", box.top);
    adbox.css("left", box.left);
    adbox.css("height", box.height);
    adbox.css("width", box.width);
    $("#mainbox").append(adbox);
}

function plot(box_list)
{
    var mainbox = $("#mainbox");
    //var whole_box = {left:0,top:0,width:500,height:500};
    var whole_box = {left:0,top:0,width:mainbox.width(),height:mainbox.height()};
    function center(box)
    {
	return {
	    x:box.left + box.width / 2,
	    y:box.top + box.height / 2
	};
    }
    var whole_center = center(whole_box);
    
    function place(box, free_box)
    {
	if ((box.width > free_box.width) ||
	    (box.height > free_box.height))
	{
	    return undefined;
	}
	
	var rval = { width: box.width, height: box.height };
	// var between = function(x, a, b) {
	//     return x >= a && x <= b;
	// }
	var free = [];

	var a = free_box.left + free_box.width / 2;
	var c = free_box.top + free_box.height / 2;

	var x = whole_center.x;
	var y = whole_center.y;

	var e = free_box.top + box.height;
	var f = free_box.top + free_box.height - box.height;
	var g = free_box.left + box.width;
	var h = free_box.left + free_box.width - box.width;

	if (x >= a) {
	    box.left = h;
	    if (y <= c) {
		// 2
		box.top = free_box.top;
	    } else {
		// 4
		box.top = f;
	    }
	} else {
	    box.left = free_box.left;
	    if (y <= c) {
		// 8
		box.top = free_box.top;
	    } else {
		// 6
		box.top = f;
	    }
	}
    }

    function free_boxes(box, free_box)
    {
	return _.filter([{ // 1 2
	    left:box.left,
	    top:free_box.top,
	    width:free_box.left+free_box.width-box.left,
	    height:box.top-free_box.top
	},{ // 3 4
	    left:box.left+box.width,
	    top:box.top,
            width:free_box.left+free_box.width-box.left-box.width,
	    height:free_box.top+free_box.height-box.top
	},{ // 5 6
	    left:free_box.left,
	    top:box.top+box.height,
	    width:box.left-free_box.left+box.width,
	    height:free_box.top+free_box.height-box.top-box.height
	},{ // 7 8
	    left:free_box.left,
	    top:free_box.top,
	    width:box.left-free_box.left,
	    height:box.top+box.height-free_box.top
	}], function(box){
	    return box.width > 0.001 && box.height > 0.001;
	});
    }

    var box = _.first(box_list);
    var cx = center(whole_box).x;
    var cy = center(whole_box).y;
    box.left = cx - box.width / 2;
    box.top = cy - box.height / 2;
    free_list = free_boxes(box, whole_box);

    _.each(_.rest(box_list), function(box){
	var free_box = _.min(free_list, function(free_box) {
	    place(box, free_box);
	    var x = box.left + box.width/2 - cx;
	    var y = box.top + box.height/2 - cy;
	    return Math.pow(x,metric)+Math.pow(y,metric);
	});
	
	place(box, free_box);

	free_list = _.without(free_list, free_box);
	free_list = free_list.concat(free_boxes(box, free_box));	
    });

    // find the bounding box of all the boxes
    var bounds = _.reduce(box_list, function(memo, box){
	return {
	    left:_.min([memo.left, box.left]),
	    top:_.min([memo.top, box.top]),
	    right:_.max([memo.right, box.left+box.width]),
	    bottom:_.max([memo.bottom, box.top+box.height])
	};
    },{
	left:mainbox.width()/2,
	top:mainbox.height()/2,
	right:mainbox.width()/2,
	bottom:mainbox.height()/2
    });

    // TODO adjust the box

    _.each(box_list, plot_box);
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

$(document).ready(function(){
    var sorted = _.sortBy(boxes, function(box){
	return -box_size(box);
    });
    normalize(sorted);
    plot(sorted);
    console.log(sorted);
    var index = 1;
});
