'use strict';

import React from 'react';
import Reflux from 'reflux';

let {Paper, List, ListItem, RaisedButton, CircularProgress} = require('material-ui');
var discoveryStore = require('./stores/discoveryStore');
var connectionStore = require('./stores/connectionStore');

var discoveryActions = require('./actions/discoveryActions');
var connectionActions = require('./actions/connectionActions');
var DiscoveryButton = require('./discoveryButton');
var MIN_RSSI = -100;
var MAX_RSSI = -45;


function prepareDeviceData(device) {
    return {
        time: new Date(device.time),
        name: (device.data 
            ? (device.data.BLE_GAP_AD_TYPE_COMPLETE_LOCAL_NAME || device.data.BLE_GAP_AD_TYPE_SHORT_LOCAL_NAME || "")
            : ""),
        flags: device.processed ? device.processed.flags : [],
        services: device.processed && device.processed.services ? device.processed.services : [],
        address: device.peer_addr.address,
        rssi: device.rssi,
        rssi_level: mapRange(device.rssi, MIN_RSSI, MAX_RSSI, 4, 20)
    };
}

var DiscoveredDevice = React.createClass({
    _onConnect: function() {
        connectionActions.connectToDevice(this.props.device);
    },

    mixins: [Reflux.connect(discoveryStore)],
    render: function() {
        if(!this.props.device) {
            return (<div>
                    <h3 style={{textAlign: 'center'}}>Local dongle</h3>
                    </div>
                );
        }
        var device = prepareDeviceData(this.props.device);
        return (
            <div className={ this.props.standalone ? "device standalone" : "device" }>
                <div className="top-bar">
                    <span className="text-small">{device.name}</span>
                    <span style={{float: 'right'}}>{device.rssi}</span>
                    <div style={{float: 'right'}}>
                        <span style={{width: device.rssi_level + 'px'}} className="icon-signal icon-foreground"></span>
                        <span className="icon-signal icon-background"></span>
                    </div>
                </div>
                <div className="device-body text-small">
                    <div className="subtle-text">
                        <button onClick={this._onConnect} className="btn btn-primary btn-xs connect-btn">
                            Connect <i className="icon-plug"></i>
                        </button>
                        <div>
                            Last seen: {device.time.toLocaleTimeString()}<br/>
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

var ConnectedDevice = React.createClass({
    render: function() {
        var device = prepareDeviceData(this.props.device);
        return (
            <div className="device standalone">
                <div className="top-bar">
                    <i className="icon-link"></i><span className="subtle-text"> Connected</span>
                    <span className="subtle-text pull-right" style={{marginTop: '2px'}}>{device.rssi}</span>
                    <div style={{float: 'right'}}>
                        <span style={{width: device.rssi_level + 'px'}} className="icon-signal icon-foreground"></span>
                        <span className="icon-signal icon-background"></span>
                    </div>
                </div>
                <div className="device-body text-small">
                    <div>
                        <div className="role-flag pull-right">Peripheral</div>
                        <strong>{device.name}</strong>
                    </div>
                    <div>{device.address}</div>
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

var MainDevice = React.createClass({
    render: function() {
        return (
            <div className="device standalone main-device">
                <div className="main-device-table">
                    <div className="icon-wrap"><i className="icon-usb icon-rotate-270"></i></div>
                    <div className="device-body text-small">
                        <div>
                            <strong>{this.props.name}</strong>
                        </div>
                        <div>{this.props.address}</div>
                        <div className="role-flag">Central</div>
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
        this.setState({discoveredDevices: {}});
    },
    _numDevicesFoundText: function() {
        var n = Object.keys(this.state.discoveredDevices).length 
        return n == 1 ? "1 device found." : n + " devices found";
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
            return (
              <div id="discoveredDevicesContainer">
                <h4>Discovered devices </h4>
                <div>
                    <span>{this._numDevicesFoundText()}</span>
                    <img className="spinner" src="resources/ajax-loader.gif" height="16" width="16" style={progressStyle} />
                </div>
                <div className="buttons">
                    <DiscoveryButton/>
                    <button onClick={this._clearContainer} type="button" className="btn btn-default btn-sm">Clear</button> 
                </div>
                <div style={{paddingTop: '0px'}}>
                  {Object.keys(devices).map(function(device, index) {
                    return (
                            <DiscoveredDevice key= {index}
                                device={devices[device]}
                                standalone={false}
                            />)
                  })}
                </div>
              </div>)
      } else {
          console.log("No data!!!!!!!!!!!!!!!!!!!!!!!!!!");
          return <div id="discoveredDevicesContainer"></div>;
      }
    }
});

module.exports = {
    DiscoveredDevicesContainer: DiscoveredDevicesContainer,
    DiscoveredDevice: DiscoveredDevice,
    ConnectedDevice: ConnectedDevice,
    MainDevice: MainDevice
}
