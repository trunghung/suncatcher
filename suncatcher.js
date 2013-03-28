var webdb = {};
webdb.db = null;
var inited = false;

$(document).ready(onLoad);
function onLoad() {
	location.hash = "";	// Clear all hash history
	init();
}
function init() {
	webdb.open();
	webdb.createTable();
	if (window.location.href.indexOf("debug=1") > 0){
		$("#import").show();
		$("#clear").show();
	}
	onLoginPageShow();
  
	function onLoginPageShow() {
			var $this = $( this ),
			    theme = $this.jqmData("theme") || $.mobile.loader.prototype.options.theme,
			    textVisible = $this.jqmData("textvisible") || $.mobile.loader.prototype.options.textVisible;
			$.mobile.loading( 'show', {
				   text: "Loading...",
				   textVisible: textVisible,
				   theme: theme,
				   textonly: false,
				   html: null
			});
			
		setTimeout(function(){
			$.mobile.changePage( "#home" );
			 $.mobile.loading( 'hide' );
		}, 100);
	}
	$('#time').mobiscroll().date({
		theme: 'android-ics light',
		display: 'inline',
		mode: 'scroller',
		dateOrder: 'mmD ddyy',
		rows: 3
	});
	$('#save').click(function(){
		var val = parseInt($('#value').val());
		if (val >= 0) {
			webdb.addEntry(val, $('#time').mobiscroll('getDate'));
		}
		$('#value').val("");
		$("#add").dialog("close");
	});
	$('div').on('pageshow',function(event, ui) {
		if ($.mobile.activePage.is("#login")) {
			onLoginPageShow();
		}
		else if ($.mobile.activePage.is("#home")) {
			if (!inited) {
				webdb.getAllItems(loadItems);
				inited = true;
			}
		}
		else if ($.mobile.activePage.is("#add")) {
			$('#time').mobiscroll('setDate', new Date(), true);
		}
	});
	$('#clear').click(function() {
		if (confirm("Are you sure you want to delete everything?")) {
			webdb.deleteAllEntries();
		}
	});
	$('#import').click(function(){
		importData();
	});
	$("#history").on("click", "tr button", function(e){
		var target = e.target;
		if (target.dataset.id > 0 && confirm("Delete this entry?")) {
			webdb.deleteEntry(target.dataset.id);
		}
	});
}
/*
function scrollTo(target) {
	var container = $('body'),
		scrollTo = $(target);

	container.animate({
		scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
	 });
}
*/
webdb.open = function() {
  var dbSize = 5 * 1024 * 1024; // 5MB
  webdb.db = openDatabase("Production", "1.0", "Sun Catcher", dbSize);
}

webdb.onError = function(tx, e) {
  alert("There has been an error: " + e.message);
}

webdb.onSuccess = function(tx, r) {
  // re-render the data.
  // loadItems is defined in Step 4a
  webdb.getAllItems(loadItems);
}
webdb.createTable = function() {
  var db = webdb.db;
  db.transaction(function(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS " +
                  "Production(ID INTEGER PRIMARY KEY ASC, total INTEGER, date DATETIME)", []);
  });
}
webdb.addEntry = function(value, date) {
  var db = webdb.db;
  date = (new Date(date)).toISOString();
  db.transaction(function(tx){
    tx.executeSql("INSERT INTO Production(total, date) VALUES (?,?)",
        [value, date],
        webdb.onSuccess,
        webdb.onError);
   });
}

webdb.getAllItems = function(renderFunc) {
  var db = webdb.db;
  db.transaction(function(tx) {
    tx.executeSql("SELECT * FROM Production order by date asc", [], renderFunc,
        webdb.onError);
  });
}
function loadItems(tx, rs) {
	var rowOutput = "", date,
	history = $("#history tbody"),
	previousTotal = 0,
	previousDate = 0,
	diff = 1;
	chartData = [];
	var weekday=new Array(7);
	weekday[0]="Sun ";
	weekday[1]="Mon ";
	weekday[2]="Tue ";
	weekday[3]="Wed ";
	weekday[4]="Thu ";
	weekday[5]="Fri ";
	weekday[6]="Sat ";
	// skip the first value as it has no basis for comparison
	for (var i=0; i < rs.rows.length; i++) {
		row = rs.rows.item(i);
		date = new Date(row.date);
		
		diff = Math.round((date - previousDate)/ 1000 / 60 / 60/24);
		dayProduction = Math.round((row.total - previousTotal)/diff);
		if (i > 0) {
			chartData.push([Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()), dayProduction]);
		}
		rowOutput += ["<tr><td>", [weekday[date.getDay()] + (date.getMonth() + 1) + "/" + date.getDate() , dayProduction + " kWh", row.total + " kWh", '<button href="#" data-id="' + row.ID + '"data-role="button" data-icon="delete" data-iconpos="notext">Delete</button>'].join("</td><td>"), "</td></tr>"].join("");
		
		previousDate = date;
		previousTotal = row.total;
	}
	if (rs.rows.length > 0) {
		var value = [], total = rs.rows.item(rs.rows.length-1).total;
		
		for (var i=0; i < 4; i++) {
			value[3-i] = total % 10;
			total = (total - (total % 10)) / 10;
		}
		$('#value').mobiscroll("setValue", value);
	}
	
	if (history)
		history.html(rowOutput);
	drawChart(chartData);
}

webdb.deleteAllEntries = function() {
  var db = webdb.db;
  db.transaction(function(tx){
    tx.executeSql("DELETE FROM Production", [],
        webdb.onSuccess,
        webdb.onError);
    });
}

webdb.deleteEntry = function(id) {
  var db = webdb.db;
  db.transaction(function(tx){
    tx.executeSql("DELETE FROM Production WHERE ID=?", [id],
        webdb.onSuccess,
        webdb.onError);
    });
}

var chart = null;
var chartData = [];
function drawChart (chartData) {
    if (chart) {
		chart.series[0].setData( chartData);
		return;
    }
    
	chart = new Highcharts.Chart({
		credits : {
			enabled : false
		},
		chart: {
		   renderTo: document.querySelector('#chart'),
		   type: 'spline'
		},
		title: {
		   text: 'Daily Solar Production'
		},
		tooltip: {
			valueSuffix: "kWh"
		},
		legend: {
			enabled: false
		},
		xAxis: {
			type: 'datetime',
			dateTimeLabelFormats: { // don't display the dummy year
				day: '%e. %b',
				month: '%e. %b',
				year: '%b'
			}
		},
		yAxis: {
		   title: {
			  text: 'Production (kWh)'
		   },
		   min: 0
		},
	    
		series: [{
		   name: 'Production',
		   data: chartData
		}]
	});
}
