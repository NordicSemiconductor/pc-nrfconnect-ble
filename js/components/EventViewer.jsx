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

import React from 'react';
import Reflux from 'reflux';
import {Modal} from 'react-bootstrap';
import connectionStore from '../stores/connectionStore.js';
import {eventTypes, connectionActions} from '../actions/connectionActions.js';
import { BlueWhiteBlinkMixin } from '../utils/Effects.jsx';

const BleEvent = React.createClass({
    mixins: [BlueWhiteBlinkMixin],
    _getEventNameFromEvent: function(event) {
        switch (event.eventType) {
            case eventTypes.userInitiatedConnectionUpdate:
                return 'User initiated connection update';
                break;
            default: 
                return 'unknown event';
        }
    },
    _onClick: function(e) {
        e.stopPropagation();
        if (this.props.onSelected) {
            this.props.onSelected(this.props.event);
        }
    },
    render: function() {
        const eventName = this._getEventNameFromEvent(this.props.event);
        let backgroundColor = this.props.selected
            ? 'rgb(179,225,245)'
            : `rgb(${this.state.backgroundColor.r}, ${this.state.backgroundColor.g}, ${this.state.backgroundColor.b})`;
        return (
            <div className="service-item" style={{backgroundColor: backgroundColor}} onClick={this._onClick}>
                <div className="expand-area" onClick={this._onExpandAreaClick}>
                    <div className="bar1" />
                    <div className="icon-wrap"></div>
                </div>
                <div className="content-wrap">
                    <div className="content">
                        <div className="service-name truncate-text" title={'ddddd'}>{eventName}</div>
                    </div>
                </div>
            </div>
        );
    }
});

const ConnectionUpdateRequestEditor = React.createClass({
     getInitialState: function(){
        let initialConnectionParameters = Object.assign({}, this.props.connectionUpdateRequest.payload.conn_params);
        return {
            connectionParameters: initialConnectionParameters,
        };
    },
    _generateHeaderMessage: function() {
        if (this.props.connectionUpdateRequest.eventType === eventTypes.userInitiatedConnectionUpdate) {
            return 'Connection Parameters for device at ' + this.props.connectionUpdateRequest.deviceAddress;
        } else {
            return 'The device at ' + this.props.connectionUpdateRequest.deviceAddress + ' has requested a connection parameter update.'
        }
    },
     _createConnectionIntervalControl: function(connectionUpdateRequest, connectionHandle) {
        if (connectionUpdateRequest.min_conn_interval === connectionUpdateRequest.max_conn_interval) {
            return (
                <div className="col-sm-6">
                    <input id={"interval_" + connectionHandle} 
                           className="form-control nordic-form-control" 
                           type="number" 
                           readOnly 
                           value={this.state.connectionParameters.max_conn_interval}/>
                </div>
            );
        } else {
            return (
                <div className="col-sm-6">
                    <input id={"interval_" + connectionHandle} 
                           type="range" 
                           min={this.state.connectionParameters.min_conn_interval} 
                           max={this.state.connectionParameters.max_conn_interval} 
                           value={this.state.connectionParameters.min_conn_interval}/>); 
                </div>
            );
        }
    },
    _handleChange: function(connectionHandle, inputIdentifier, event) {
        const connectionParameters = Object.assign({}, this.state.connectionParameters);

        connectionParameters[inputIdentifier] = parseInt(event.target.value, 10);
        this.setState({
            connectionParameters: connectionParameters
        });
    },
    _updateConnection: function(connectionHandle) {
        connectionActions.connectionParametersUpdate(connectionHandle, this.state.connectionParameters, this.props.connectionUpdateRequest.id);
    },
    render: function() {
        var connectionHandle = this.props.connectionUpdateRequest.payload.conn_handle;
        var conn_params = this.props.connectionUpdateRequest.payload.conn_params;
        return (
            <div>
                <div className="event-header">
                    <p>{this._generateHeaderMessage()}</p>
                </div>
                 <form className="form-horizontal">
                    <div className="form-group ">
                        <div>
                            <label className="control-label col-sm-6" htmlFor={"interval_"+connectionHandle}>Connection Interval (ms)</label>
                            {this._createConnectionIntervalControl(this.props.connectionUpdateRequest, connectionHandle)}
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="control-label col-sm-6" htmlFor={"latency_" + connectionHandle}>Latency (ms)</label>
                        <div className="col-sm-6">
                            <input id={"latency_" + connectionHandle} className="form-control nordic-form-control" 
                                   onChange={this._handleChange.bind(this, connectionHandle, 'slave_latency')} type="number" 
                                   value={this.state.connectionParameters.slave_latency}/>
                        </div>
                    </div>
                    <div className="form-group">
                        <div>
                            <label className="control-label col-sm-6" htmlFor={"timeout_" + connectionHandle}>Timeout (ms)</label>
                            <div className="col-sm-6">
                                <input id={"timeout_" + connectionHandle} className="form-control nordic-form-control" 
                                       onChange={this.handleChange} type="number" value={this.state.connectionParameters.conn_sup_timeout}/>
                            </div>
                        </div>
                        <div>
                            <button type="button" onClick={this._updateConnection.bind(this, connectionHandle, this.props.connectionUpdateRequest)} className="btn btn-primary btn-xs btn-nordic">
                                Update
                            </button>
                        </div>
                    </div>
                </form>
            
            </div>
        );
    }
});

const EventViewer = React.createClass({
    mixins: [Reflux.listenTo(connectionStore, "onConnectionStoreChanged")],

    getInitialState: function(){
        return Object.assign({}, connectionStore.getInitialState(), {visible: false, selected: null});
    },

    onConnectionStoreChanged: function (newState) {
        if (!this.state.visible) {
            if (newState.eventsToShowUser && (newState.eventsToShowUser.length > 0) ) {
                this.setState(Object.assign({}, newState, {visible: true}));
            } else {
                this.setState(newState);
            }
        }
    },
    _close: function() {
        this.setState({visible: false});
    },
    _onSelected: function(selected) {
        this.setState({selected: selected});
    },
    render: function() {
        const selected = this.state.selected;
        const editor = 
            ! selected ? <div className="nothing-selected"/>
            : selected.eventType === eventTypes.userInitiatedConnectionUpdate ? <ConnectionUpdateRequestEditor connectionUpdateRequest={selected}/>
            : <ConnectionUpdateRequestEditor connectionUpdateRequest={selected}/>
        return (
            <Modal className="events-modal" show={this.state.visible}>
                <Modal.Header>
                    <Modal.Title>Events</Modal.Title>
                </Modal.Header>
                <div className="server-setup" style={this.props.style}>
                    <div className="device-details-view">
                        <div className="service-items-wrap">
                            {this.state.eventsToShowUser.map((event, i) =>
                                <BleEvent onSelected={this._onSelected} selected={this.state.selected===event} event={this.state.eventsToShowUser[i]}/> 
                            )}
                        </div>
                        <div className="item-editor">
                            {editor}
                        </div>
                    </div>
                </div>
                <Modal.Footer>
                    <button className="btn btn-primary btn-nordic" onClick={this._close}>Close</button>
                </Modal.Footer>
            </Modal>
        );
    }
});

module.exports = EventViewer;