server.init();
var defCB={success: function() {}, error: function() {}};
var webdb = WebDB("Record", "Sun Catcher", "record", defCB);
var Record = StackMob.Model.extend({
			schemaName : "record"
		});
asyncTest( "login account", function() {
	console.log("running 1");
	var user = new StackMob.User({ username: "test", password: "hungtest" });
	user.login(true, {
		success: function(model) {
			ok(true, "account logined successfully");
			start();
		},
		error: function(model, response) {
			ok(false, "wrong username or password");
			start();
		}
	});
});
function verifyServerCount(count, context) {
	var Records = StackMob.Collection.extend({ model: Record });
	var records = new Records();
	var q = new StackMob.Collection.Query();
	q.notEquals("deleted", true);
	records.query(q, { success: function(model) {
					equal(model.length, count, "passed " + context);
				},
				error: function() {
					ok(false, "failed");
				}
			});
}
var firstRowServerId = "";
function verifyLocalCount(count, context) {
	webdb.getAllItems(function(ts, rs) {
		equal(rs.rows.length, count, "passed " + context);
		if (rs.rows.length > 0) {
			var row = rs.rows.item(0);
			firstRowServerId = row.servRecId;
		}
	});
}
asyncTest("Add records", function() {
	console.log("running 2");
	server.add(10, "2012-01-01");
	server.add(20, "2012-01-02");
	server.add(30, "2012-01-03");
	setTimeout(function() {
		verifyServerCount(3, "add records");
		server.deleteAll();
		setTimeout(function() {
			verifyServerCount(0, "clean up server");
		}, 2000);
	}, 2000);
	
	setTimeout(function(){
		start();
		webdb.deleteAllEntries();
	}, 7000);
});

asyncTest("Sync records", function() {
	firstRowServerId = "";
	console.log("running 3");
	server.add(10, "2012-01-01");			// add locally and server
	server.add(20, "2012-01-02", true);	// server only
	server.add(30, "2012-01-03", true);	// server only
	setTimeout(function() {
		verifyServerCount(3, "init server add");
		verifyLocalCount(1, "1 local entry");
		
		server.sync();
		setTimeout(function() {
			verifyLocalCount(3, "first sync");
			server.destroy(firstRowServerId, true);	// delete sever only
			setTimeout(function() {
				verifyServerCount(2, "1 entry deleted");
				verifyLocalCount(3, "local still has 3");
				server.sync();
				
				setTimeout(function() {
					verifyLocalCount(2, "sync deleted entry");
					server.printDB();
					webdb.printDB();
					setTimeout(function() {
						server.deleteAll();
						setTimeout(function() {
							start();
						}, 1000);
					}, 2000);
				}, 2000);
				
			}, 2000);
		}, 3000);
	}, 2000);
});
