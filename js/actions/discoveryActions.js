'use strict';

var Reflux = require('reflux');

var discoveryActions = Reflux.createActions(
    [
    "advertisingPacketReceived",
    "startScan",
    "stopScan",
    "connectDriver",
    "scanStopped",
    "scanTimedOut",
    "clearItems"
  ]);

module.exports = discoveryActions;
