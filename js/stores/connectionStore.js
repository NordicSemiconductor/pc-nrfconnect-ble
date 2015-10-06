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
import _ from 'underscore';
import changeCase from 'change-case';

import bleDriver from 'pc-ble-driver-js';

import textual from '../ble_driver_textual';
import logger from '../logging';

import {connectionActions} from'../actions/connectionActions';
import graphActions from '../actions/bleGraphActions';
import discoveryActions from '../actions/discoveryActions';
import driverActions from '../actions/bleDriverActions';

var connectionStore = reflux.createStore({
    listenables: [connectionActions],
    mixins: [reflux.connect()],
    init: function() {
        this.state = {
            connections: [],
            deviceAddressToServicesMap: {},
            isConnecting: false,
            isEnumeratingServices: false,
            eventsToShowUser: []
        };
        this.devicesAboutToBeConnected = {};
        this.eventIdCounter = 0;
    },
    _findConnectionHandleFromDeviceAddress: function(deviceAddress) {
        for(var i = 0; i < this.state.connections.length; i++) {
            if (this.state.connections[i].peer_addr.address === deviceAddress) {
                return this.state.connections[i].conn_handle;
            }
        }
        return undefined;
    },
    _findConnectionFromConnectionHandle: function(connectionHandle) {
        return this.state.connections.find(function(connection){
            return connection.conn_handle===connectionHandle;
        });
    },
    getInitialState: function() {
        return this.state;
    },

    onConnectToDevice: function(device) {
        // There is no connection until we receive the BLE_GAP_EVT_CONNECTED event
        logger.info(`Initiated connection to ${textual.peerAddressToTextual(device)}.`);
        var scanParameters = {
            'active': true, 'interval': 100, 'window': 50, 'timeout': 20
        };
        var connectionParameters = {
            'min_conn_interval': 7.5, 'max_conn_interval': 7.5, 'slave_latency': 0, 'conn_sup_timeout': 4000
        };

        var self = this;
        bleDriver.gap_connect(device.peer_addr, scanParameters, connectionParameters, function(err) {
            if(err) {
                logger.error(`Could not connect to ${textual.peerAddressToTextual(device)} due to error. ${err.message}`);
                self.state.isConnecting = false;
                discoveryActions.connectStateChange(self.state.isConnecting);
            } else {
                logger.debug(`Successfully sent connection request to driver (${textual.peerAddressToTextual(device)}).`);
                discoveryActions.scanStopped();
                self.devicesAboutToBeConnected[device.peer_addr.addr] = device;
                self.state.isConnecting = true;
                discoveryActions.connectStateChange(self.state.isConnecting);
            }

            self.trigger(self.state);
        });
    },
    onCancelConnect: function() {
        var self = this;
        bleDriver.gap_cancel_connect(function(err) {
            if (err) {
                logger.error(`Could not cancel connection. ${err.message}.`);
                //TODO: what happens here? If driver fails to cancel connection can we just move on?
            }
            logger.info('Canceled connection');
            self.state.isConnecting = false;
            discoveryActions.connectStateChange(self.state.isConnecting);
            self.trigger(self.state);
        });
    },
    onConnectTimedOut: function() {
        var self = this;
        logger.info("Connection timed out");
        self.state.isConnecting = false;
        discoveryActions.connectStateChange(self.state.isConnecting);
        self.trigger(self.state);
    },
    onDeviceConnected: function(eventPayload){
        logger.info(`${changeCase.ucFirst(textual.peerAddressToTextual(eventPayload))} (handle #${eventPayload.conn_handle}) connected.`);
        driverActions.getCharacteristics(eventPayload.conn_handle);
        this.state.isEnumeratingServices = true;
        this.state.connections.push(eventPayload);
        this.trigger(this.state);

        var device = this.devicesAboutToBeConnected[eventPayload.peer_addr.addr];
        delete this.devicesAboutToBeConnected[eventPayload.peer_addr.addr];
        graphActions.addNode(device, eventPayload);
        this.state.isConnecting = false;
        discoveryActions.connectStateChange(this.state.isConnecting);

        // Delete the device from the discovered devices store. This is a temporary solution until
        // refactoring is done.
        discoveryActions.removeDevice(eventPayload.peer_addr.address);

        this.trigger(this.state);
    },
    onConnectionParametersUpdateRequest: function(event, eventType) {
        var connectionToUpdate = this._findConnectionFromConnectionHandle(event.conn_handle);
        const connectionUpdateEvent = {
            eventType,
            id: this.eventIdCounter++,
            deviceAddress: connectionToUpdate.peer_addr.address,
            payload: event
        };
        this.state.eventsToShowUser.push(connectionUpdateEvent);

        this.trigger({eventsToShowUser: this.state.eventsToShowUser});
        // Do autoreply here if set up to do so.
    },
    onConnectionParametersUpdate: function(connectionHandle, connectionParameters, updateId) {
        console.log(JSON.stringify(connectionParameters));
        var that = this;
        let updateEvent = this.state.eventsToShowUser.find(event => event.id===updateId);
        bleDriver.gap_update_connection_parameters(connectionHandle, connectionParameters, function(err){
            if (err) {
                logger.error(err.message);
                updateEvent.state = 'error';
                that.trigger({
                    eventsToShowUser: that.state.eventsToShowUser
                });
            } else {
                logger.info('Successfully sent gap_update_connection_parameters to driver.');
                updateEvent.state = 'success';
                that.trigger({
                    eventsToShowUser: that.state.eventsToShowUser
                });
            }
        });

        updateEvent.state= 'indeterminate';
        this.trigger(
            {
                eventsToShowUser: this.state.eventsToShowUser
            }
        );
    },
    onConnectionParametersUpdated: function(event) {
        var connection = this._findConnectionFromConnectionHandle(event.conn_handle);
        connection.conn_params = event.conn_params;
        var theConnection = this._findConnectionFromConnectionHandle(event.conn_handle);
        this.trigger({
            connectionBeingUpdated: undefined
        });
    },
    onDeviceDisconnected: function(eventPayload){
        // This is called when a device actually has disconnected
        this.state.isEnumeratingServices = false; // In case we disconnect while enumerating services

        var connectionThatWasDisconnected = _.find(this.state.connections, function(connection){
            return (connection.conn_handle == eventPayload.conn_handle);
        });

        var deviceId = connectionThatWasDisconnected.peer_addr.address + '-' + eventPayload.conn_handle;

        logger.info(`${changeCase.ucFirst(textual.peerAddressToTextual(connectionThatWasDisconnected))} (handle #${eventPayload.conn_handle}) disconnected. Disconnect reason is ${eventPayload.reason_name}.`);
        graphActions.removeNode(deviceId);

        this.state.connections = _.reject(this.state.connections, function(device) {
            return (device.conn_handle === eventPayload.conn_handle); // Prune all with invalid connectionHandle
        });

        // TODO: Discard potential events for the disconnected device
        //delete this.state.updateRequests[eventPayload.conn_handle];
        
        // Delete the device from the discovered devices store. This is a temporary solution until
        // refactoring is done.
        discoveryActions.removeDevice(connectionThatWasDisconnected.peer_addr.address);

        this.trigger(this.state);
    },
    onDisconnectFromDevice: function(deviceAddress) {
        var connectionHandle = this._findConnectionHandleFromDeviceAddress(deviceAddress);
        this.state.isEnumeratingServices = false;

        if(connectionHandle === undefined) {
            logger.error(`Device ${deviceAddress} is not in connection database. Removing node from graph. TODO: this should not happen!`);
            return;
        }

        bleDriver.gap_disconnect(connectionHandle, bleDriver.BLE_HCI_REMOTE_USER_TERMINATED_CONNECTION, function(err){
            if(err) {
                logger.error(`Error disconnecting from ${textual.peerAddressToTextual(deviceAddress)} (handle #${connectionHandle}). Error is ${err.message}.`);
                return;
            }
            logger.silly(`call to disconnect from ${deviceAddress} ok.`);
        });
    },
    onServicesDiscovered: function(gattDatabase) {
        this.state.isEnumeratingServices = false;
        var connectionHandle = gattDatabase.connectionHandle;
        var connection = this.state.connections.find(function(conn) {
            return (conn.conn_handle === connectionHandle);
        });

        let deviceId = connection.peer_addr.address + '-' + connectionHandle;

        this.state.deviceAddressToServicesMap[deviceId] = gattDatabase.services;
        this.trigger({deviceAddressToServicesMap: this.state.deviceAddressToServicesMap});
        window.hackorama = () => this.hackorama();
    },

    hackorama: function() {
        var address = Object.keys(this.state.deviceAddressToServicesMap)[0];
        var services = this.state.deviceAddressToServicesMap[address];
        services[3].characteristics[0].value = "" + Math.floor(Math.random()*99);
        //services[3].characteristics[0].descriptors[0].value = "" + Math.floor(Math.random()*99);
        console.log("new values are: " + services[3].characteristics[0].value + " and " + services[3].characteristics[0].descriptors[0].value);
        this.trigger({deviceAddressToServicesMap: this.state.deviceAddressToServicesMap});
    }
});
module.exports = connectionStore;
