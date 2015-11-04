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

import logger from './logging';

import discoveryStore from './stores/discoveryStore';
import discoveryActions from './actions/discoveryActions';
import {connectionActions} from './actions/connectionActions';
import DiscoveryButton from './discoveryButton';

var DiscoveredDevice = React.createClass({
    mixins: [Reflux.connect(discoveryStore)],

    _onConnect: function() {
        connectionActions.connectToDevice(this.props.device);
        this.state.connectingDeviceAddress = this.props.device.peer_addr.address;
        this.state.isConnecting = true;
    },
    _onCancelConnect: function() {
        connectionActions.cancelConnect(this.props.device);
    },
    render: function() {
        if(!this.props.device) {
            return (<div>
                    <h3 style={{textAlign: 'center'}}>Local dongle</h3>
                    </div>
                );
        }

        var connectingDeviceAddress = this.state.connectingDeviceAddress;
        var isThisDevice = false;

        if(connectingDeviceAddress !== undefined
            && connectingDeviceAddress === device.address) {
            isThisDevice = true;
        }

        return (
            <div className="device">
                <div className="top-bar">
                    <div style={{float: 'right'}}>
                        <span style={{width: this.props.device.rssi_level + 'px'}} className="icon-signal icon-foreground" />
                        <span className="icon-signal icon-background" />
                    </div>
                    <div className="text-small truncate-text">{this.props.device.name || '<Unkown name>'}</div>
                </div>
                <div className="device-body text-small">
                    <div className="discovered-device-address-line">
                        <button onClick={isThisDevice && this.state.isConnecting ? this._onCancelConnect : this._onConnect} className="btn btn-primary btn-xs btn-nordic" disabled={!isThisDevice && this.state.isConnecting}>
                            {isThisDevice && this.state.isConnecting ? 'Cancel' : 'Connect'} <i className="icon-link"></i>
                        </button>
                        <div className="address-text">
                            {this.props.device.address}
                        </div>
                    </div>
                    <div className="flag-line">
                        {this.props.device.services.map(function(service, index) {
                            return (<div key={index} className="device-flag">{service}</div>)
                        })}
                    </div>

                </div>
            </div>
        );
    }
});

var DiscoveredDevicesContainer = React.createClass({
    mixins: [Reflux.connect(discoveryStore)],
    _clearContainer: function() {
        discoveryActions.clearItems();
    },
    render: function() {
        if (this.state.discoveredDevices) {

            var progressMode = this.state.scanInProgress ? 'indeterminate' : 'determinate';
            var progressStyle = {
                visibility: this.state.scanInProgress ? 'visible' : 'hidden',
            }

            return (
              <div id="discoveredDevicesContainer">
                <div>
                    <h4>
                        Discovered devices
                        <img className="spinner" src="resources/ajax-loader.gif" height="16" width="16" style={progressStyle} />
                    </h4>
                </div>
                <div className="padded-row">
                    <DiscoveryButton scanInProgress={this.state.scanInProgress} isConnecting={this.state.isConnecting} isAdapterOpen={this.state.isAdapterOpen}/>
                    <button title="Clear list (Alt+C)" onClick={this._clearContainer} type="button" className="btn btn-primary btn-sm btn-nordic padded-row">
                        <span className="icon-trash" />Clear
                    </button>
                </div>
                <div style={{paddingTop: '0px'}}>
                  {Object.keys(this.state.discoveredDevices).map(function(device, index) {
                    return (
                            <DiscoveredDevice key={ 'dev-' + device + '-' + index}
                                device={this.state.discoveredDevices[device]}
                                standalone={false}
                                isConnecting={this.state.isConnecting}
                            />)
                  }.bind(this))}
                </div>
              </div>)
      } else {
          logger.silly("No data!");
          return <div id="discoveredDevicesContainer"></div>;
      }
    }
});

module.exports = {
    DiscoveredDevicesContainer: DiscoveredDevicesContainer,
    DiscoveredDevice: DiscoveredDevice
}
