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

import Reflux from 'reflux';

import logger from '../logging';
import discoveryActions from '../actions/discoveryActions';
import adapterStore from './adapterStore.js';
import _ from 'underscore';

var discoveryStore = Reflux.createStore({

    listenables: [discoveryActions],

    init: function() {
        this.state = {
            discoveredDevices: {},
            scanInProgress: false,
            isConnecting: false,
            isAdapterOpen: false,
        };
        this.listenTo(adapterStore, this.onAdapterStoreChange);
    },

    onAdapterStoreChange: function(change) {
        if (change.connected) {
            this.adapter = change.openedAdapter;
            this.state.isAdapterOpen = true;
            this.trigger(this.state);
        } else {
            this.adapter = undefined;
            this.state.isAdapterOpen = false;
            this.trigger(this.state);
        }
    },

    getInitialState: function() {
        return this.state;
    },

    onStartScan: function() {
        const _this = this;
        logger.info('Starting scan...');

        var scanParameters = {
            active: true,
            interval: 100,
            window: 31.25,
            timeout: 0,
        };

        const deviceDiscoveredFunction = this.onDeviceDiscovered.bind(this);
        this.adapter.on('deviceDiscovered', deviceDiscoveredFunction);
        logger.info('Starting scan...');
        this.adapter.startScan(scanParameters, (error) => {
            if (error) {
                logger.error(error.message);
                this.adapter.removeListener('deviceDiscovered', deviceDiscoveredFunction);
            } else {
                _this.state.scanInProgress = true;
                _this.trigger(_this.state);
            }
        });
    },

    onStopScan: function() {
        logger.info('Stopping scan.');
        const _this = this;
        this.adapter.stopScan((error) => {
            if (error) {
                logger.error(error.message);
            } else {
                logger.info('Scan stopped');
                _this.state.scanInProgress = false;
                _this.trigger(_this.state);
            }
        });
    },

    onToggleScan: function() {
        if (this.state.scanInProgress) {
            this.onStopScan();
        } else {
            this.onStartScan();
        }
    },

    onScanStopped: function() {
        this.state.scanInProgress = false;
        this.trigger(this.state);
    },

    // Not an action handler.
    onDeviceDiscovered: function(device) {
        if (this.state.scanInProgress) {
            if (this.state.discoveredDevices[device.address]) {
                this.state.discoveredDevices[device.address] = mergeRecursive(this.state.discoveredDevices[device.address], device);
            } else {
                this.state.discoveredDevices[device.address] = device;
            }
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
    },

    onRemoveDevice: function(deviceAddress) {
        if (this.state.discoveredDevices !== null) {
            delete this.state.discoveredDevices[deviceAddress];
            this.trigger(this.state);
        }
    },

    onConnectStateChange: function(isConnecting) {
        this.state.isConnecting = isConnecting;
        this.trigger(this.state);
    }
});


//Merges the events received, the newest event overrides old values
// This is done to get the union of all historical properties as well as getting the 'last seen' property
function mergeRecursive(obj1, obj2) {
    for (var p in obj2) {
        try {
            // Property in destination object set; update its value.
            if (obj2[p].constructor == Object) {
                obj1[p] = mergeRecursive(obj1[p], obj2[p]);
            } else if (obj2[p].constructor === Array) {
                if (obj1[p]) {
                    obj1[p] = _.union(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            } else {
                obj1[p] = obj2[p] ? obj2[p] : obj1[p];
            }
        } catch (e) {
            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];
        }
    }

    return obj1;
}

module.exports = discoveryStore;
