'use strict';

var reflux = require('reflux');
var bleTargetActions = require('../actions/bleTargetActions');
var serialPort = require('serialport-electron');

var bleTargetStore = reflux.createStore({
    listenables: [bleTargetActions],

    init: function() {
        this.discoveredBleTargets = [{payload: '1', text: 'None'}];
        this.chosen_port = null;
    },

    getInitialState: function() {
        return this.discoveredBleTargets;
    },
    onStartBleTargetDetect: function() {
        var self = this;
        var portNum = 1;
        serialPort.list(function(err, ports) {
            ports.forEach(function(port) {
                self.discoveredBleTargets.push({payload: '' + portNum, text: port.comName});
                portNum = portNum + 1;
            });

            self.trigger(self.discoveredBleTargets);
        });
    }
});

module.exports = bleTargetStore;
