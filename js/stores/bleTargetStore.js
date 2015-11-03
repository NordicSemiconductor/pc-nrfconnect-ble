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

import logger from '../logging';
import {api, driver} from 'pc-ble-driver-js';
import adapterActions from '../actions/adapterActions';

const AdapterFactory = api.AdapterFactory;

var AdapterStore = reflux.createStore({

    listenables: [adapterActions],

    init: function() {
        this.adapterFactoryInstance = new AdapterFactory(driver);
        this.adapterList = [];
        this._openedAdapter = undefined;

        // TODO: These should be removed as listeners somewhere
        this.adapterFactoryInstance.on('added', this.adapterAdded.bind(this));
        this.adapterFactoryInstance.on('removed', this.adapterRemoved.bind(this));
        this.adapterFactoryInstance.on('error', this.handleError.bind(this));

        // TODO: Cannot find a way to clear this interval. No hook in reflux stores?
        this.detectInterval = setInterval(this._detectAdapters.bind(this), 5000);
    },

    getInitialState: function() {
        this.state = {
            discoveredAdapters: [],
            connected: false,
            error: false,
            adapterState: undefined,
        };
        return this.state;
    },

    adapterAdded: function(newAdapter) {
        this.adapterList.push(newAdapter);
        this.state.discoveredAdapters = this.adapterList.map((adapter) => adapter.adapterState.port);
        this.trigger(this.state);
    },

    adapterRemoved: function(removedAdapter) {
        console.log('liksom remove');
    },

    handleError: function(error) {
        console.log('liskom handle error', error);
    },

    _detectAdapters: function() {
        const _this = this;
        let oldPortNames = this.adapterList.map( (adapter) => adapter.adapterState.port);

        this.adapterFactoryInstance.getAdapters(function(err, adapterMap) {
            let newPortNames = null;
            if (!err) {
                newPortNames = _.map(adapterMap, ( (adapter, key) => adapter.adapterState.port));
            }
            newPortNames.unshift('None');
            if (!_.isEqual(newPortNames, oldPortNames)) {
                _this.state.discoveredAdapters = newPortNames;
                _this.trigger(_this.state);
            }

            _this.adapterList = _.map(adapterMap, (adapter) => adapter);
        });
    },
    onConnect: function(portName) {
        const options = {
            baudRate: 115200,
            parity: 'none',
            flowControl: 'none',
            eventInterval: 1,
            logLevel: 'trace',
        };

        const adapterToConnectTo = this.adapterList.find( (adapter) => (adapter.adapterState.port === portName));
        const _this = this;
        adapterToConnectTo.open(options, (error) => {
            if (error) {
                logger.error(`Error occured opening serial port. ${error}`);
                _this.state.error = true;
                _this.state.connected = false;
                _this.trigger(_this.state);
            } else {
                logger.info(`Finished opening serial port ${portName}.`);
                _this.state.connected = true;
                _this.state.adapterState = adapterToConnectTo.adapterState;
                _this.trigger(_this.state);
                _this._openedAdapter = adapterToConnectTo;
            }
        })
    },

    onDisconnect: function(portName) {
        console.log('liksom disconnect');
    }

});

module.exports = AdapterStore;
