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
                    attributeData: dummyData
                }
            ]
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