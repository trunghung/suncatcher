var webdb;
var webdbold = WebDBOld("Sun Catcher");
var inited = false;
var _lastRecordDate = "";

$(document).ready(onLoad);
function onLoad() {
	webdb = WebDB("Record", "Sun Catcher", "record", {success: onSuccess, error: onError});
	location.hash = "";	// Clear all hash history
	init();
}
function onSuccess(tx, r) {
	webdb.getAllItems(loadItems);
}
function onError(tx, err) {
	alert(err.message);
}
var _lastModDate = 0;
function syncWithServer() {
	var user = new StackMob.User({ username: 'hung' });
	var Record = StackMob.Model.extend({ schemaName: 'record' });
	var Records = StackMob.Collection.extend({ model: Record });
	var records = new Records();
	var q = new StackMob.Collection.Query();
	q.gt("lastmoddate", _lastModDate);
	records.query(q, {
	    success: function(models) {
		   console.debug(model.toJSON()); //JSON array of matching Todo objects
	    },
	    error: function(models, response) {
		   console.debug(response);
	    }
	});
}
function bindUI() {
	$("body").delegate(".logout", "click", function(e){
		StackMob.getLoggedInUser( {
			success: function(username){
				var user = new StackMob.User({ username: username});
				user.logout({
					success : function(model) {
						$.mobile.changePage("#login");
					},
					error : function(model, response) {
						$.mobile.changePage("#login");
						console.log("Oops there was an error in loging out"); 
					}
				});
			}
		});
		var panel = $(e.currentTarget).closest("#menu-panel");
		if (panel)
			panel.panel( "close" );
	});
	$("#login .loginBtn").click(function(e){
		var elLogin = $("#login")[0];
		if (elLogin.dataset.view == "login") {
			var username = $("#login .username").val().toLowerCase(),
			password = $("#login .password").val();
			var user = new StackMob.User({ username: username, password: password });
			user.login(true, {
				success: function(model) {
					$.mobile.changePage("#home");
				},
				error: function(model, response) {
					alert("wrong username or password");
				}
			});
		}
		else {
			elLogin.dataset.view = "login";
		}
	});
	$("#login .registerBtn").click(function(e) {
		$("#login").attr("data-view", "signup");
	});
	
	$("body").on("click", "#save", function(){
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
	$('#import').click(function(){
		var panel = $(e.currentTarget).closest("#menu-panel");
		if (panel)
			panel.panel( "close" );
		importData();
	});
	$("#history").on("click", "tr button", function(e){
		var target = e.target;
		if (target.dataset.id > 0 && confirm("Delete this entry?")) {
			webdb.deleteEntry(target.dataset.id);
		}
	});
	$("body").delegate(".export", "click", function(e){
		webdbold.getAllItems(exportItems);
	});
	$("body").delegate(".clear", "click", function(e){
		var panel = $(e.currentTarget).closest("#menu-panel");
		if (panel)
			panel.panel( "close" );
		if (confirm("Are you sure you want to delete everything?")) {
			webdb.deleteAllEntries();
		}
	});
	$("body").delegate(".sync", "click", function(e){
		syncWithServer();
	});
}
function exportItems(ts, rs) {
	var i, row, date;
	for (var i=0; i < rs.rows.length; i++) {
		row = rs.rows.item(i);
		save(row.total, row.date);
	}
}
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
		StackMob.isLoggedIn({
			yes: function(username){
				$.mobile.changePage("#home");
				$.mobile.loading('hide');
			},
			no: function(){
				$.mobile.loading('hide');
			}
		});
	}, 100);
}
function init() {
	server.init();
	onLoginPageShow();
	bindUI();
  
	
	$('#time').mobiscroll().date({
		theme: 'android-ics light',
		display: 'inline',
		mode: 'scroller',
		dateOrder: 'mmD ddyy',
		rows: 3
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

function loadItems(tx, rs) {
	var rowOutput = "", date,
	history = $("#history tbody"),
	previousTotal = 0,
	previousDate = 0,
	diff = 1;
	chartData = [];
	var weekday = ["Sun ", "Mon ", "Tue ", "Wed ", "Thu ", "Fri ", "Sat "];
	// skip the first value as it has no basis for comparison
	for (var i=0; i < rs.rows.length; i++) {
		row = rs.rows.item(i);
		date = new Date(row.date);
		if (_lastRecordDate < row.date) {
			_lastRecordDate = row.date;
		}
		
		diff = Math.round((date - previousDate)/ 1000 / 60 / 60/24);
		if (diff > 0) {
			dayProduction = Math.round((row.total - previousTotal)/diff);
			if (i > 0) {
				chartData.push([Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()), dayProduction]);
			}
			rowOutput += ["<tr><td>", [weekday[date.getDay()] + (date.getMonth() + 1) + "/" + date.getDate() , dayProduction + " kWh", row.total + " kWh", '<button href="#" data-id="' + row.ID + '"data-role="button" data-icon="delete" data-iconpos="notext">Delete</button>'].join("</td><td>"), "</td></tr>"].join("");
			
			previousDate = date;
			previousTotal = row.total;
		}
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