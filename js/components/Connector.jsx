'use strict';

import React from 'react';

var bs = require('react-bootstrap');
var Popover = bs.Popover;
var OverlayTrigger = bs.OverlayTrigger;
import connectionActions from '../actions/connectionActions.js';

var ConnectionSetup = React.createClass({
    _disconnect: function() {
        connectionActions.disconnectFromDevice(this.props.device.peer_addr.address);
        this.props.closePopover();
    },
    render: function() {
        var connection = this.props.device.connection;
        return (
            <div>
                <form className="form-horizontal">
                    <div className="form-group">
                        <label className="col-sm-8 control-label" htmlFor="interval">Connection Interval</label>
                        <div className="col-sm-4">
                            <input disabled className="form-control" type="number" id="interval" value = {connection.conn_params.max_conn_interval}/>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="col-sm-8 control-label" htmlFor="latency">Latency</label>
                        <div className="col-sm-4">
                            <input disabled  className="form-control" type="number" id="latency" value={connection.conn_params.slave_latency}/>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="col-sm-8 control-label" htmlFor="timeout">Timeout</label>
                        <div className="col-sm-4">
                            <input disabled  className="form-control" type="number" id="timeout" value={connection.conn_params.conn_sup_timeout}/>
                        </div>
                    </div>
                </form>
                <hr/>
                <button onClick = {this._disconnect}>Disconnect</button>
            </div>
        );
    }
});

var ConnectionOverlay = React.createClass({
    closeme: function() {
        this.refs.overlayTrigger.hide();
    },
    render: function() {
        var overlayRef = this.refs.overlayTrigger;
        return (
            <div style={this.props.style}>
                <OverlayTrigger ref="overlayTrigger" trigger={['click', 'focus']}  rootClose={true} placement='left' overlay={<Popover title='Connection Setup'><ConnectionSetup device ={this.props.device} closePopover = {this.closeme}/></Popover>}> 
                    <span style={{fontSize: '15px'}}>
                        <i className="icon-link icon-encircled"></i>
                    </span>
                </OverlayTrigger>
            </div>
            );
    }
});

var Connector = React.createClass({
    _calculateConnectorBox: function(sourceRect, targetRect) {
        var strokeWidth = 3;
        this.sourceRectMid = sourceRect.top - targetRect.top + sourceRect.height/2;
        this.targetRectMid = (targetRect.height/2);

        var top = -(strokeWidth + 1)/2 + (this.sourceRectMid < this.targetRectMid ? this.sourceRectMid : this.targetRectMid);
        var height = 2*((strokeWidth + 1)/2) + Math.abs(this.sourceRectMid - this.targetRectMid);
        var width = targetRect.left - (sourceRect.left + sourceRect.width);
        return {
            top: top,
            left: -width,
            width: width,
            height: height
        };
    },
    render: function() {
        var sourceElement = document.getElementById(this.props.sourceId);
        var targetElement = document.getElementById(this.props.targetId);

        if(!sourceElement || !targetElement) {
            return (<div/>);
        }
        var sourceRect = sourceElement.getBoundingClientRect();
        var targetRect = targetElement.getBoundingClientRect();

        var connectorBox = this._calculateConnectorBox(sourceRect, targetRect);

        var sourceYCoordinate = this.sourceRectMid < this.targetRectMid ? 2 : connectorBox.height - 2;
        var targetYCoordinate = this.sourceRectMid < this.targetRectMid ? connectorBox.height - 2 : 2;

        return (<div>
                    <svg style={{position: 'absolute', left: connectorBox.left, top: connectorBox.top, width: connectorBox.width, height: connectorBox.height}}>
                        <line x1="0" y1={sourceYCoordinate} x2={connectorBox.width/2} y2={sourceYCoordinate} stroke="black" strokeWidth="3" strokeLinecap="square"/>
                        <line x1={connectorBox.width/2} y1={sourceYCoordinate} x2={connectorBox.width/2} y2={targetYCoordinate} stroke="black" strokeWidth="3" strokeLinecap="square"/>
                        <line x1={connectorBox.width/2} y1={targetYCoordinate}s x2={connectorBox.width} y2={targetYCoordinate} stroke="black" strokeWidth="3" strokeLinecap="square"/>
                    </svg>
                    <ConnectionOverlay style={{position: 'absolute', left: '-27px', top: targetRect.height/2 - 12}} device={this.props.device}/>
                </div>);
    }
});

module.exports = Connector;
