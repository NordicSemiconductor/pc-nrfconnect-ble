'use strict';

var Reflux = require('reflux');

var connectionActions = Reflux.createActions(
    [

    "connectToDevice",
    "disconnectFromDevice",
    "deviceConnected",
    "deviceDisconnected",
    "servicesDiscovered"
  ]);

module.exports = connectionActions;
