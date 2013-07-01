var webdb = null;
var server = null;
var appName = "Sun Catcher";
var webdbold = WebDBOld("Sun Catcher");
var inited = false;
var _lastRecordDate = "";

$(document).bind( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
});
$(document).ready(function(){
	webdb = WebDB("Record", appName, {success: onSuccess, error: onError});
	location.hash = "";	// Clear all hash history
	server = new Server(appName);
	server.init(window.location.href.indexOf("debug=1") < 0);
	bindUI();
	onLoginPageShow();
});

function onSuccess(tx, r) {
	webdb.getAllItems(loadItems);
}
function onError(tx, err) {
	alert(err.message);
}
function onClick(cssSelector, cbFunc) {
	$("body").on("click", cssSelector, cbFunc);
}
function delegateClick(cssSelector, cbFunc) {
	$("body").delegate(cssSelector, "click", cbFunc);
}
function onSignup(e) {
	var elLogin = $("#login")[0];
	if (elLogin.dataset.view == "login") {
		elLogin.dataset.view =  "signup";
	}
	else {
		var username = $("#login .username").val().toLowerCase(),
		password = $("#login .password").val(),
		user = new StackMob.User({ username: username,
							    password: password,
							    firstname: $("#login .firstname").val(),
							    lastname: $("#login .lastname").val() });
		user.create({
			success: function(model) {
			    _login();
			},
			error: function(model, response) {
			    alert("Can't create account " + response);
			}
		 });

	}
}
function bindUI() {
	Template.renderInto("viewRecords", {}, $("#viewRecords"));
	Template.renderInto("add", {}, $("#add"));
	
	$("body").delegate(".logout", "click", function(e){
		logout();
		var panel = $(e.currentTarget).closest("#menu-panel");
		if (panel)
			panel.panel( "close" );
	});
	
	onClick("#login .loginBtn", _login);
	onClick("#login .signupBtn", onSignup);
	
	onClick("#save", function(){
		var val = parseInt($('#value').val());
		if (val >= 0) {
			server.add(val, $('#time').mobiscroll('getDate'));
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
	$("#viewRecords").delegate(".deleteItem", "click", function(e){
		var target = e.target;
		if (target.dataset.id.length > 0 && confirm("Delete this entry?")) {
			server.destroy(target.dataset.id);
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
		server.sync(true);
	});
	server.on("syncStart", function() {
		console.log("Sync starts");
	});
	server.on("syncDone", function() {
		console.log("Sync done");
	});
	$('#time').mobiscroll().date({
		theme: 'android-ics light',
		display: 'inline',
		mode: 'scroller',
		dateOrder: 'mmD ddyy',
		rows: 3
	});
}
function exportItems(ts, rs) {
	var i, row, date;
	for (var i=0; i < rs.rows.length; i++) {
		row = rs.rows.item(i);
		server.add(row.total, row.date);
	}
}

function logout() {
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
}
function _login() {
	var elLogin = $("#login")[0];
	if (elLogin.dataset.view == "login") {
		var username = $("#login .username").val().toLowerCase(),
		password = $("#login .password").val();
		
		var user = new StackMob.User({ username: username, password: password });
		user.login(true, {
			success: function(user) {
				_gotoHome();
				server.sync();
				// Cache user info
				localStorage.setItem(appName + "-username", username);
				localStorage.setItem(appName + "-password", password);
			},
			error: function(model, response) {
				alert("wrong username or password");
			}
		});
		
	}
	else {
		elLogin.dataset.view = "login";
	}
}
var loadedHome = false;
function _gotoHome() {
	if (!loadedHome) {
		loadedHome = true;
		Template.renderInto("home", {}, $("#home"));
	}
	$.mobile.changePage("#home");
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
		if ($("#login .username").val().length == 0) {
			$("#login .username").val(localStorage.getItem(appName + "-username"));
			$("#login .password").val(localStorage.getItem(appName + "-password"));
		}
		StackMob.getLoggedInUser({
			success: function(username){
				$.mobile.loading('hide');
				if (username) {
					console.log("User already logged in as " + username);
					_gotoHome();
					server.sync();
				}
			}
		});
	}, 100);
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
	kWhRateSummer = (0.3 + 0.17)/2,
	kWhRateWinter = 0.17,
	diff = 1,
	totalSavings = 0,
	context = { entries: []},
	chartData = [],
	firstDate=null, today=new Date();
	var weekday = ["Sun ", "Mon ", "Tue ", "Wed ", "Thu ", "Fri ", "Sat "];
	// skip the first value as it has no basis for comparison
	for (var i=0; i < rs.rows.length; i++) {
		row = rs.rows.item(i);
		date = new Date(row.date);
		if (_lastRecordDate < row.date) {
			_lastRecordDate = row.date;
		}
		if (firstDate == null  || firstDate > date) {
			firstDate = date;
		}
		
		diff = Math.round((date - previousDate)/ 1000 / 60 / 60/24);
		if (diff > 0) {
			dayProduction = Math.round((row.total - previousTotal)/diff);
			if (i > 0) {
				chartData.push([Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()), dayProduction]);
			}
			var rate = (date.getMonth() > 3 && date.getMonth() < 10) ? kWhRateSummer : kWhRateWinter,
			savings = dayProduction * rate;
			if (savings > 10)
				savings = Math.round(dayProduction * rate);
			else
				savings = savings.toFixed(2);
			context.entries.push({day: weekday[date.getDay()],
							date: [date.getMonth() + 1, "/", date.getDate()].join(""),
							dayProduction: dayProduction,
							total: row.total,
							savings: savings,
							recId: row.servRecId
							});
			
			previousDate = date;
			previousTotal = row.total;
		}
	}
	
	var allRows = [],
	lastItemDate = null;
	// First figure out all the months we need to compute
	for (var i=0; i < rs.rows.length; i++) {
		row = rs.rows.item(i);
		lastItemDate = date = new Date(row.date);
		//console.log(["Add item: " + date.toDateString() + " value " + row.total].join(""));
		allRows.push({date: date, item: row});
	}
	
	var curDate = firstDate,
	previousTotal = 0;
	msInADay = (24 * 60 * 60 * 1000),
	currentDailyProduction = 0;
	while(curDate < today) {
		var savings=0, rate = (curDate.getMonth() > 3 && curDate.getMonth() < 10) ? kWhRateSummer : kWhRateWinter;
		if (lastItemDate == null || curDate.getTime() < lastItemDate.getTime() + msInADay) {
			dayProduction = getDateValue(curDate, allRows);
			currentDailyProduction = (dayProduction - previousTotal);
			savings = currentDailyProduction * rate;
		}
		// Do a projection of what this saving would be for days pass the last entry using the same daily saving
		else if (currentDailyProduction > 0) {
			savings = currentDailyProduction * rate;
		}
		totalSavings += savings;
		curDate = new Date(curDate.getTime() + msInADay);
		previousTotal = dayProduction;
	}		
			
	context.entries.push({day: "Total", date: "", dayProduction: "", total: previousTotal, savings: Math.round(totalSavings)}),
	context.entries.reverse();
	Template.renderInto("recordItems", context, $("#viewRecords .history tbody"));
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