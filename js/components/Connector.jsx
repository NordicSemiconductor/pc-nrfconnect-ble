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

import {Popover, OverlayTrigger, Overlay} from 'react-bootstrap';
import connectionActions from '../actions/connectionActions.js';
import layoutStrategies from '../common/layoutStrategies.js';
import connectionStore from '../stores/connectionStore.js';

var ConnectionSetup = React.createClass({
    mixins: [Reflux.connect(connectionStore)],
    getInitialState: function() {
        // Get initial state from properties. Antipattern, but necessary here to initialize connection parameters
        return {
            connectionInfo : this.props.device.connection.conn_params,
            connectionIntervalOutOfRange: false,
            slaveLatencyOutOfRange: false,
            timeOutOutOfRange: false,
            timeOutRuleViolated: false
        };
    },
    _validateInput: function() {
        //if (this.state.connectionInfo.max_conn_interval)
    },
    _isInputValid: function() {
        return ! (this.state.connectionIntervalOutOfRange || 
                  this.state.slaveLatencyOutOfRange ||
                  this.state.timeOutOutOfRange ||
                  this.state.timeOutRuleViolated);
    },
    _disconnect: function() {
        connectionActions.disconnectFromDevice(this.props.device.peer_addr.address);
        this.props.closePopover();
    },
    _handleChange: function(inputIdentifier, event) {
        this._validateConnectionParameters();

        var newConnectionInfo = Object.assign({}, this.state.connectionInfo);
        newConnectionInfo[inputIdentifier] = parseInt(event.target.value, 10);
        this.setState({
            connectionInfo: newConnectionInfo
        });
    },
    _isConnectionIntervalOutOfRange: function() {
        return this.state.connectionInfo.min_conn_interval < 7.5 ||
            this.state.connectionInfo.max_conn_interval > 4000 ||
            this.state.connectionInfo.min_conn_interval > this.state.connectionInfo.max_conn_interval;
    },
    _validateConnectionParameters: function() {
        this.setState({
            connectionIntervalOutOfRange: this._isConnectionIntervalOutOfRange(),
            slaveLatencyOutOfRange: this.state.connectionInfo.slave_latency < 0 || this.state.connectionInfo.slave_latency > 499,
            timeOutOutOfRange: this.state.connectionInfo.conn_sup_timeout < 100 || this.state.connectionInfo.conn_sup_timeout > 32000,
            timeOutRuleViolated: false
        });
    },
    _updateConnection: function() {
        connectionActions.connectionParametersUpdate(this.props.device.connection.conn_handle, this.state.connectionInfo);
    },
    render: function() {
        var connection = this.props.device.connection;
        var isBeingUpdated = (this.state.connectionBeingUpdated === this.props.device.connection.conn_handle);
        var buttonOrSpinner = isBeingUpdated ? 
            (<img className="spinner" src="resources/ajax-loader.gif" height="24" width="24" />) :
            (<button className="btn btn-sm btn-nordic btn-primary" onClick = {this._updateConnection}>Update</button>);

        if (this.state.slaveLatencyOutOfRange) {
            var latencyAlert = (<Overlay show={true} placement="right" container ={this} target={() =>React.findDOMNode(this.refs.slaveLatencyInput)}><div> Slave latency out of bounds</div></Overlay>);
        } 
        return (
            <div>
                <form className="form-horizontal">
                    <div className="form-group">
                        <label className="col-sm-8 control-label" htmlFor="interval">Connection Interval</label>
                        <div className="col-sm-4">
                            <input className="form-control nordic-form-control" type="number" step="1.25"
                                   id="interval" onChange={this._handleChange.bind(this, 'max_conn_interval')} 
                                   value={this.state.connectionInfo.max_conn_interval}/>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="col-sm-8 control-label" htmlFor="latency">Latency</label>
                        <div className="col-sm-4">
                            <input ref="slaveLatencyInput" className="form-control nordic-form-control" type="number" 
                                   value={this.state.connectionInfo.slave_latency} step="0.5"
                                   id="latency" onChange={this._handleChange.bind(this, 'slave_latency')}/>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="col-sm-8 control-label" htmlFor="timeout">Timeout</label>
                        <div className="col-sm-4">
                            <input className="form-control nordic-form-control" type="number" step="10"
                                   value={this.state.connectionInfo.conn_sup_timeout}
                                   id="timeout" onChange={this._handleChange.bind(this, 'conn_sup_timeout')}/>
                            {latencyAlert}
                        </div>
                    </div>
                </form>
                <hr/>
                {buttonOrSpinner}
                <button disabled={isBeingUpdated} className="btn btn-sm btn-nordic btn-danger pull-right" onClick = {this._disconnect}>Disconnect</button>

            </div>
        );
    }
});

var ConnectionOverlay = React.createClass({
    _closeme: function() {
        this.refs.overlayTrigger.hide();
    },
    render: function() {
        var overlayRef = this.refs.overlayTrigger;
        return (
            <div className="connection-info-button" style={this.props.style}>
                <OverlayTrigger ref="overlayTrigger" trigger={['click', 'focus']} rootClose={true} placement='left' overlay={<Popover title='Connection Setup'><ConnectionSetup device ={this.props.device} closePopover = {this._closeme}/></Popover>}>
                    <span style={{fontSize: '15px'}}>
                        <i className="icon-link icon-encircled"></i>
                    </span>
                </OverlayTrigger>
            </div>
            );
    }
});

var Connector = React.createClass({
    _generateLines: function(lineCoordinates) {
        var result = [];
        for(var i=0; i<lineCoordinates.length-1; i++) {
            result.push(<line stroke="black" strokeWidth="3" strokeLinecap="square" key={i}
                         x1={lineCoordinates[i].x} y1={lineCoordinates[i].y} x2={lineCoordinates[i+1].x} y2={lineCoordinates[i+1].y}/>);
        }
        return result;
    },
    _getConnectionOverlay: function(lineCoordinates) {
        if (lineCoordinates.length < 2) {
            return;
        }

        var pointA = lineCoordinates[lineCoordinates.length - 2];
        var pointB = lineCoordinates[lineCoordinates.length - 1];

        var posX = (pointA.x - pointB.x) / 2;
        var posY = (pointA.y - pointB.y) / 2;

        var targetElement = document.getElementById(this.props.targetId);
        var targetRect = targetElement.getBoundingClientRect();

        if (posX == 0) {
            posX = targetRect.width / 2;
        }

        if (posY == 0) {
            posY = targetRect.height / 2;
        }

        return (<ConnectionOverlay style={{position: 'absolute', left: posX - 12, top: posY - 12}} device={this.props.device}/>);
    },
    render: function() {
        var sourceElement = document.getElementById(this.props.sourceId);
        var targetElement = document.getElementById(this.props.targetId);

        if(!sourceElement || !targetElement) {
            return (<div/>);
        }
        var sourceRect = sourceElement.getBoundingClientRect();
        var targetRect = targetElement.getBoundingClientRect();

        var layoutInfo = layoutStrategies[this.props.layout](sourceRect, targetRect, 3);
        var connectorBox = layoutInfo.boundingBox;
        var lines = this._generateLines(layoutInfo.lineCoordinates);
        var connectionInfoOverlay = this._getConnectionOverlay(layoutInfo.lineCoordinates);

        return (<div className="connector">
                    <svg style={{position: 'absolute', left: connectorBox.left, top: connectorBox.top, width: connectorBox.width, height: connectorBox.height}}>
                        {lines}
                    </svg>
                    {connectionInfoOverlay}
                </div>);
    }
});

module.exports = Connector;
