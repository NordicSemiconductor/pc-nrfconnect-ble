'use strict';

var app = require('app');
var fs = require('fs-extra');
var path = require('path');
var data = null;

var dataFilePath = path.join(app.getPath('userData'), 'data.json');
let uuidDefinitionsFilePath = path.join(app.getPath('userData'), 'uuid_definitions.json');

function load() {
    if (data !== null) {
        return;
    }

    if (!fs.existsSync(dataFilePath)) {
        data = {};
        return;
    }

    try {
        data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    }
    catch (err) {
        console.log('Could not load settings. Reason: ', err);
        data = null;
    }
}

function save() {
    fs.writeFileSync(dataFilePath, JSON.stringify(data));
}

exports.set = function (key, value) {
    load();
    data[key] = value;
    save();
};

exports.get = function (key) {
    load();
    var value = null;

    if (key in data) {
        value = data[key];
    }

    return value;
};

exports.unset = function (key) {
    load();
    if (key in data) {
        delete data[key];
        save();
    }
};

exports.loadLastWindow = function () {
    var lastWindowState = this.get('lastWindowState');

    if (lastWindowState === null) {
        lastWindowState = {
            width: 1024,
            height: 800,
            maximized: false,
        };
    }

    return lastWindowState;
};

exports.storeLastWindow = function (lastWindowState) {
    var bounds = lastWindowState.getBounds();

    this.set('lastWindowState', {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        maximized: lastWindowState.isMaximized(),
    });
};

exports.confirmUserUUIDsExist = function () {
    if (!fs.existsSync(uuidDefinitionsFilePath)) {
        fs.copy('./uuid_definitions.json', uuidDefinitionsFilePath, function (err) {
            if (err) {
                console.error('Could not copy uuid definitions file to ', uuidDefinitionsFilePath, ' Error: ', err);
            }
        });
    }
};
