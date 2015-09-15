'use strict';

import React from 'react';
import Reflux from 'reflux';

import logger from './logging';

var discoveryStore = require('./stores/discoveryStore');
var connectionStore = require('./stores/connectionStore');
var nodeStore = require('./stores/bleNodeStore');

var discoveryActions = require('./actions/discoveryActions');
var connectionActions = require('./actions/connectionActions');
var DiscoveryButton = require('./discoveryButton');
var ConnectedDevice = require('./components/ConnectedDevice.jsx');
var MIN_RSSI = -100;
var MAX_RSSI = -45;


function prepareDeviceData(device) {
    return {
        time: new Date(device.time),
        name: (device.data
            ? (device.data.BLE_GAP_AD_TYPE_COMPLETE_LOCAL_NAME || device.data.BLE_GAP_AD_TYPE_SHORT_LOCAL_NAME || "<Unkown name>")
            : "<Unkown name>"),
        flags: device.processed ? device.processed.flags : [],
        services: device.processed && device.processed.services ? device.processed.services : [],
        address: device.peer_addr.address,
        rssi: device.rssi,
        rssi_level: mapRange(device.rssi, MIN_RSSI, MAX_RSSI, 4, 20)
    };
}

var DiscoveredDevice = React.createClass({
    mixins: [Reflux.connect(discoveryStore)],

    _onConnect: function() {
        connectionActions.connectToDevice(this.props.device);
        this.myButtonIsConnecting = true;
    },
    _onCancelConnect: function() {
        connectionActions.cancelConnect();
        this.myButtonIsConnecting = false;
    },
    componentDidMount: function() {
        this.myButtonIsConnecting = false;
    },

    render: function() {
        if(!this.props.device) {
            return (<div>
                    <h3 style={{textAlign: 'center'}}>Local dongle</h3>
                    </div>
                );
        }
        var device = prepareDeviceData(this.props.device);
        var button = (
            <button onClick={this._onConnect} className="btn btn-primary btn-xs btn-nordic" disabled ={this.props.isConnecting}>
                Connect <i className="icon-link"></i>
            </button>
        );
        if (this.props.isConnecting && this.myButtonIsConnecting) {
            button = (
                <button onClick={this._onCancelConnect} className="btn btn-primary btn-xs btn-nordic">
                    Cancel connect <i className="icon-link"></i>
                </button>
            );
        }
        return (
            <div className="device">
                <div className="top-bar">
                    <div style={{float: 'right'}}>
                        <span style={{width: device.rssi_level + 'px'}} className="icon-signal icon-foreground" />
                        <span className="icon-signal icon-background" />
                    </div>
                    <div className="text-small truncate-text">{device.name}</div>
                </div>
                <div className="device-body text-small">
                    <div className="discovered-device-address-line">
                        {button}
                        <div className="text-smaller subtle-text">
                            {device.address}
                        </div>
                    </div>
                    <div className="flag-line">
                        {device.services.map(function(service, index) {
                            return (<div key={index} className="device-flag">{service}</div>)
                        })}
                    </div>

                </div>
            </div>
        );
    }
});

function mapRange(n, fromMin, fromMax, toMin, toMax) {
    //scale number n from the range [fromMin, fromMax] to [toMin, toMax]
    n = toMin + ((toMax - toMin) / (fromMax - fromMin)) * (n - fromMin)
    n = Math.round(n);
    return Math.max(toMin, Math.min(toMax, n));
}

var DiscoveredDevicesContainer = React.createClass({
    mixins: [Reflux.connect(discoveryStore), Reflux.connect(connectionStore)],
    _clearContainer: function() {
        discoveryActions.clearItems();
    },
    render: function() {
        if (this.state.discoveredDevices) {
            var connectedDevices = this.state.connections;
            var devices = {};
            for(var device in this.state.discoveredDevices) {
                var isDeviceConnected = false;
                for (var i = 0; i < connectedDevices.length; i++) {
                    if (connectedDevices[i].peer_addr.address === this.state.discoveredDevices[device].peer_addr.address) {
                        isDeviceConnected = true;
                        break;
                    }
                }
                if (!isDeviceConnected) {
                    devices[this.state.discoveredDevices[device].peer_addr.address] = this.state.discoveredDevices[device];
                }
            }
            var progressMode = this.state.scanInProgress ? 'indeterminate' : 'determinate';
            var progressStyle = {
                visibility: this.state.scanInProgress ? 'visible' : 'hidden',
            }
            var isConnecting = this.state.isConnecting;
            return (
              <div id="discoveredDevicesContainer">
                <div>
                    <h4>
                        Discovered devices
                        <img className="spinner" src="resources/ajax-loader.gif" height="16" width="16" style={progressStyle} />
                    </h4>
                </div>
                <div className="padded-list">
                    <DiscoveryButton/>
                    <button onClick={this._clearContainer} type="button" className="btn btn-primary btn-sm btn-nordic padded-list">
                        <span className="icon-trash" />Clear
                    </button>
                </div>
                <div style={{paddingTop: '0px'}}>
                  {Object.keys(devices).map(function(device, index) {
                    return (
                            <DiscoveredDevice key= {index}
                                device={devices[device]}
                                standalone={false}
                                isConnecting={isConnecting}
                            />)
                  })}
                </div>
              </div>)
      } else {
          logger.silly("No data!!!!!!!!!!!!!!!!!!!!!!!!!!");
          return <div id="discoveredDevicesContainer"></div>;
      }
    }
});

module.exports = {
    DiscoveredDevicesContainer: DiscoveredDevicesContainer,
    DiscoveredDevice: DiscoveredDevice
}
