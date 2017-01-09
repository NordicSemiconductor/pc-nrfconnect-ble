/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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

            this.emit('entry', entries);

            // Fetch the latest id received
            this.lastLogEntryId = entries[entries.length - 1].id;
        });
    }
}

module.exports = { LogReader, logger };
