/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
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

import EventEmitter from 'events';
var logger = require('./logger').logger;

const LOG_UPDATE_INTERVAL = 400;

class LogReader extends EventEmitter {
    constructor(updateInterval = LOG_UPDATE_INTERVAL) {
        super();
        this.updateInterval = updateInterval;
        this.lastLogEntryId = -1;
    }

    start() {
        if (this.interval !== undefined) {
            this.stop();
        }

        this.interval = setTimeout(() => {
            this.triggerUpdate();
        }, this.updateInterval);
    }

    stop() {
        if (this.interval !== undefined) {
            clearInterval(this.interval);
        }
    }

    triggerUpdate() {
        // TODO: look into optimizing the transport of entries by sending
        // TODO: the self.state.logEntries array as option to the query
        // TODO: and let the query implementation add directory to self.state.logEntries.
        logger.query({start: this.lastLogEntryId + 1, transport: 'db'}, (err, entries) => {
            // Use setTimeout instead of setInterval to guarantee that query is not called
            // too soon since that may lead to duplicate log entries.
            this.interval = setTimeout(() => {
                this.triggerUpdate();
            }, this.updateInterval);

            if (err) {
                this.emit('error', err);
                return;
            }

            if (entries === undefined || entries.length === 0) {
                return;
            }

            for (let entry of entries) {
                this.emit('entry', entry);
            }

            // Fetch the latest id received
            this.lastLogEntryId = entries[entries.length - 1].id;
        });
    }
}

module.exports = { LogReader, logger };
