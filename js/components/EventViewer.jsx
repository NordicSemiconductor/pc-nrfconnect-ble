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

const CountdownTimer = React.createClass({
    getInitialState: function() {
        return {
            secondsRemaining: 0
        };
    },
    _tick: function() {
        this.setState({secondsRemaining: this.state.secondsRemaining - 1});
        if (this.state.secondsRemaining <= 0) {
            clearInterval(this.intervalId);
            if (this.props.timeoutCallback) {
                this.props.timeoutCallback();
            }
        }
    },
    cancelTimer: function() {
        clearInterval(this.intervalId);
    },
    componentDidMount: function() {
        this.setState({secondsRemaining: this.props.secondsRemaining});
        this.intervalId = setInterval(this._tick, 1000);
    },
    componentWillUnmount: function() {
        clearInterval(this.interval);
    },
    render: function() {
        const content = this.state.secondsRemaining ? this.state.secondsRemaining : '';
        return (
            <div className="countdown-timer"> {content} </div>
        );
    }
});

const BleEvent = React.createClass({
    mixins: [BlueWhiteBlinkMixin],
    _getEventName: function () {
        switch (this.props.event.eventType) {
            case eventTypes.userInitiatedConnectionUpdate:
                return 'Update request';
                break;
            case eventTypes.peripheralInitiadedConnectionUpdate:
                return 'Update request';
            default: 
                return 'unknown event';
        }
    },
    _getEventIcons: function() {
        switch (this.props.event.eventType) {
            case eventTypes.userInitiatedConnectionUpdate:
                return (<span className="icon-link"><span className="icon-down"/></span>);
            case eventTypes.peripheralInitiadedConnectionUpdate:
                return (<span className="icon-link"><span className="icon-up"/></span>);
            default: 
                return 'unknown event';
        }
    },
    _timedOut: function() {
        connectionActions.eventTimedOut(this.props.event);
    },
    _getEventContent: function() {
        const eventName = this._getEventName();
        let eventTimer =(<div/>);
        if ((this.props.event.eventType === eventTypes.peripheralInitiadedConnectionUpdate)) {
            eventTimer = (<CountdownTimer ref="counter" secondsRemaining={5} timeoutCallback={this._timedOut}/>)
        }
        return (
            <div className="content">
                <span>{this._getEventIcons()}</span>
                <span className="left-space">
                    <div className="service-name truncate-text">{eventName}</div>
                    <div className="address-text">{this.props.event.deviceAddress}</div>
                </span>
                {eventTimer}
            </div>
        );
    },
    _onClick: function(e) {
        e.stopPropagation();
        if (this.props.onSelected) {
            this.props.onSelected(this.props.index);
        }
    },
    _getClass: function() {
        if (!this.props.event.state) {
            return '';
        }

        switch (this.props.event.state) {
            case 'error':
            case 'timedOut':
                return 'failed-item';
            case 'indeterminate':
                return '';
            case 'success':
                return 'success-item';
            default:
                throw 'error: unknown ble event state';
        }
    },
    _getStyle: function() {
        if (!this.props.event.state) {
            return {
                backgroundColor: this.props.selected
                    ? 'rgb(179,225,245)'
                    : `rgb(${this.state.backgroundColor.r}, ${this.state.backgroundColor.g}, ${this.state.backgroundColor.b})`
            };    
        } else {
            return {};
        }
    },
    stopCounter: function() {
        // Used to let EventViewer tell Event to stop it's counter
        this.refs.counter.cancelTimer();
    },
    render: function() {
        return (
            <div className={'service-item ' + this._getClass()} style={this._getStyle()} onClick={this._onClick}>
                <div className="expand-area" onClick={this._onExpandAreaClick}>
                    <div className="bar1" />
                    <div className="icon-wrap"></div>
                </div>
                <div className="content-wrap">
                    {this._getEventContent()}
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
    componentWillReceiveProps: function(newProps) {
        if (newProps.connectionUpdateRequest) {
            this.setState({
                connectionParameters: newProps.connectionUpdateRequest.payload.conn_params
            });
        }
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
                           onChange={this._handleConnectionIntervalChange}
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
                           onChange={this._handleConnectionIntervalChange}
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
    _handleConnectionIntervalChange: function() {
        const connectionParameters = Object.assign({}, this.state.connectionParameters);

        connectionParameters.min_conn_interval = parseInt(event.target.value, 10);
        connectionParameters.max_conn_interval = connectionParameters.min_conn_interval;
        this.setState({
            connectionParameters: connectionParameters
        });
    },
    _updateConnection: function(connectionHandle) {
        connectionActions.connectionParametersUpdate(connectionHandle, this.state.connectionParameters, this.props.connectionUpdateRequest.id);
        this.props.onUpdate();
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
                                       onChange={this._handleChange.bind(this, connectionHandle, 'conn_sup_timeout')} type="number" value={this.state.connectionParameters.conn_sup_timeout}/>
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
        return Object.assign({}, connectionStore.getInitialState(), {visible: false, selectedIndex: null});
    },

    onConnectionStoreChanged: function (newState) {
        if (!this.state.visible) {
            if (newState.eventsToShowUser && (newState.eventsToShowUser.length > 0) ) {
                this.setState(
                    Object.assign({}, 
                        newState, 
                        {
                            visible: true, 
                            selectedIndex: this.state.eventsToShowUser.length -1
                        }
                    )
                );

            } else {
                this.setState(newState);
            }
        } else {
            this.setState(newState);
        }
    },
    _close: function() {
        connectionActions.clearAllUserEvents();
        this.setState({visible: false});
    },
    _onSelected: function(selected) {
        this.setState({selectedIndex: selected});
    },
    _getEditor: function() {
        if ( (this.state.selectedIndex === null) || 
             (this.state.eventsToShowUser.length === 0) ||
             (this.state.eventsToShowUser[this.state.selectedIndex].state==='timedOut')) {
            return <div className="nothing-selected"/>;
        }
        const eventType = this.state.eventsToShowUser[this.state.selectedIndex].eventType;
        switch (eventType) {
            case eventTypes.userInitiatedConnectionUpdate:
            // fall-through here!:
            case eventTypes.peripheralInitiadedConnectionUpdate:
                return <ConnectionUpdateRequestEditor connectionUpdateRequest={this.state.eventsToShowUser[this.state.selectedIndex]} onUpdate={this._handleEditorUpdate}/>;
            default:
                throw "Unknown eventType in EventViewer: " + eventType;
        }
    },
    _areAllEventsHandledOrTimedOut: function() {
        for(let i = 0; i < this.state.eventsToShowUser.length; i++) {
            if (!this.state.eventsToShowUser[i].state) {
                return false;
            }
        }
        return true;
    },
    _handleEditorUpdate: function() {
        this.refs['event_' + this.state.selectedIndex].stopCounter();
        this.setState({
            selectedIndex: null
        });
    },
    render: function() {
        
        return (
            <Modal className="events-modal" show={this.state.visible} backdrop="static" onHide={this._close} >
                <Modal.Header>
                    <Modal.Title>Events</Modal.Title>
                </Modal.Header>
                <div className="server-setup" style={this.props.style}>
                    <div className="device-details-view">
                        <div className="service-items-wrap">
                            {this.state.eventsToShowUser.map((event, i) =>
                                <BleEvent key={i} ref={'event_' + i} onSelected={this._onSelected} selected={this.state.selectedIndex===i} event={this.state.eventsToShowUser[i]} index={i}/> 
                            )}
                        </div>
                        <div className="item-editor">
                            {this._getEditor()}
                        </div>
                    </div>
                </div>
                <Modal.Footer>
                    <button disabled={!this._areAllEventsHandledOrTimedOut()} className="btn btn-primary btn-nordic" onClick={this._close}>Close</button>
                </Modal.Footer>
            </Modal>
        );
    }
});

module.exports = EventViewer;