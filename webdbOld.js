var WebDBOld = function () {
	var db = null;
	
	function open() {
	  var dbSize = 5 * 1024 * 1024; // 5MB
	  db = openDatabase("Production", "1.0", "Sun Catcher", dbSize);
	}
	
	function createTable() {
		db.transaction(function(tx) {
			tx.executeSql("CREATE TABLE IF NOT EXISTS " +
					 "Production(ID INTEGER PRIMARY KEY ASC, total INTEGER, date DATETIME)", []);
		});
	}
	
	open();
	createTable();
	
	function onError(tx, e) {
	  alert("There has been an error: " + e.message);
	}
	
	function onSuccess(tx, r) {
	  // re-render the data.
	  // loadItems is defined in Step 4a
	  getAllItems(loadItems);
	}
	function addEntry(value, date) {
		date = (new Date(date)).toISOString();
		db.transaction(function(tx){
		   tx.executeSql("INSERT INTO Production(total, date) VALUES (?,?)",
				[value, date],
				onSuccess,
				onError);
		   });
	}
	
	function getAllItems(renderFunc) {
		db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM Production order by date asc", [], renderFunc,
			    onError);
		});
	}
	
	
	function deleteAllEntries() {
		db.transaction(function(tx){
			tx.executeSql("DELETE FROM Production", [],
				onSuccess,
				onError);
			});
	}
	
	function deleteEntry (id) {
		db.transaction(function(tx){
			tx.executeSql("DELETE FROM Production WHERE ID=?", [id],
				onSuccess,
				onError);
		  });
	}
	return {
			deleteAllEntries: deleteAllEntries,
			deleteEntry: deleteEntry,
			getAllItems: getAllItems,
			addEntry: addEntry
	};
};
