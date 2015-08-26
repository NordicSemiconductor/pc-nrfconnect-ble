'use strict';

var Reflux = require('reflux');

var logActions = Reflux.createActions(
    [
        "search",
        "follow",
        "open",
        "add",
        "log"
    ]);

module.exports = logActions;
