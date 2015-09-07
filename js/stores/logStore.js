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

var logStore = reflux.createStore({
    listenables: [logActions, discoveryActions],
    init: function() {
        this.state = {
            logEntries: [],
            follow_state: false,
            last_log_entry_id: 0
        }

        var self = this;

        setInterval(function() {
            self.triggerUpdate(self);
        }, 400);
    },
    getInitialState: function() {
        return this.state;
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
        logger.query({start: self.state.last_log_entry_id + 1}, function(err, results) {
            if(err) {
                throw err;
            }

            if(results.db === undefined || results.db.length == 0) return;

            for(var i = 0; i < results.db.length; i++) {
                self.state.logEntries.push(results.db[i]);
            }

            // Fetch the latest id received
            self.state.last_log_entry_id = results.db[results.db.length-1].id;
            self.trigger(self.state);
        });
    }
});

module.exports = logStore;