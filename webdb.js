var WebDB = function (tableName, appName, callbacks) {
	"use strict"
	
	var db = null,
	_tableName = tableName,
	_appName = appName,
	_lastModTime = parseInt(localStorage.getItem(_appName+"-lastModTime")),
	_callBacks = callbacks;
	if (isNaN(_lastModTime)) {
		_lastModTime = 0;
	}
	
	function open() {
	  var dbSize = 5 * 1024 * 1024; // 5MB
	  db = openDatabase(_tableName, "1.0", _appName, dbSize);
	}
	
	function createTable() {
		db.transaction(function(tx) {
			tx.executeSql("CREATE TABLE IF NOT EXISTS " +
					_tableName + "(ID INTEGER PRIMARY KEY ASC, total INTEGER, date DATETIME, servRecId STRING)", []);
		});
	}
	
	open();
	createTable();
	
	function onError(tx, e) {
		alert("There has been an error: " + e.message);
	}
	
	function addEntry(value, date, recId) {
		date = (new Date(date)).toISOString();
		db.transaction(function(tx){
		   tx.executeSql("INSERT INTO " + _tableName + "(total, date, servRecId) VALUES (?,?,?)",
				[value, date, recId],
				_callBacks.success,
				_callBacks.error);
		   });
	}
	
	function getAllItems(renderFunc) {
		db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM " + _tableName + " ORDER BY date asc", [], renderFunc,
			    _callBacks.error);
		});
	}
	
	function deleteAllEntries(callbacks) {
		if (!callbacks) {
			callbacks = _callBacks;
		}
		setModTime(0);	// clear the last mod time
		db.transaction(function(tx){
			tx.executeSql("DELETE FROM " + _tableName, [],
				callbacks.success,
				callbacks.error);
			});
	}
	
	function findEntry(serverId, callback) {
		db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM " + _tableName + " WHERE servRecId=?", [serverId],
				callback.success,
				callback.error);
		});
	}
	
	function deleteEntry (serverId) {
		db.transaction(function(tx){
			tx.executeSql("DELETE FROM " + _tableName + " WHERE servRecId=?", [serverId],
				_callBacks.success,
				_callBacks.error);
		});
	}
	function editEntry(serverRecId, total, date) {
		db.transaction(function(tx){
			tx.executeSql("UPDATE " + _tableName + " SET total=?, date=? WHERE ID=?", [total, date, serverRecId],
				_callBacks.success,
				_callBacks.error);
		});
	}
	function deleteTabe() {
		db.transaction(function(tx){
			tx.executeSql("DROP TABLE " + _tableName, [],
				_callBacks.success,
				_callBacks.error)});
	}
	function printDB() {
		webdb.getAllItems(function(e, rows) {
			for (var i=0; i < rows.rows.length; i++) {
				var row = rows.rows.item(i);
				console.log("local DB entry: " + JSON.stringify(row));
			}
		});
	}
	function cleanup() {
		
	}
	function setModTime(time) {
		if (_lastModTime < time || time==0) {
			_lastModTime = time;
			localStorage.setItem(_appName + "-lastModTime", _lastModTime);
		}
	}
	return {
			deleteAllEntries: deleteAllEntries,
			deleteEntry: deleteEntry,
			getAllItems: getAllItems,
			addEntry: addEntry,
			editEntry: editEntry,
			printDB: printDB,
			cleanup: cleanup,
			setCallbacks: function(callbacks) { _callBacks = callbacks; },
			findEntry: findEntry,
			getModTime: function() { return _lastModTime; },
			setModTime: setModTime
	};
};
