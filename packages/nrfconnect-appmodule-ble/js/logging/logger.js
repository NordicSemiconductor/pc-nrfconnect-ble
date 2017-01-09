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

import winston from 'winston';
import util from 'util';
import sqlite3 from'sqlite3';
import {remote} from 'electron';
import path from 'path';

let filePrefix = new Date().toISOString().replace(/:/gi, '_');

let defaultLogFile = filePrefix + '-log.txt';
let defaultDbFile = filePrefix + '-logger.db';

// Need to retrieve logFileDir from index.js since we do not have access to app.getPath in this file
defaultLogFile = remote.getGlobal('userDataDir') + path.sep + defaultLogFile;
defaultDbFile = remote.getGlobal('userDataDir') + path.sep + defaultDbFile;

let id = 0; // ID is used as primary key in database

const convertLevel = function (level) {
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
    if (level === 'trace') {
        return 0;
    } else if (level === 'debug') {
        return 1;
    } else if (level === 'verbose') {
        return 2;
    } else if (level === 'info') {
        return 3;
    } else if (level === 'warn') {
        return 4;
    } else if (level === 'error') {
        return 5;
    } else {
        return 3; // If level is not known, set it to info
    }
};

const DbLogger = winston.transports.DbLogger = function (options) {
    this.name = 'db';
    this.level = options.level || 'info';
    this.filename = options.filename || defaultDbFile;
    this.db = null;
    this.dbReady = false;
    this._queue = [];

    this.db = new sqlite3.Database(this.filename);

    this.db.serialize(() => {
        this.db.run('CREATE TABLE IF NOT EXISTS log_entries(id INTEGER PRIMARY KEY, time TEXT, level INTEGER, message TEXT, meta TEXT)');
        this.db.run('CREATE INDEX IF NOT EXISTS log_entries_time on log_entries(time)');
        this.db.run('CREATE INDEX IF NOT EXISTS log_entries_id on log_entries(id)');
        this.db.run('CREATE INDEX IF NOT EXISTS log_entries_level on log_entries(level)', () => {
            this.dbReady = true;
            processQueue();
        });
    });

    const _this = this;

    function processQueue() {
        _this._queue.forEach(operation => {
            _this[operation.method].apply(_this, operation.args);
        });

        delete _this._queue;
    }
};

util.inherits(DbLogger, winston.Transport);

DbLogger.prototype.log = function (level, msg, meta, callback) {
    if (this.silent) {
        return callback(null, true);
    }

    if (!this.dbReady) {
        console.log('Database is not ready yet. Storing entries in queue for later storage in DB.');

        this._queue.push({
            method: 'log',
            args: arguments,
        });

        return;
    }

    let timestamp = new Date();

    // Check if we have timestamp in meta data
    if (meta !== undefined) {
        if (meta.timestamp !== undefined) {
            timestamp = meta.timestamp;
        }

        meta = JSON.stringify(meta);
    }

    // TODO: We have to figure out if this is an array of events from the ble driver.
    // TODO: Postpone this to later.
    const stmt = this.db.prepare('INSERT INTO log_entries(id, time, level, message, meta) VALUES(?,?,?,?,?)');

    stmt.run(
        id,
        timestamp.toISOString(),
        convertLevel(level),
        msg,
        meta,
        err => {
            if (err) {
                // Log to console.log because we may not have a valid logger if we get here.
                console.log(`Error storing log entry, ${err}`);
            }

            this.emit('logged');
            callback(null, this.lastID);
        }
    );

    id++;
};

DbLogger.prototype.query = function (options, callback) {
    if (!this.dbReady) {
        callback(null);
        return;
    }

    const opt = {
        start: options.start,
        limit: options.rows,
        sort: { id: options.order === 'desc' ? 'DESC' : 'ASC' },
    };

    const sql = `SELECT * FROM log_entries WHERE id >= ${opt.start} ORDER BY id ${opt.sort.id}`;
    const entries = [];

    this.db.each(sql,
        (err, row) => {
            if (err) {
                callback(err);
                return;
            }

            if (row === null) {
                return;
            }

            entries.push(row);
        }, function (err, rowCount) {
            callback(null, entries);
        }
    );
};

const createLine = function (options) {
    let timestamp = options.timestamp();

    if (options.meta !== undefined && options.meta.timestamp !== undefined) {
        timestamp = options.meta.timestamp;
    }

    const level = options.level.toUpperCase();
    const message = (options.message !== undefined ? options.message : '');

    return `${timestamp.toISOString()} ${level} ${message}`;
};

const transports = [
    new (winston.transports.DbLogger)({
        name: 'db_logger',
        filename: defaultDbFile,
        level: 'info',
    }),

    new (winston.transports.File)({
        name: 'file',
        filename: defaultLogFile,
        level: 'debug',
        json: false,
        timestamp: function () {
            return new Date();
        },

        formatter: createLine,
    }),
];

const isConsoleAvailable = () => {
    try {
        process.stdout.write('');
    } catch (error) {
        return false;
    }
    return true;
};

if (process.env.NODE_ENV === 'development' && isConsoleAvailable()) {
    transports.push(new (winston.transports.Console)({
        name: 'console',
        level: 'silly',
        timestamp: function () {
            return new Date();
        },

        formatter: createLine,
    }));
}

export const logger = new (winston.Logger)({
    transports: transports,
});

export function getLogFilePath() {
    return defaultLogFile;
}
