'use strict';

// Evaluate different way to update data from stores
// http://stackoverflow.com/questions/29048164/can-refluxjs-stores-indicate-which-property-has-changed-when-they-call-trigger

import fs from 'fs';

import sqlite3 from'sqlite3';
import reflux from 'reflux';

import logger from '../logging';

import logActions from '../actions/logActions';
import discoveryActions from '../actions/discoveryActions';

var db = null;

var last_log_entry_id = 0;

var logStore = reflux.createStore({
    listenables: [logActions, discoveryActions],
    init: function() {
        this.state = {
            logEntries: [],
            follow_state: false,
        }

        var self = this;

        setInterval(function() {
            self.triggerUpdate(self);
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
        // TODO: look into optimizing the transport of entries by sending
        // TODO: the self.state.logEntries array as option to the query
        // TODO: and let the query implementation add directory to self.state.logEntries.
        logger.query({start: last_log_entry_id + 1}, function(err, results) {
            if(err) {
                throw err;
            }

            if(results.db === undefined || results.db.length == 0) return;

            for(var i = 0; i < results.db.length; i++) {
                self.state.logEntries.push(results.db[i]);
            }

            // Fetch the latest id received
            last_log_entry_id = results.db[results.db.length-1].id;
            self.trigger(self.state);
        });
    },
    onLog: function(logger_name, level, text) {
        console.log("REMOVE ME!");
    },
    onAdd: function(logger_name, level, entries) {
        console.log("REMOVE ME!");
        /*
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
                    });
            }
        } else {
            console.log("Database not up an running, not able to store log entries to DB");
        } */
    }
});

module.exports = logStore;