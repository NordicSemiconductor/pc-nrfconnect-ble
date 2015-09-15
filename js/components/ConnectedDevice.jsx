'use strict';
import React from 'react';
import Connector from './Connector.jsx';

import prepareDeviceData from '../common/deviceProcessing.js';

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
            opacity: this.props.node.connectionLost ? 0.5 : 1.0
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
                <Connector sourceId={this.props.sourceId} targetId={this.props.id} parentId={this.props.parentId} device={this.props.device}/>
            </div>
        );
    },
    componentDidMount: function() {
        this.setState({connectorCanBeDrawn: true});
    }
});
module.exports = ConnectedDevice;