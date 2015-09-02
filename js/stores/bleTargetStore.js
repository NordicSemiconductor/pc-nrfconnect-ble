'use strict';

import reflux from 'reflux';
import serialPort from 'serialport-electron';

import fs from 'fs';

var bleTargetStore = reflux.createStore({

    init: function() {
        this._detectTargets();

        // TODO: Cannot find a way to clear this interval. No hook in reflux stores?
        this.detectInterval = setInterval(this._detectTargets.bind(this), 5000);
    },

    getInitialState: function() {
        return {discoveredBleTargets: []};
    },
    _detectTargets: function() {
        var self = this;
        var portName = '';
        serialPort.list(function(err, ports) {
            var newlyDiscoveredTargets = ports.map(function(port){
                portName = port.comName;
                if (process.platform === 'darwin') {
                    var modPortName = portName.replace('/dev/cu.', '/dev/tty.'); //workaround for wrong port location on darwin (OSX)
                    if(fs.existsSync(modPortName)) {
                        portName = modPortName;
                    }
                }
                return portName; 
            });
            newlyDiscoveredTargets.unshift('None');
            self.trigger({discoveredBleTargets: newlyDiscoveredTargets});
        });
    }
});

module.exports = bleTargetStore;
