var Server = function(appName){
	"use strict"	
	
	var _syncProgress = 0,
	_appName = appName,
	_syncDoneEventTriggered = false,
	_this = null,
	_syncing = false,
	Record = null;
	function _init(isProduction) {
		StackMob.init({
			    appName: "sun_catcher",
			    publicKey: isProduction ? "90755f35-d410-4a30-9fe7-03069ef62d0e" : "badd3a47-de8e-4146-bbe9-dda56cf1ef3c",
			    apiVersion: isProduction ? 1 : 0
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
		webdb.setModTime(record.get("lastmoddate"));
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
					_syncing = false;
					_this.trigger("syncDone");
					_syncDoneEventTriggered = true;
				}
			},
			error: function(ts, e) {
				console.log("Entry not found.  Add to local db: " + record.toJSON());
				_syncProgress--;
				if (_syncProgress == 0) {
					_syncing = false;
					_this.trigger("syncDone");
					_syncDoneEventTriggered = true;
				}
			}
		});
	}
	// If we are doing a force full sync, we will ask just for all entries from server that's not marked for delete, clear local database,
	// and then add all server items to the local database
	function _sync(forceFullSync) {
		if (!_syncing) {
			_syncing = true;
			_this.trigger("syncStart");
			var Records = StackMob.Collection.extend({ model: Record });
			var records = new Records();
			var q = new StackMob.Collection.Query();
			if (forceFullSync == true) {
				q.notEquals("deleted", true);
			}
			else {
				q.gt('lastmoddate', webdb.getModTime());
			}
			records.query(q, {
				success: function(collection) {
					var timeout = collection.length * 500;
					_syncProgress = collection.length;
					console.log("Sync: # of changes: " + _syncProgress);
					_syncDoneEventTriggered = false;
					if (forceFullSync) {
						webdb.deleteAllEntries({
							success: function() {
								collection.forEach(function(record) {
									webdb.addEntry(record.get("value"), record.get("datetime"), record.get("record_id"));
								});
							},
							error: function() {
							}});
					}
					else {
						collection.forEach(_syncRecord);
					}
					// In case syncDone not fired properly
					setTimeout(function() {
						if (!_syncDoneEventTriggered) {
							_this.trigger("syncDone");
							_syncing = false;
						}
					}, timeout);
			    },
			    error: function(model, response) {
				   console.debug(response);
			    }
			});
		}
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
	
	
	
	_this = {
		init: _init,
		add: _add,
		destroy: _destroy,
		update: _update,
		deleteAll: _deleteAll,
		printDB: _printDB,
		sync: _sync
	};
	_.extend(_this, Backbone.Events);
	return _this;
};