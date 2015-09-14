'use strict';
import React from 'react';
import Connector from './Connector.jsx';

var MIN_RSSI = -100;
var MAX_RSSI = -45;

function mapRange(n, fromMin, fromMax, toMin, toMax) {
    //scale number n from the range [fromMin, fromMax] to [toMin, toMax]
    n = toMin + ((toMax - toMin) / (fromMax - fromMin)) * (n - fromMin)
    n = Math.round(n);
    return Math.max(toMin, Math.min(toMax, n));
}

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

var ConnectedDevice = React.createClass({
    getInitialState: function() {
        return {
            connectorCanBeDrawn: false
        };
    },
    render: function() {
        var device = prepareDeviceData(this.props.device);
        var role = this.props.node.id === "central" ? "Central" : "Peripheral";
        var connected = !this.props.node.connectionLost;
        var style={
            width: '250px',
        };
        return (
            <div ref="outerDiv" id={this.props.id} className="device standalone" style={style}>
                <div className="top-bar">
                {
                 //   <i className={connected ? "icon-link" : "icon-link-broken" }></i>
                 //   <span className="subtle-text">{connected ? 'Connected' : 'Disconnected'}</span>
                 //   <span className="subtle-text pull-right" style={{marginTop: '2px'}}>{device.rssi}</span>
                 //
                 //    <div style={{float: 'right'}}>
                 //       <span style={{width: device.rssi_level + 'px'}} className="icon-signal icon-foreground"></span>
                 //       <span className="icon-signal icon-background"></span>
                 //   </div>
                }
                </div>
                <div className="device-body text-small" >
                    <div>
                        <div className="role-flag pull-right">{role}</div>
                        <strong>{device.name}</strong>
                    </div>
                    <div>{device.address}</div>
                    <div className="flag-line">
                        {device.services.map(function(service, index) {
                            return (<div key={index} className="device-flag">{service}</div>)
                        })}
                    </div>
                </div>
                {this.state.connectorCanBeDrawn ? <Connector sourceId={this.props.sourceId} targetId={this.props.id} parentId={this.props.parentId} device={this.props.device}/> : <div/>}
            </div>
        );
    },
    componentDidMount: function() {
        this.setState({connectorCanBeDrawn: true});
    }
});
module.exports = ConnectedDevice;