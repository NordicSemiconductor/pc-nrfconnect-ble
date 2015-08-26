'use strict';

// Evaluate different way to update data from stores
// http://stackoverflow.com/questions/29048164/can-refluxjs-stores-indicate-which-property-has-changed-when-they-call-trigger

var reflux = require('reflux');
var logActions = require('../actions/logActions');
var discoveryActions = require('../actions/discoveryActions');

var sqlite3 = require('sqlite3').verbose();
var db = null;

var db_filename = 'database.db';

var fs = require('fs');

var convert_level = function(level) {
    /**
    * @brief Adds log entries to database and datastore
    * @details Adds log entries to database and datastore
    *
    * @param entries An array with log entries
    * @param level Log level used for array of entries. May be one of the following:
    *
    *    TRACE   = 0
    *    DEBUG   = 1
    *    INFO    = 2
    *    WARNING = 3
    *    ERROR   = 4
    *    FATAL   = 5
    *
    * @return undefined
    */

    // Convert log level
    if(level === 'TRACE') {
        return 0;
    } else if(level === 'DEBUG') {
        return 1;
    } else if(level === 'INFO') {
        return 2;
    } else if(level === 'WARNING') {
        return 3;
    } else if(level === 'ERROR') {
        return 4;
    } else if(level === 'FATAL') {
        return 5;
    } else {
        return 2; // If level is not known, set it to INFO
    }
}

var last_log_entry_id = 0;
var newest_log_entry_id = 0;

var logStore = reflux.createStore({
    listenables: [logActions, discoveryActions],
    init: function() {
        this.state = {
            logEntries: [],
            follow_state: false,
            db_loaded: false,
            //last_log_entry_id: 0
        }

        var self = this;

        fs.unlinkSync(db_filename);
        db = new sqlite3.Database(db_filename);

        db.serialize(function() {
            db.run("CREATE TABLE IF NOT EXISTS log_entries(id INTEGER PRIMARY KEY, time TEXT, level INTEGER, logger TEXT, data TEXT)");
            // db.run("CREATE TABLE IF NOT EXISTS counters(key TEXT PRIMARY KEY, count INTEGER");
            db.run("CREATE INDEX IF NOT EXISTS log_entries_time on log_entries(time)");
            db.run("CREATE INDEX IF NOT EXISTS log_entries_id on log_entries(id)");
            db.run("CREATE INDEX IF NOT EXISTS log_entries_level on log_entries(level)");
            self.state.db_loaded = true;
        });

        setInterval(function() {
            if(last_log_entry_id < newest_log_entry_id) {
                self.triggerUpdate(self);
            }
        }, 400);
    },
    getInitialState: function() {
        return this.state;
    },
    onOpen: function() {
    },
    onSearch: function(filter) {
        var self = this;
    },
    onFollow: function(follow) {
        var self = this;
        self.state.follow_state = follow;
    },
    triggerUpdate: function(self) {
        if(self.state.db_loaded == false) {
            console.log("Database not open, not able to process queries.");
            return;
        }

        //console.log('Querying for elements with id > ' + self.state.last_log_entry_id);
        if(last_log_entry_id == newest_log_entry_id) return;

        var sql = "SELECT * FROM log_entries WHERE id > "
        + last_log_entry_id + " AND id <= " + newest_log_entry_id
        + " ORDER BY id ASC";

        db.each(sql,
            function(err, row) {
                if(err) {
                    console.log("Error fetching log entry: " + err);
                    return;
                }

                if(row == null) return;

                self.state.logEntries.push(row);

                last_log_entry_id = row.id;
            }, function(err, row_count) {
                if(row_count != 0) self.trigger(self.state);
                last_log_entry_id = newest_log_entry_id;
            }
        );
    },
    onLog: function(logger_name, level, text) {
        var self = this;
        var level = convert_level(level);

        if(this.state.db_loaded) {
            db.serialize(function() {
                var stmt = db.prepare("INSERT INTO log_entries(time, level, logger, data) VALUES(?,?,?,?)");
                stmt.run(
                    new Date().toISOString(),
                    level,
                    logger_name,
                    JSON.stringify({text: text}),
                    function(err) {
                        if(newest_log_entry_id < this.lastID) newest_log_entry_id = this.lastID;
                        //console.log("on_log:" + this.lastID);
                    });
            });
        }
    },
    onAdd: function(logger_name, level, entries) {
        var self = this;

        var level = convert_level(level);

        // Check logger name
        if(logger_name === undefined || logger_name == null) {
            logger_name = 'unknown';
        }

        // Check timestamp, if it does not exist, create one
        var timestamp = null;

        if(event === undefined || event.time === undefined || event.time === null) {
            timestamp = new Date().toISOString();
        } else {
            timestamp = event.time;
        }

        if(this.state.db_loaded) {
            var stmt = db.prepare("INSERT INTO log_entries(time, level, logger, data) VALUES(?, ?, ?, ?)");

            for (var i = 0; i < entries.length; i++)
            {
                event = entries[i];
                stmt.run(
                    timestamp,
                    level,
                    logger_name,
                    JSON.stringify(event), function(err) {
                        if(newest_log_entry_id < this.lastID) newest_log_entry_id = this.lastID;
                        // console.log("on_add: " + this.lastID);
                    });
            }
        } else {
            console.log("Database not up an running, not able to store log entries to DB");
        }
    }
});

module.exports = logStore;