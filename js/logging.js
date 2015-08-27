import winston from 'winston';
import util from 'util';
import sqlite3 from'sqlite3';
import fs from 'fs';

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
    if(level === 'trace') {
        return 0;
    } else if(level === 'debug') {
        return 1;
    } else if(level === 'verbose') {
        return 2;
    } else if(level === 'info') {
        return 3;
    } else if(level === 'warn') {
        return 4;
    } else if(level === 'error') {
        return 5;
    } else {
        return 3; // If level is not known, set it to info
    }
}

var DbLogger = winston.transports.DbLogger = function(options) {
    this.name = 'db';
    this.level = options.level || 'info';
    this.filename = options.filename || 'logger.db';
    this.db = null;
    this.db_ready = false;

    var self = this;

    try {
        fs.unlinkSync(this.filename);
    } catch(err) {
        console.log(`Error removing file ${this.filename}. Error is ${err}`);
    }

    this.db = new sqlite3.Database(this.filename);

    var self = this;

    this.db.serialize(function() {
        self.db.run('CREATE TABLE IF NOT EXISTS log_entries(id INTEGER PRIMARY KEY, time TEXT, level INTEGER, message TEXT, meta TEXT)');
        self.db.run('CREATE INDEX IF NOT EXISTS log_entries_time on log_entries(time)');
        self.db.run('CREATE INDEX IF NOT EXISTS log_entries_id on log_entries(id)');
        self.db.run('CREATE INDEX IF NOT EXISTS log_entries_level on log_entries(level)', function() {
            self.db_ready = true;
        });
    });
}

util.inherits(DbLogger, winston.Transport);

DbLogger.prototype.log = function(level, msg, meta, callback) {
    if(this.silent) {
        return callback(null, true);
    }

    var self = this;

    if(!self.db_ready) {
        console.log("Database is not ready yet. Entry will not be stored.");
        return callback(null, true);
    }

    var timestamp = new Date();

    // Check if we have timestamp in meta data
    if(meta !== undefined) {
        if(meta.timestamp != null) {
            timestamp = meta.timestamp;
        }

        meta = JSON.stringify(meta);
    }

    // TODO: We have to figure out if this is an array of events from the ble driver.
    // TODO: Postpone this to later.
    var stmt = this.db.prepare("INSERT INTO log_entries(time, level, message, meta) VALUES(?,?,?,?)");

    stmt.run(
        timestamp.toISOString(),
        convert_level(level),
        msg,
        meta,
        function(err) {
            if(err) {
                console.log(`Error storing log entry, ${err}`)
            }

            self.emit('logged');
            callback(null, this.lastID);
        }
    );
}

DbLogger.prototype.query = function(options, callback) {
    var self = this;

    if(!self.db_ready) {
        callback("Database is not ready.");
        return;
    }

    var opt = {
        start: options.start,
        limit: options.rows,
        sort: {id: options.order === 'desc' ? 'DESC' : 'ASC'}
    };

    var sql = `SELECT * FROM log_entries WHERE id >= ${opt.start} ORDER BY id ${opt.sort.id}`;

    var entries = [];

    self.db.each(sql,
        function(err, row) {
            if(err) {
                callback(err);
                return;
            }

            if(row == null) return;
            entries.push(row);
        }, function(err, row_count) {
            callback(null, entries);
        }
    );
}

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.DbLogger)({
            name: 'db_logger',
            filename: 'my_cool_db.db',
            level: 'info'
        }),
        new (winston.transports.File)({
            name: 'file',
            filename: 'log.txt',
            level: 'debug'
        }),
        new (winston.transports.Console)({
            name: 'console',
            level: 'info'
        })
    ]
});

module.exports = logger;