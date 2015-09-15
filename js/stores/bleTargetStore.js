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
import serialPort from 'serialport-electron';
import _ from 'underscore';
import fs from 'fs';

var bleTargetStore = reflux.createStore({

    init: function() {
        this.discoveredBleTargets = [];
        // TODO: Cannot find a way to clear this interval. No hook in reflux stores?
        this.detectInterval = setInterval(this._detectTargets.bind(this), 5000);
    },

    getInitialState: function() {
        this._detectTargets();
        return {discoveredBleTargets: this.discoveredBleTargets};
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
            if (!_.isEqual(newlyDiscoveredTargets, self.discoveredBleTargets)) {
                self.trigger({discoveredBleTargets: newlyDiscoveredTargets});
            }
            self.discoveredBleTargets = newlyDiscoveredTargets;
        });
    }
});

module.exports = bleTargetStore;
