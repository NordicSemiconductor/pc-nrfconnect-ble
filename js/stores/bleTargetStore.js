'use strict';

import reflux from 'reflux';
import serialPort from 'serialport-electron';
import child_process from 'child_process';

import bleTargetActions from '../actions/bleTargetActions';

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
        var portName = '';
        serialPort.list(function(err, ports) {
            ports.forEach(function(port) {
                portName = port.comName;
                var modPortName = portName.replace('/dev/cu.', '/dev/tty.'); //workaround for wrong port location on darwin (OSX)
                portExists(modPortName, portName, function(exists, modPortName, origPortName) {
                    var portname;
                    if (exists) {
                        portname = modPortName;
                     } else {
                        portname = origPortName;
                    }
                    self.discoveredBleTargets.push({payload: '' + portNum, text: portname});
                    portNum = portNum + 1;
                    self.trigger(self.discoveredBleTargets);
                });
            });
        });
    }
});

var portExists = function(portName, origPortName, callback) {
    child_process.exec('ls /dev/tty.*', function(err, stdout, stderr){
        var listedPorts = stdout.split("\n").slice(9, -1);
        var exists;
        if (listedPorts.indexOf(portName) > -1) {
            exists = true;
        } else {
            exists = false;
        }
        callback(exists, portName, origPortName)
    });
}

module.exports = bleTargetStore;
