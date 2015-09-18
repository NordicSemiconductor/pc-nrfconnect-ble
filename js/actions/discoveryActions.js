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

var Reflux = require('reflux');

var discoveryActions = Reflux.createActions(
    [
    "advertisingPacketReceived",
    "startScan",
    "stopScan",
    "toggleScan",
    "connectDriver",
    "scanStopped",
    "scanTimedOut",
    "clearItems",
    "removeDevice",
    "connectStateChange"
  ]);

module.exports = discoveryActions;
