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

import winston from 'winston';
import util from 'util';
import sqlite3 from'sqlite3';
import fs from 'fs';
import remote from 'remote';

var defaultLogFile = 'log.txt';
var defaultDbFile = 'logger.db';

// Need to retrieve logFileDir from index.js since we do not have access to app.getPath in this file
defaultLogFile = remote.getGlobal('logFileDir') + '/' + defaultLogFile;
defaultDbFile = remote.getGlobal('logFileDir') + '/' + defaultDbFile;

let id = 0; // ID is used as primary key in database

var convertLevel = function(level) {
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

var DbLogger = winston.transports.DbLogger = function(options) {
    this.name = 'db';
    this.level = options.level || 'info';
    this.filename = options.filename || defaultDbFile;
    this.db = null;
    this.dbReady = false;

    try {
        fs.unlinkSync(this.filename);
    } catch (err) {
        // Log to console.log because we may not have a valid logger if we get here.
        console.log(`Error removing file ${this.filename}. Error is ${err}`);
    }

    this.db = new sqlite3.Database(this.filename);

    this.db.serialize(() => {
        this.db.run('CREATE TABLE IF NOT EXISTS log_entries(id INTEGER PRIMARY KEY, time TEXT, level INTEGER, message TEXT, meta TEXT)');
        this.db.run('CREATE INDEX IF NOT EXISTS log_entries_time on log_entries(time)');
        this.db.run('CREATE INDEX IF NOT EXISTS log_entries_id on log_entries(id)');
        this.db.run('CREATE INDEX IF NOT EXISTS log_entries_level on log_entries(level)', () => {
            this.dbReady = true;
        });
    });
};

util.inherits(DbLogger, winston.Transport);

DbLogger.prototype.log = function(level, msg, meta, callback) {
    if (this.silent) {
        return callback(null, true);
    }

    if (!this.dbReady) {
        // Log to console.log because we may not have a valid logger if we get here.
        console.log('Database is not ready yet. Entry will not be stored.');
        return callback(null, true);
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
    var stmt = this.db.prepare('INSERT INTO log_entries(id, time, level, message, meta) VALUES(?,?,?,?,?)');

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

DbLogger.prototype.query = function(options, callback) {
    if (!this.dbReady) {
        callback(null);
        return;
    }

    var opt = {
        start: options.start,
        limit: options.rows,
        sort: {id: options.order === 'desc' ? 'DESC' : 'ASC'},
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
        }, function(err, rowCount) {
            callback(null, entries);
        }
    );
};

var createLine = function(options) {
    let timestamp = options.timestamp();

    if (options.meta !== undefined && options.meta.timestamp !== undefined) {
        timestamp = options.meta.timestamp;
    }

    const level = options.level.toUpperCase();
    const message = (options.message !== undefined ? options.message : '');

    return `${timestamp.toISOString()} ${level} ${message}`;
};

// Delete the log file for now so that it easier to debug
try {
    fs.unlinkSync(defaultLogFile);
} catch (err) {
    // Log to console.log because we may not have a valid logger if we get here.
    console.log(`Error removing file ${defaultLogFile}. Error is ${err}`);
}

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
        timestamp: function() {
            return new Date();
        },

        formatter: createLine,
    }),
];

try {
    //Test to find out if the application is running without stdout console
    process.stdout.write('');

    transports.push(new (winston.transports.Console)({
        name: 'console',
        level: 'silly',
        timestamp: function() {
            return new Date();
        },

        formatter: createLine,
    }));

} catch (exception) {}

export const logger = new (winston.Logger)({
    transports: transports,
});

logger.info(`For a detailed log file see: ${defaultLogFile}`);
