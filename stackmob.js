var server = (function(){
	"use strict"
	var _lastModTime = 0,
	_syncProgress = 0,
	_syncDoneEventTriggered = false,
	Record = null;
	function _init() {
		StackMob.init({
			    appName: "sun_catcher",
			    publicKey: "badd3a47-de8e-4146-bbe9-dda56cf1ef3c",
			    apiVersion: 0
			});
		Record = StackMob.Model.extend({
			schemaName : "record"
		});
	}
	
	function _add(total, datetime, donotUpdateLocalDb) {
		var record = new Record({
			datetime : datetime,
			value : total,
			deleted: false
		});
	
		record.create({
			success : function(model) {
				if (!donotUpdateLocalDb) {
					webdb.addEntry(total, datetime, model.get("record_id"));
				}
			},
			error : function(model, response) {
			   console.debug("Oops there was an error in creating the object.");
			   console.debug(response);
			}
		});
	}
	function _destroy(recordId, donotUpdateLocalDb) {
		// We don't actually delete the obj, we keep it on the server and just mark it as deleted
		var record = new Record({ record_id: recordId, deleted: true});
		record.save({}, {
			success: function(model) {
				if (!donotUpdateLocalDb) {
					webdb.deleteEntry(recordId);
				}
			},
			error: function(model, response) {
				console.debug(response);
			}
		});
		/*var record = new Record({ record_id: recordId});
		record.destroy({
			success : function(model) {
				if (!donotUpdateLocalDb) {
					webdb.deleteEntry(recordId);
				}
			},
			error : function(model, response) {
			   console.debug("Oops there was an error in deleting the object.");
			   console.debug(response);
			}
		});
		*/
	}
	function _update(recordId, value, date) {
		var record = new Record({ record_id: recordId, value: value, date: date});
		record.save({}, {
			success: function(model) {
				webdb.editEntry(recordId, value, date);
			},
			error: function(model, response) {
				console.debug(response);
			}
		});
	}
	function _syncRecord(record, iter, list) {
		if (_lastModTime < record.get("lastmoddate")) {
			_lastModTime = record.get("lastmoddate");
		}
		webdb.findEntry(record.get("record_id"), {
			success: function(ts, rs) {
				// If the item is marked as deleted on the server, we should delete it, or ignore if it doesn't exist locally
				if (record.get("deleted")) {
					if (rs.rows.length > 0) {
						webdb.deleteEntry(record.get("record_id"));
					}
				}
				else {
					if (rs.rows.length == 0) {
						webdb.addEntry(record.get("value"), record.get("datetime"), record.get("record_id"));
					}
					else if (rs.rows.length == 1) {
						var row = rs.rows.item(0);
						if (row.total != record.get("value") || row.date != record.get("date")) {
							webdb.editEntry(record.get("record_id"), record.get("value"), record.get("date"));
						}
					}
					else {
						console.error("Duplicate entries found with same server ID");
					}
				}
				_syncProgress--;
				if (_syncProgress == 0) {
					server.trigger("syncDone");
					_syncDoneEventTriggered = true;
				}
			},
			error: function(ts, e) {
				console.log("Entry not found.  Add to local db: " + record.toJSON());
				_syncProgress--;
				if (_syncProgress == 0) {
					server.trigger("syncDone");
					_syncDoneEventTriggered = true;
				}
			}
		});
	}
	function _sync() {
		server.trigger("syncStart");
		var Records = StackMob.Collection.extend({ model: Record });
		var records = new Records();
		var q = new StackMob.Collection.Query();
		q.gt('lastmoddate', _lastModTime);
		records.query(q, {
			success: function(collection) {
				_syncProgress = collection.length;
				_syncDoneEventTriggered = false;
				collection.forEach(_syncRecord);
				// In case syncDone not fired properly
				setTimeout(function() {
					if (!_syncDoneEventTriggered) {
						server.trigger("syncDone");
					}
				}, 5000);
		    },
		    error: function(model, response) {
			   console.debug(response);
		    }
		});
	}
	function _deleteAll() {
		var Records = StackMob.Collection.extend({ model: Record });
		var records = new Records();
		var q = new StackMob.Collection.Query();
		records.query(q, {
			success: function(model) {
				model.models.forEach(function(record, iterator, list){
					_destroy(record.get("record_id"));
				});
		    },
		    error: function(model, response) {
			   console.debug(response);
		    }
		});
		
	}
	function _printDB() {
		var Records = StackMob.Collection.extend({ model: Record });
		var records = new Records();
		var q = new StackMob.Collection.Query();
		records.query(q, { success: function(collection) {
						collection.models.forEach(function(model, iter, list) {
							console.log("server DB entry: " + JSON.stringify(model.toJSON()));
						});
					},
					error: function() {
						console.log("failed to get model");
					}
				});
	}
	
	return {
		init: _init,
		add: _add,
		destroy: _destroy,
		update: _update,
		deleteAll: _deleteAll,
		printDB: _printDB,
		sync: _sync
	};
})();
_.extend(server, Backbone.Events);