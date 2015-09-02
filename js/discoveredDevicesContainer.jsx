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

const deviceStyles = {
    item: {
        borderBottomStyle: 'solid',
        borderBottomWidth: 'thin',
        borderBottomColor: 'lightgrey',
        paddingTop: '4px'
    },
    name: {
        fontSize: 'small'
    },
    body: {
        color: 'grey',
        fontSize: 'small'
    },
    flag: {
        borderRadius: '5px',
        fontSize: 'smaller',
        background: 'dodgerblue',
        padding: '3px',
        display: 'inline-block',
        float: 'left',
        color: 'white'
    },
    rssi: {
        float: 'right',
        width: '19px',
        height: '19px',
        marginRight: '5px',
        marginTop: '-5px',
        marginLeft: '-5px'
    }
};

var DiscoveredDevice = React.createClass({
    _onConnect: function() {
        connectionActions.connectToDevice(this.props.device);
    },

    mixins: [Reflux.connect(discoveryStore)],
    render: function() {
        if (this.state.discoveredDevices && (Object.keys(this.state.discoveredDevices).length !==0) && this.props.standalone) {
            if (this.props.standalone) {
                deviceStyles.item.borderBottomStyle = 'none';
            } else {
                this.props.device = undefined;
            }
        } else {
            deviceStyles.item.borderBottomStyle = 'solid';
        }
        if(!this.props.device) {
            return (<div>
                    <h3 style={{textAlign: 'center'}}>Local dongle</h3>
                    </div>
                );
        }

        var signalClass = 'material-icons';

        var short_local_name = "";
        var flags = [];
        var services = [];
        var complete_local_name = "";

        var time = new Date(this.props.device.time);
        var address = this.props.device.peer_addr.address;
        var rssi = this.props.device.rssi;
        var rssi_level = calculateRssiIcon(rssi, 5);
        var signalClass = 'svg-ic_signal_cellular_' + rssi_level + '_bar_24px';

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
            <ListItem  style={deviceStyles.item}>
                <div style={{display: 'inline-block', width: '100%'}}>
                    <span style={deviceStyles.name}>{short_local_name}</span>
                    <span style={deviceStyles.name}>{complete_local_name}</span>
                    <span style={{float: 'right'}}>{rssi}</span>
                    <span style={deviceStyles.rssi} className={signalClass}></span>
                </div>
                <div style={deviceStyles.body}>
                    <div style={{display: 'inline'}}>
                        <div style={{display: 'inline-block', marginTop: '5px'}}>
                            Last seen: {time.toLocaleTimeString()}<br/>
                            {address}
                        </div>
                        <RaisedButton primary={true} onClick={this._onConnect} style={{ position: 'absolute', right: '12px', height: '20px', marginTop: '10px', display: displayConnect, color: 'white'}}>Connect <i className="icon-plug"></i></RaisedButton>

                    </div>
                    <div style={{marginTop: '5px', overflow: 'hidden'}}>
                        {services.map(function(service, index) {
                            return (<div key={index} style={deviceStyles.flag}>{service}</div>)
                        })}
                    </div>

                </div>


            </ListItem>
        );
    }
});

function calculateRssiIcon(rssi, num_levels)
{
  if (rssi <= MIN_RSSI) {
      return 0;
  } else if (rssi >= MAX_RSSI) {
      return num_levels - 1;
  } else {
      var partitionSize = (MAX_RSSI - MIN_RSSI) / (num_levels - 1);
      return Math.round((rssi - MIN_RSSI) / partitionSize);
  }
}

const containerStyle = {
    body: {
    },
    heading : {
        marginTop: '10px',
        marginLeft: '10px'
    }
};

var DiscoveredDevicesContainer = React.createClass({
    mixins: [Reflux.connect(discoveryStore), Reflux.connect(connectionStore)],
    _clearContainer: function() {
        this.setState({discoveredDevices: {}});
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
              <div id="discoveredDevicesContainer" style={containerStyle.body}>
                <div style={containerStyle.heading}>Discovered devices <button onClick={this._clearContainer} style={{marginLeft: '56px'}}>Clear</button> </div>
                <div style={{display: 'flex', alignItems: 'center', borderBottomColor: 'lightgrey', borderBottomStyle: 'solid', borderBottomWidth:'thin'}}>
                    <CircularProgress style={progressStyle} mode={progressMode} size={0.5}/>
                    <span style={{marginLeft: '15px'}}>{Object.keys(this.state.discoveredDevices).length} &nbsp; devices found.</span>
                    <span style={{marginLeft: '15px'}}><DiscoveryButton/></span>

                </div>
                <List style={{paddingTop: '0px'}}>
                  {Object.keys(devices).map(function(device, index) {
                    return (
                            <DiscoveredDevice key= {index}
                                device={devices[device]}
                                standalone={false}
                            />)
                  })}
                </List>
              </div>)
      } else {
          console.log("No data!!!!!!!!!!!!!!!!!!!!!!!!!!");
          return <Paper id="discoveredDevicesContainer"></Paper>;
      }
    }
});

module.exports = {
    DiscoveredDevicesContainer: DiscoveredDevicesContainer,
    DiscoveredDevice: DiscoveredDevice
}
