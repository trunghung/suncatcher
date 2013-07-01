
test("End Point ends on the 1st of the month", function() {
	var rowsData = [{ date: "2013/02/10", total: 10},
				 { date: "2013/02/27", total: 20},
				 { date: "2013/03/02", total: 50},
				 { date: "2013/03/31", total: 10},
				 { date: "2013/04/1", total: 80},
				 ];
	var dates = extrapolateMonthData({length: rowsData.length, item: function(index) {
		return rowsData[index];
	}});
	dates.forEach(function(row){
		console.log(row.date.toDateString() + " : " + row.value);
	})
	equal(dates.length, 3, "length passed");
	equal(dates[0].value, 10, "first value passed");
	equal(dates[1].value, 40, "interpreted value passed");
	equal(dates[2].value, 80, "last value passed");
});
test("extrapolate Data", function() {
	var rowsData = [{ date: "2013/02/10", total: 10},
				 { date: "2013/02/27", total: 20},
				 { date: "2013/03/04", total: 50},
				 { date: "2013/03/31", total: 10},
				 { date: "2013/04/01", total: 30},
				 { date: "2013/04/10", total: 80},
				 ];
	var dates = extrapolateMonthData({length: rowsData.length, item: function(index) {
		return rowsData[index];
	}});
	dates.forEach(function(row){
		console.log(row.date.toDateString() + " : " + row.value);
	})
	equal(dates.length, 4, "length passed");
	equal(dates[0].value, 10, "first value passed");
	equal(dates[1].value, 32, "interpreted value passed");
	equal(dates[3].value, 80, "last value passed");
});


test("spanning year", function() {
	var rowsData = [{ date: "2012/12/10", total: 100},
				 { date: "2013/02/27", total: 200},
				 { date: "2013/03/02", total: 500},
				 { date: "2013/03/31", total: 100},
				 { date: "2013/04/01", total: 300},
				 { date: "2014/01/10", total: 800},
				 ];
	var dates = extrapolateMonthData({length: rowsData.length, item: function(index) {
		return rowsData[index];
	}});
	dates.forEach(function(row){
		console.log(row.date.toDateString() + " : " + row.value);
	})
	equal(dates.length, 15, "length passed");
	equal(dates[0].value, 100, "first value passed");
	equal(dates[1].value, 128, "interpreted value passed");
	equal(dates[13].value, 784, "last value passed");
});