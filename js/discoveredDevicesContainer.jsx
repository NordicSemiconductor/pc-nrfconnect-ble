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

var DiscoveredDevice = React.createClass({
    _onConnect: function() {
        connectionActions.connectToDevice(this.props.device);
    },

    mixins: [Reflux.connect(discoveryStore)],
    render: function() {
        var itemStyle = {}
        if (this.state.discoveredDevices && (Object.keys(this.state.discoveredDevices).length !==0) && this.props.standalone) {
            itemStyle.border = "none";
        }
        if(!this.props.device) {
            return (<div>
                    <h3 style={{textAlign: 'center'}}>Local dongle</h3>
                    </div>
                );
        }

        var short_local_name = "";
        var flags = [];
        var services = [];
        var complete_local_name = "";

        var time = new Date(this.props.device.time);
        var address = this.props.device.peer_addr.address;
        var rssi = this.props.device.rssi;
        var rssi_level = mapRange(rssi, MIN_RSSI, MAX_RSSI, 4, 20);

        if('data' in this.props.device)
        {
            if('BLE_GAP_AD_TYPE_SHORT_LOCAL_NAME' in this.props.device.data)
                short_local_name = this.props.device.data.BLE_GAP_AD_TYPE_SHORT_LOCAL_NAME;

            if('BLE_GAP_AD_TYPE_COMPLETE_LOCAL_NAME' in this.props.device.data)
                complete_local_name = this.props.device.data.BLE_GAP_AD_TYPE_COMPLETE_LOCAL_NAME;

            if('flags' in this.props.device.processed)
                flags = this.props.device.processed.flags;

            if('services' in this.props.device.processed)
                services = this.props.device.processed.services;
        }
        var displayConnect =  this.props.standalone ? 'none!important' : 'inline-block';
        return (
            <div className="discovered-device" style={itemStyle}>
                <div style={{display: 'inline-block', width: '100%'}}>
                    <span className="text-small">{short_local_name}</span>
                    <span className="text-small">{complete_local_name}</span>
                    <span style={{float: 'right'}}>{rssi}</span>
                    <div style={{float: 'right'}}>
                        <span style={{width: rssi_level + 'px'}} className="icon-signal icon-foreground"></span>
                        <span className="icon-signal icon-background"></span>
                    </div>
                </div>
                <div className="device-body text-small">
                    <div>
                        <button onClick={this._onConnect} className="btn btn-primary btn-xs connect-btn" style={{ display: displayConnect }}>
                            Connect <i className="icon-plug"></i>
                        </button>
                        <div>
                            Last seen: {time.toLocaleTimeString()}<br/>
                            {address}
                        </div>
                    </div>
                    <div className="flag-line">
                        {services.map(function(service, index) {
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
    DiscoveredDevice: DiscoveredDevice
}
