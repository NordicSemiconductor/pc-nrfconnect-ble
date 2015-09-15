'use strict';

var Reflux = require('reflux');

var connectionActions = Reflux.createActions(
    [

    "connectToDevice",
    "disconnectFromDevice",
    "cancelConnect",
    "deviceConnected",
    "deviceDisconnected",
    "servicesDiscovered"
  ]);

module.exports = connectionActions;
