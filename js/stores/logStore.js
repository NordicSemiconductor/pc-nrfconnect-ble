/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

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
    triggerUpdate: function(self) {
        // TODO: look into optimizing the transport of entries by sending
        // TODO: the self.state.logEntries array as option to the query
        // TODO: and let the query implementation add directory to self.state.logEntries.
        logger.query({start: self.state.last_log_entry_id + 1, transport: "db"}, function(err, results) {
            if(err) {
                throw err;
            }
            if(results === undefined || results.length == 0) return;

            for(var i = 0; i < results.length; i++) {
                self.state.logEntries.push(results[i]);
            }

            // Fetch the latest id received
            self.state.last_log_entry_id = results[results.length-1].id;
            self.trigger(self.state);
        });
    }
});

module.exports = logStore;