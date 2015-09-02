'use strict';

import reflux from 'reflux';
import serialPort from 'serialport-electron';
import child_process from 'child_process';

import bleTargetActions from '../actions/bleTargetActions';
import fs from 'fs';

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
        var portName = '';
        serialPort.list(function(err, ports) {
            self.discoveredBleTargets = ports.map(function(port){
                portName = port.comName;
                if (process.platform === 'darwin') {
                    var modPortName = portName.replace('/dev/cu.', '/dev/tty.'); //workaround for wrong port location on darwin (OSX)
                    if(fs.existsSync(modPortName)) {
                        portName = modPortName;
                    }
                }
                return  {payload: 'maybenoutused', text: portName}; 
            });
            self.discoveredBleTargets.unshift({payload: 'notused', text:'None'});
            self.trigger(self.discoveredBleTargets);
        });
    }
});

module.exports = bleTargetStore;
