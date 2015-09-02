'use strict';

var Reflux = require('reflux');

var logActions = Reflux.createActions(
    [
        "search",
        "follow"
    ]);

module.exports = logActions;
