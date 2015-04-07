var cities = {};
var values = {};
var states = {};

$(document).ready(function() {
    $.getJSON("tree/balance/flat.json", function (data) {
	setData(data);

	// opentip
	Opentip.styles.person = { 
	    stem: false,
	    borderColor: "black",
	    borderWidth: 1,
	    background: "#f2f2f2",
	    fixed: true
	};
	Opentip.defaultStyle = "person"
	
	google.load("visualization", "1", {packages:["treemap"], callback: function() {
	    console.log(google.visualization.Query);
	    var spread = 'https://docs.google.com/spreadsheet/ccc?key=0AjuCCsEokTDhdEptX3g0YVZFeHBuNWhTUWh1SE9mdVE#gid=0';
	    var query = new google.visualization.Query(spread);	    
	    query.send(function(response) {
		if (response.isError()) {
		    return;
		}
		var data = response.getDataTable();
		
		outdata = [];
		var total = 0;
		for (var r = 1; r < data.getNumberOfRows(); r++) {
		    var name = data.getValue(r, 0);
		    if (name) {
			var value = data.getValue(r, 2);
			values[name] = value;
			total += value;
			var city = data.getValue(r, 7);
			cities[name] = city;
			var state = data.getValue(r, 8);
			states[name] = state;
			//console.log('{"name":"%s","value":"%s"},\n', name, value);
			outdata.push({name:name,value:value});
		    }
		}
		$("#total_worth").html("$"+total);
		$("#sq_in_worth").html("$"+Math.round(total / 5250 * 100)/100);
		$("#total_backers").html(outdata.length);
		$("#days_remain").html(Math.floor((Date.parse("Apr 18, 2015 8:59 AM MDT")-Date.now())/1000/60/60/24));
		outdata = _.sortBy(outdata, function(x) { return -x.value; });
		console.log(JSON.stringify(outdata));

		$(".leaf").each(function() {
		    total = _.reduce(_.values(values), function (a,b) { return a+b; });
		    var name = $(this).attr("person");
		    var value = values[name];
		    var city = cities[name];
		    var state = states[name];
		    var text = "<strong>"+name+"</strong><br>"+
			"Pledged: $"+value+"<br>"+
			"Owns: "+Math.round(value/total*1000)/10+"%<br>"+
			"From: "+city+", "+state;
		    $(this).opentip(text, { delay: 0.5 });
		});
	    });
	}});
    });
});

function setData(data) {
    $("#treemap").html("").css({position:'relative'});
    _.each(data, function (box) {
	var ndiv = $("<div></div>").appendTo($("#treemap"));
	ndiv.addClass("leaf");
	$("<div></div>").appendTo(ndiv).addClass("subleaf").html(box.name);
	ndiv.css({left:box.x,top:box.y,position:'absolute'});
	ndiv.width(box.width-2).height(box.height-2);
	ndiv.attr("person", box.name);
    });

//    var t = treemap(data, div.width(), div.height());
//    append(div, t);

    $(".leaf").mouseenter(function() {
	$(this).addClass("leaf-highlight").animate({opacity:0.0});
    }).mouseleave(function() {
	$(this).removeClass("leaf-highlight").animate({opacity:0.8});
    });
}

function drawChart() {
    var query = new google.visualization.Query(
	'https://docs.google.com/spreadsheet/ccc?key=0AjuCCsEokTDhdEptX3g0YVZFeHBuNWhTUWh1SE9mdVE#gid=0');
    query.send(handleQueryResponse);
}

function handleQueryResponse(response) {
    if (response.isError()) {
	alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
	return;
    }

    var data = response.getDataTable();
        
    tree = new google.visualization.TreeMap(document.getElementById('treemap'));
    
    tree.draw(data, {
	minColor: '#a2a2a2',
	midColor: '#a2a2a2',
	maxColor: '#a2a2a2',
	headerHeight: 0,
	fontColor: 'black',
	fontSize: '12',
	showScale: false,
	fontFamily: 'Oswald',
	generateTooltip: showFullTooltip	
    });
    
    function showFullTooltip(row, size, value) {
	return '<div style="background:#fff; padding:15px; border-style: solid; border-width: 1px; border-color: #a2a2a2;">' +
		      '<span style="font-family:Oswald; font-size:20px; font-weight:300;"><strong>'
		      + data.getValue(row, 0) +
		      '</strong>' + '<br>' + 'Pledged: $' + data.getValue(row, 2) + '<br>' + 
		      'Owns: ' + data.getValue(row, 4) + '%' + '<br>' + 
		      'From: ' + data.getValue(row, 7) + ', ' + data.getValue(row, 8) + '<br>' + 
		      data.getValue(row, 6) + '<br>' + '</span></div>';
	
    }
}

function myNumbers() {
    return '<div style="background:#fff; padding:15px; border-style: solid; border-width: 1px; border-color: #a2a2a2;">' +
		  '<span style="font-family:Oswald; font-size:20px; font-weight:300;"><b>'
		  + data.getValue(row, 0) + '</span></div>';
    
}
