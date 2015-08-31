'use strict';

import reflux from 'reflux';
import _ from 'underscore';

import bleDriver from 'pc-ble-driver-js';

import connectionActions from'../actions/connectionActions';
import graphActions from '../actions/bleGraphActions';
import discoveryActions from '../actions/discoveryActions';
import driverActions from '../actions/bleDriverActions';

var connectionStore = reflux.createStore({
    listenables: [connectionActions],
    mixins: [reflux.connect()],
    init: function() {
        this.state = {
            connections: [],
        };
        this.devicesAboutToBeConnected = {};
    },
    _findConnectionHandleFromDeviceAddress: function(deviceAddress) {
        for(var i = 0; i < this.state.connections.length; i++) {
            if (this.state.connections[i].peer_addr.address === deviceAddress) {
                return this.state.connections[i].conn_handle;
            }
        }
        return undefined;
    },
    _findDeviceFromDeviceAddress: function(deviceAddress) {
        return this.state.connections.find(function(connection){
            return connection.peer_addr.addr === deviceAddress;
        });
    },
    getInitialState: function() {
        return this.state;
    },

    onConnectToDevice: function(device) {
        // There is no connection until we receive the BLE_GAP_EVT_CONNECTED event
        console.log("Initiated connection to", JSON.stringify(device.peer_addr));
        var scanParameters = {
            'active': true, 'interval': 100, 'window': 50, 'timeout': 20
        };
        var connectionParameters = {
            'min_conn_interval': 30, 'max_conn_interval': 60, 'slave_latency': 0, 'conn_sup_timeout': 4000
        };
        var self = this;
        bleDriver.gap_connect(device.peer_addr, scanParameters, connectionParameters, function(err) {
            if(err) {
                console.log('Could not connect: ', err);
                bleDriver.gap_cancel_connect(function(err) {
                    if (err) {
                        console.log('Could not cancel connection');
                        return;
                    }
                    console.log('Canceled connection');
                });
            } else {
                console.log('successfully sent connection request to driver');
                discoveryActions.scanStopped();
                self.devicesAboutToBeConnected[device.peer_addr.addr] = device;
            }
        });

    },
    onDeviceConnected: function(eventPayload){
        console.log('Connection complete to %s', eventPayload.peer_addr.addr);
        driverActions.getCharacteristics(eventPayload.conn_handle);
        this.state.connections.push(eventPayload);
        this.trigger(this.state);

        var device = this.devicesAboutToBeConnected[eventPayload.peer_addr.addr];
        delete this.devicesAboutToBeConnected[eventPayload.peer_addr.addr];
        graphActions.addNode(device, eventPayload);
    },
    onDeviceDisconnected: function(eventPayload){
        console.log('disconnected');
        var connectionThatWasDisconnected = _.find(this.state.connections, function(connection){
            return (connection.conn_handle == eventPayload.conn_handle);
        });
        graphActions.removeNode(connectionThatWasDisconnected.peer_addr.address);
        this.state.connections = _.reject(this.state.connections, function(device) {
            return (device.conn_handle === eventPayload.conn_handle); // Prune all with invalid connectionHandle
        });
        this.trigger(this.state);
    },
    onDisconnectFromDevice: function(deviceAddress) {
        var connectionHandle = this._findConnectionHandleFromDeviceAddress(deviceAddress);
        bleDriver.gap_disconnect(connectionHandle, bleDriver.BLE_HCI_REMOTE_USER_TERMINATED_CONNECTION, function(err){
            console.log('call to disconnect ok', err);
        });
    }
});
module.exports = connectionStore;