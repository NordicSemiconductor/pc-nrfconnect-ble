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

import {api, driver} from 'pc-ble-driver-js';
import adapterActions from '../actions/adapterActions';

const AdapterFactory = api.AdapterFactory;

var AdapterStore = reflux.createStore({

    init: function() {
        this.adapterFactoryInstance = new AdapterFactory(driver);
        this.adapterList = [];
        this.adapterFactoryInstance.on('added', this.adapterAdded.bind(this));
        this.adapterFactoryInstance.on('removed', this.adapterRemoved.bind(this));
        this.adapterFactoryInstance.on('error', this.handleError.bind(this));

        // TODO: Cannot find a way to clear this interval. No hook in reflux stores?
        this.detectInterval = setInterval(this._detectAdapters.bind(this), 5000);
    },

    getInitialState: function() {
        return {
            discoveredAdapters: this.adapterList,
            connected: false,
            error: false,
        };
    },

    adapterAdded: function(newAdapter) {
        this.adapterList.push(newAdapter);
        this.trigger({discoveredAdapters: this.adapterList.map( (adapter) => {
            console.log(adapter);
            adapter.adapterState.port;
        })});
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
                _this.trigger({discoveredAdapters: newPortNames});
            }

            _this.adapterList = _.map(adapterMap, (adapter) => adapter);
        });
    },
    onConnect: function(portName) {
        const adapterToConnectTo = this.adapterList.find( (adapter) => (adapter.adapterState.port === portName));
        console.log('Liksom connect to ', adapterToConnectTo.adapterState.port);
    },

    onDisconnect: function(portName) {
        console.log('liksom disconnect');
    }

});

module.exports = AdapterStore;
