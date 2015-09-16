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

import reflux from 'reflux';

import logger from '../logging';
import discoveryActions from '../actions/discoveryActions';
import logActions from '../actions/logActions';

import uuidDefinitions from '../utils/uuid_definitions'

import bleDriver from 'pc-ble-driver-js';

var discoveryStore = reflux.createStore({
    listenables: [discoveryActions],

    init: function() {
        this.state = {
            discoveredDevices: {},
            scanInProgress: false
        };
    },
    getInitialState: function() {
        return this.state;
    },
    onStartScan: function() {
        var self = this;
        logger.info('Starting scan...');

        var scanParameters = {
            active: true,
            interval: 100,
            window: 31.25,
            timeout: 120
        };

        bleDriver.start_scan(scanParameters, function(err) {
            if (err) {
                logger.error('Error occured when starting scan');
                return;
            }
            self.state.scanInProgress = true;
            self.trigger(self.state);
        });
    },
    onStopScan: function() {
        var self = this;
        logger.info('Stopping scan.');
        self.state.scanInProgress = false;

        bleDriver.stop_scan(function(err) {
            if (err) {
                logger.error(`Error occurred when stopping scan: ${err}`);
            } else {
                self.trigger(self.state);
            }
        });
    },
    onToggleScan: function(){
        logger.silly(`Toggling scan from ${this.state.scanInProgress} to ${!this.state.scanInProgress}.`);
        if(this.state.scanInProgress) {
            this.onStopScan()
        } else {
            this.onStartScan();
        }
    },
    onScanStopped: function() {
        this.state.scanInProgress = false;
        this.trigger(this.state);
    },
    onAdvertisingPacketReceived: function(event){
        if (this.state.scanInProgress) {
            updateDevices(this.state.discoveredDevices, event.peer_addr.address, event);
        }
        // TODO: Evaluate whether it is OK to drop events received when not scanning.
        this.trigger(this.state);
    },
    scanTimedOut: function() {
        this.state.scanInProgress = false;
        this.trigger(this.state);
    },
    onClearItems: function() {
        this.state.discoveredDevices = {};
        this.trigger(this.state);
    }
});

 function updateDevices(discoveredDevices, deviceAddress, event) {
    // The processed object is used to store processed event information.
    event.processed = {};

    sanitizeFlags(event);
    convertServiceUuidsToHumanReadableNames(event);

    if (discoveredDevices[deviceAddress]) {
        discoveredDevices[deviceAddress]= mergeRecursive(discoveredDevices[deviceAddress], event);
    } else {
        discoveredDevices[deviceAddress] = event;
    }
}

// Cleans up the flags, making them readable
function sanitizeFlags(event) {
    if ('data' in event)
    {
        if ('BLE_GAP_AD_TYPE_FLAGS' in event.data) {
            var flags = event.data.BLE_GAP_AD_TYPE_FLAGS.map(function(flag) {
                return camelCaseFlag(flag);
            });
            event.processed.flags = flags;
        }
    }
}
function convertServiceUuidsToHumanReadableNames(event) {
    if ('data' in event) {
        var services = [];

        if('BLE_GAP_AD_TYPE_16BIT_SERVICE_UUID_MORE_AVAILABLE' in event.data) {
            services = event.data.BLE_GAP_AD_TYPE_16BIT_SERVICE_UUID_MORE_AVAILABLE.map(function(service) {
                return uuidToService(service);
            });
        }
        else if ('BLE_GAP_AD_TYPE_16BIT_SERVICE_UUID_COMPLETE' in event.data) {
            services = event.data.BLE_GAP_AD_TYPE_16BIT_SERVICE_UUID_COMPLETE.map(function(service) {
                return uuidToService(service);
            });
        }

        // Only set the services property if there where any services found
        if(services.length > 0) {
            event.processed.services = services;
        }
    }
}

function camelCaseFlag(flag) {
    const advFlagsPrefix = 'BLE_GAP_ADV_FLAG';

    if (flag.indexOf(advFlagsPrefix) === 0) {
        // Remove not needed prefix and lowercase the string
        var flagCamelCase = flag.replace(
            /^BLE_GAP_ADV_FLAG[S]?_(.*)/g,
            function($1, $2) {
                return $2.toLowerCase()
                .replace(/(\_[a-z])/g,
                    function($1) {
                        var camelCase = $1.toUpperCase().replace('_','');
                        return camelCase[0].toUpperCase() + camelCase.slice(1);
                     });
            });
        return flagCamelCase[0].toUpperCase() + flagCamelCase.slice(1);
    } else {
        return "NOT_ABLE_TO_CAMELCASE_THIS_FLAG: " + flag;
    }
}

// TODO: look into using a database for storing the services UUID's. Also look into importing them from the Bluetooth pages.
// TODO: Also look into reusing code from the Android MCP project:
// TODO: http://projecttools.nordicsemi.no/stash/projects/APPS-ANDROID/repos/nrf-master-control-panel/browse/app/src/main/java/no/nordicsemi/android/mcp/database/init
// TODO: http://projecttools.nordicsemi.no/stash/projects/APPS-ANDROID/repos/nrf-master-control-panel/browse/app/src/main/java/no/nordicsemi/android/mcp/database/DatabaseHelper.java
function uuidToService(uuid) {
    var uuidName;
    if (uuid.match('0000....-0000-1000-8000-00805F9B34FB')) {
        uuidName = uuidDefinitions['0x' + uuid.slice(4, 8)];

        if (uuidName === undefined) {
            uuidName = uuid.slice(4, 8);
        }
    } else {
        uuidName = uuid.slice(4, 8) + '*';
    }

    return uuidName;
}

//Merges the events received, the newest event overrides old values
// This is done to get the union of all historical properties as well as getting the 'last seen' property
function mergeRecursive(obj1, obj2) {
    for (var p in obj2) {
        try {
            // Property in destination object set; update its value.
            if ( obj2[p].constructor==Object ) {
              obj1[p] = mergeRecursive(obj1[p], obj2[p]);
            } else {
              obj1[p] = obj2[p];
            }
        } catch(e) {
            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];
        }
    }
    return obj1;
}

module.exports = discoveryStore;
