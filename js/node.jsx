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

import React from 'react';

import Reflux from 'reflux';
import nodeStore from './stores/bleNodeStore';
import driverStore from './stores/bleDriverStore';

import ConnectedDevice from './components/ConnectedDevice.jsx';
import CentralDevice from './components/CentralDevice.jsx';

var BleNodeContainer = React.createClass({
    mixins: [Reflux.connect(nodeStore), Reflux.connect(driverStore)],

    render: function(){
        var connectedDevices = [];
        var central;
        if (this.state.connectedToDriver) {
            for (var i = 0; i < this.state.graph.length; i++) {
                var connectedDeviceCounter = 0;
                var node = this.state.graph[i];
                if (node.id === 'central') {
                    central = (<CentralDevice id={node.id} name={this.state.centralName} address={this.state.centralAddress.address} />)
                } else {
                    connectedDeviceCounter++;
                    connectedDevices.push(<ConnectedDevice id={node.id} sourceId='central' key={i} node={node} device={node.device} layout="horizontal"/>);
                }
            }
        }
        return (
            <div id="diagramContainer" style={this.props.style} >
                {central}
                <div className="padded-column" style={{position: 'absolute', top: '20px', left: '400px'}}>
                    {connectedDevices}
                </div>
            </div>
        );
    }
});

module.exports = BleNodeContainer;
