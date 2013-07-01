
function getDateValue(date, allRows) {
	var retVal = 0, prev=null, post=null, last=null, i=0;
	for (i=0; i < allRows.length; i++) {
		// if the day match, just use it
		if (date.getFullYear() == allRows[i].date.getFullYear() &&
			date.getMonth() == allRows[i].date.getMonth() &&
			date.getDate() == allRows[i].date.getDate()) {
			console.log("getDateValue returns " + JSON.stringify(allRows[i].item));
			return allRows[i].item.total;
		}
		else if (date.getFullYear() <= allRows[i].date.getFullYear() &&
			date.getMonth() <= allRows[i].date.getMonth() &&
			date.getDate() <= allRows[i].date.getDate()) {
			prev = last;
			post = allRows[i];
			break;
		}
		last = allRows[i];
	}
	// last item
	if (post == null && prev == null) {
		console.log("getDateValue returns last item: " + JSON.stringify(last.item));
		return last ? last.item.total : 0;
	}
	// first item
	if (prev == null && post) {
		console.log("getDateValue returns first item: " + JSON.stringify(post.item));
		return post.item.total;
	}
	var averageDayValue = 0, daysDiff = 0,
	daysApart = Math.round((post.date - prev.date)/ 1000 / 60 / 60/24);
	if (daysApart > 0) {
		averageDayValue = (post.item.total - prev.item.total)/daysApart;
	}
	else {
		alert("bad. daysApart is 0");
	}
	daysDiff = Math.round((date - prev.date)/ 1000 / 60 / 60/24);
	retVal = Math.round(prev.item.total + averageDayValue * daysDiff);
	console.log(["getDateValue val:", retVal, "avg:", averageDayValue, "daysApart", daysApart, " daysDiff", daysDiff].join(" "));
	return retVal;
}
function formatDate(date) {
	var month = date.getMonth() + 1,
	day = date.getDate();
	if (month < 10)
		month += "0";
	if (day < 10)
		day += "0";
	return [date.getFullYear(), month, day].join("-");
}
function extrapolateMonthData(rows) {
	var i, j, row, date, curM=-1, curY=-1, startYr, startMon, startDate, endYr, endMon, lastMonth;
	var dates = [];
	var allRows = [];
	// First figure out all the months we need to compute
	for (var i=0; i < rows.length; i++) {
		row = rows.item(i);
		date = new Date(row.date);
		//console.log(["Add item: " + date.toDateString() + " value " + row.total].join(""));
		allRows.push({date: date, item: row});
	}
	row = rows.item(0);
	date = new Date(row.date);
	startMon = date.getMonth();
	startYr = date.getFullYear();
	startDate = date.getDate();
	row = rows.item(rows.length - 1);
	date = new Date(row.date);
	endMon = date.getMonth();	// Test december as last month
	endYr = date.getFullYear();
	endDate = date.getDate();
	console.log("Start: ", startMon, "/", startYr, " End: ", endMon, "/", endYr);
	// have 2 spread apart dates
	for(i=startYr; i <= endYr; i++) {
		if (i == startYr) {
			j=startMon;
		}
		else  {
			j = 0;
		}
		if (i == endYr) {
			lastMonth = endMon;
		}
		else {
			lastMonth = 11;
		}
		while (j <= lastMonth) {
			//console.log(["Processing: ", j, "/", i].join(""));
			date = new Date(i, j, startDate > 0 ? startDate : 1);
			value = getDateValue(date, allRows);
			dates.push({date: date, value: value});
			startDate = 0;
			j++;
		}
	}
	// Insert 
	if (endDate > 1) {
		date = new Date(endYr, endMon, endDate);
		value = getDateValue(date, allRows);
		dates.push({date: date, value: value});
	}
	return dates;
}