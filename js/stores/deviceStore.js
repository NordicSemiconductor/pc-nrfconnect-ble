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

import deviceActions from '../actions/deviceActions';
import dummyData from '../utils/dummyAttributeData';


var deviceStore = reflux.createStore({
    listenables: [deviceActions],
    init: function() {
        this.state = {
            devices: [
                {
                    name: 'mydevice',

                }
            ],
            attributeDatabase: []
        };
    },
    getInitialState: function() {
        return this.state;
    },
    onDeviceAttributesUpdated: function(services) {
        this.state.services = services;
        this.trigger(this.state);
    }
});

module.exports = deviceStore;