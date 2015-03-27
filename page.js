$(document).ready(function() {
    var data = [
	[
	    [
		{name:"rsmith",value:510}
	    ],
	    [
		{name:"chilton",value:150},
		{name:"tmerrill",value:110},
		{name:"hollyl",value:110}
	    ],
	    [
		{name:"mdtommyd",value:60},
		{name:"joshg",value:60},
		{name:"mchackett",value:60},
		{name:"clarkh",value:60}
	    ],
	    [
		{name:"jkelly",value:60},
		{name:"garyl",value:60},
		{name:"sean",value:60}
	    ],
	    [
		{name:"aneubert",value:35},
		{name:"lhealy",value:35},
		{name:"rchrastil",value:35}
	    ]
	]
    ];
    setData(data);

    google.load("visualization", "1", {packages:["treemap"], callback: function() {
	console.log(google.visualization.Query);
	var spread = 'https://docs.google.com/spreadsheet/ccc?key=0AjuCCsEokTDhdEptX3g0YVZFeHBuNWhTUWh1SE9mdVE#gid=0';
	var query = new google.visualization.Query(spread);	    
	query.send(function(response) {
	    if (response.isError()) {
		return;
	    }
	    var data = response.getDataTable();
	    
	    var outdata = [];
	    for (var r = 1; r < data.getNumberOfRows(); r++) {
		var item = {}
		item.name = data.getValue(r, 0);
		item.value = data.getValue(r, 2)
		if (item.name) {
		    outdata.push(item);
		    console.log(item.name + ":" + item.value);
		}
	    }
	    //setData(outdata);
	});
    }});
});

function setData(data) {
    var div = $("#treemap");
    var t = treemap(data, div.width(), div.height());
    div.html("");
    append(div, t);

    $(".leaf").mouseenter(function() {
	$(this).addClass("leaf-highlight");
    }).mouseleave(function() {
	$(this).removeClass("leaf-highlight");
    }).click(function() {
	
    });
}

function oldload() {
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