'use strict';

import EventEmitter from 'events';
import logger from './logging';

const LOG_UPDATE_INTERVAL = 400;

class LogReader extends EventEmitter {
    constructor(updateInterval = LOG_UPDATE_INTERVAL) {
        super();
        this.updateInterval = updateInterval;
        this.lastLogEntryId = 0;
    }

    start() {
        if (this.interval !== undefined) {
            this.stop();
        }

        this.interval = setInterval(() => {
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
        logger.query({start: this.lastLogEntryId + 1, transport: "db"}, (err, entries) => {
            if(err) {
                this.emit('error', err);
                return;
            }

            if(entries === undefined || entries.length === 0) {
                return;
            }

            for(let entry of entries) {
                this.emit('entry', entry);
            }

            // Fetch the latest id received
            this.lastLogEntryId = entries[entries.length-1].id;
        });
    }
}

module.exports = { LogReader, logger };
