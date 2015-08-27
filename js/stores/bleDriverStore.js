'use strict';

import reflux from 'reflux';

import bleDriver from 'pc-ble-driver-js';

import bleDriverActions from '../actions/bleDriverActions';
import discoveryActions from '../actions/discoveryActions';
import connectionActions from '../actions/connectionActions';
import deviceActions from '../actions/deviceActions';
import logActions from '../actions/logActions';

import dummyAttributeData from '../utils/dummyAttributeData';

// No support for ecmascript6 classes in reflux
// https://github.com/reflux/refluxjs/issues/225
var bleDriverStore = reflux.createStore({

    listenables: [bleDriverActions],

    init: function(){
        this.state = {
            connectedToDriver: false,
            centralName: '',
            centralAddress: {}
        };
        this.eventCount = 0;
        this.connectionHandleToDescriptorsMap = {};
    },
    getInitialState: function() {
        return this.state;
    },
    onConnectToDriver: function(port) {
        var connectionParameters = {
            'baudRate': 115200,
            'parity': 'none',
            'flowControl': 'none',
            'logLevel': 'fatal',
            'eventInterval': 200,
            'logCallback': function(severity, message) {
                logActions.log('ble_driver', 'INFO', message);
            },
            eventCallback: this._mainEventListener.bind(this)
        };
        var self = this;
        bleDriver.open(port, connectionParameters, function(err) {
            if (err) {
                logActions.log('ble_driver', 'INFO', 'Error occured opening serial port: ' + err);
                self.state.connectedToDriver = false;
            }
            else
            {
                logActions.log('ble_driver', 'INFO', 'Finished opening UART on port ' + port);
                self.state.connectedToDriver = true;
                bleDriver.gap_get_address(function(gapAddress){
                    self.state.centralAddress = gapAddress;
                    logActions.log('ble_driver', 'INFO', 'Central BLE address is: ' + gapAddress.address);
                });

                bleDriver.gap_get_device_name(function(name){
                    self.state.centralName = name;
                    logActions.log('ble_driver', 'INFO', 'Central name is: ' + name);
                });
            }
            self.trigger(self.state);
        });
    },
    onGetCharacteristics: function(connectionHandle){
        this.connectionHandleToDescriptorsMap[connectionHandle] = [];
        var fullHandleRange = {
            start_handle: 1,
            end_handle: 0xffff
        };

        bleDriver.gattc_descriptor_discover(connectionHandle, fullHandleRange, function(err){
            // This function will trigger sending of BLE_GATTC_EVT_DESC_DISC_RSP events from driver
            if (err) {
                logActions.log('ble_driver', 'ERROR', err);
            } else {
                logActions.log('ble_driver', 'DEBUG',
                    `Started getting all characteristics for connection: ${connectionHandle}`);
            }

        });
    },
    onReadAllAttributes: function(connectionHandle) {
        // assumes that all attributes are already in this.connectionHandleToDescriptorsMap
        var firstAttributeHandle = this.connectionHandleToDescriptorsMap[connectionHandle][0].handle;
        this.connectionHandleToDescriptorsMap[connectionHandle].currentIndex = 0;
        bleDriver.gattc_read(connectionHandle, firstAttributeHandle, 0, function(err){
            if (err) {
                logActions.log('ble_driver', 'ERROR', `Error reading all attributes: ${err}`);
            }
        });
    },
    _mainEventListener: function(eventArray){
        for (var i = 0; i < eventArray.length; i++) {
            this.eventCount++;
            var event = eventArray[i];

            switch(event.id){
                case bleDriver.BLE_GAP_EVT_ADV_REPORT:
                    discoveryActions.advertisingPacketReceived(event);
                    break;
                case bleDriver.BLE_GAP_EVT_TIMEOUT:
                    switch(event.src) {
                        case bleDriver.BLE_GAP_TIMEOUT_SRC_SCAN:
                            discoveryActions.scanTimedOut(event);
                            logActions.log('ble_driver', 'INFO', 'Scan timed out');
                            break;
                        default:
                            logActions.log('ble_driver', 'INFO', `Something timed out: ${event.src}`);
                        }
                    break;
                case bleDriver.BLE_GAP_EVT_CONNECTED:
                    connectionActions.deviceConnected(event);
                    logActions.log('ble_driver', 'INFO', 'Device connected');
                    break;
                case bleDriver.BLE_GAP_EVT_DISCONNECTED:
                if (this.descriptorDiscoveryInProgress) {
                    this.descriptorDiscoveryInProgress = false;
                    this.currentConnectionHandle = -1;
                }
                    connectionActions.deviceDisconnected(event);
                    break;
                case bleDriver.BLE_GATTC_EVT_DESC_DISC_RSP:
                    if (event.count === 0) {
                        logActions.log('ble_driver', 'INFO', JSON.stringify(this.connectionHandleToDescriptorsMap));
                        console.log(JSON.stringify(this.connectionHandleToDescriptorsMap));
                        delete this.connectionHandleToDescriptorsMap[event.connecionHandle];
                        this.onReadAllAttributes(event.conn_handle);
                    } else {
                        this.connectionHandleToDescriptorsMap[event.conn_handle] =
                            this.connectionHandleToDescriptorsMap[event.conn_handle].concat(event.descs);
                        var handleRange = {
                            // TODO: Is it ok to assume contiguous handles here?
                            start_handle: this.connectionHandleToDescriptorsMap[event.conn_handle].length,
                            end_handle: 0xFFFF
                        };
                        bleDriver.gattc_descriptor_discover(event.conn_handle, handleRange, function(err){
                            if (err) {
                                logActions.log('ble_driver', 'ERROR', err);
                            }
                        });
                    }
                    break;
                case bleDriver.BLE_GATTC_EVT_READ_RSP:
                    var descriptors = this.connectionHandleToDescriptorsMap[event.conn_handle];

                    descriptors[descriptors.currentIndex].data = event.data;
                    descriptors.currentIndex = descriptors.currentIndex + 1;
                    if (descriptors.currentIndex >= descriptors.length) {
                        logActions.log('ble_driver', 'INFO', JSON.stringify(descriptors));
                        console.log(JSON.stringify(descriptors));
                        deviceActions.deviceAttributesUpdated(dummyAttributeData);
                    } else {
                        bleDriver.gattc_read(event.conn_handle, descriptors[descriptors.currentIndex].handle, 0, function(err){
                            if (err) {
                                logActions.log('ble_driver', 'ERROR', err);
                                console.log(err);
                            }
                        });
                    }

                    break;
                default:
                    logActions.log('ble_driver', 'INFO', 'Unsupported event received from SoftDevice: ' + event.id + '-' + event.name);
                    console.log('Unsupported event: ' + event.id + '-' + event.name);
            }
        }
    }
});

module.exports = bleDriverStore;