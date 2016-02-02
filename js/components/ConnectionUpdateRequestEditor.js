'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';

import { Input, Button } from 'react-bootstrap';

import { BLEEventType } from '../actions/common';

const CONN_INTERVAL_MIN = 7.5;
const CONN_INTERVAL_MAX = 4000;
const CONN_INTERVAL_STEP = 1.25;
const CONN_TIMEOUT_MIN = 100;
const CONN_TIMEOUT_MAX = 32000;
const CONN_TIMEOUT_STEP = 10;
const CONN_LATENCY_MIN = 0;
const CONN_LATENCY_MAX = 499;
const CONN_LATENCY_STEP = 1;

// This component views an editor for connection update parameters
// One concept is essential:
//  If the user sets an connectionInterval we force that value to the SoftDevice
//  by setting both maxConnectionInterval and minConnection interval to that value.
export class ConnectionUpdateRequestEditor extends Component {
    constructor(props) {
        super(props);

        const { event } = props;
        const { device } = event;

        const requestedConnectionParams = event.requestedConnectionParams;

        if (event.type === BLEEventType.USER_INITIATED_CONNECTION_UPDATE) {
            // When user initiated update, set the conn int to the current conn int of the connection
            this.connectionInterval = device.minConnectionInterval;
            this.connectionSupervisionTimeout = device.connectionSupervisionTimeout;
            this.slaveLatency = device.slaveLatency;
        } else {
            // Use minConnection interval as start value for selected connection interval
            this.connectionInterval = requestedConnectionParams.minConnectionInterval;
            this.connectionSupervisionTimeout = requestedConnectionParams.connectionSupervisionTimeout;
            this.slaveLatency = requestedConnectionParams.slaveLatency;
        }

        this.maxConnectionInterval = requestedConnectionParams.maxConnectionInterval;
        this.minConnectionInterval = requestedConnectionParams.minConnectionInterval;

        this._setAndValidateSlaveLatency(this.slaveLatency);
        this._setAndValidateConnectionSupervisionTimeout(this.connectionSupervisionTimeout);
    }

    _generateHeaderMessage() {
        const { event } = this.props;
        const address = event.device.address;

        if (event.type === BLEEventType.USER_INITIATED_CONNECTION_UPDATE) {
            return `Connection parameters update for device ${address}`;
        } else {
            return `Connection parameters update request from device ${address}`;
        }
    }

    _createConnectionIntervalControl() {
        const {
            event,
        } = this.props;

        const device = event.device;
        const address = device.address;

        const range = event.type === BLEEventType.USER_INITIATED_CONNECTION_UPDATE ? undefined
            : <div>({event.requestedConnectionParams.minConnectionInterval}-{event.requestedConnectionParams.maxConnectionInterval})</div>;

        return (
            <div>
                <label className='control-label col-sm-7'
                       htmlFor={'interval_' + address}>Connection Interval (ms) {range}</label>
                <div className='col-sm-5'>
                    <Input id={'interval_' + address}
                        type='number'
                        className='form-control nordic-form-control'
                        onChange={_event => this._handleConnectionIntervalChange(_event) }
                        min={CONN_INTERVAL_MIN}
                        max={CONN_INTERVAL_MAX}
                        step={CONN_INTERVAL_STEP}
                        defaultValue={this.connectionInterval} />
                </div>
            </div>
        );
    }

    _isSlaveLatencyValid(slaveLatency) {
        return ((slaveLatency >= CONN_LATENCY_MIN) && (slaveLatency <= CONN_LATENCY_MAX));
    }

    _isConnectionSupervisionTimeoutValid(connectionSupervisionTimeout) {
        return ((connectionSupervisionTimeout >= CONN_TIMEOUT_MIN) && (connectionSupervisionTimeout < CONN_TIMEOUT_MAX));
    }

    _setAndValidateConnectionSupervisionTimeout(value) {
        this.connectionSupervisionTimeout = value;
        this.isConnectionSupervisionTimeoutValid = this._isConnectionSupervisionTimeoutValid(this.connectionSupervisionTimeout);
    }

    _handleConnectionSupervisionTimeoutChange(event) {
        this._setAndValidateConnectionSupervisionTimeout(parseInt(event.target.value, 10));
        this.forceUpdate();
    }

    _setAndValidateSlaveLatency(value) {
        this.slaveLatency = value;
        this.isSlaveLatencyValid = this._isSlaveLatencyValid(value);
    }

    _handleSlaveLatencyChange(event) {
        this._setAndValidateSlaveLatency(parseInt(event.target.value, 10));
        this.forceUpdate();
    }

    _handleConnectionIntervalChange(event) {
        if (event.target.value === '') {
            return;
        }

        this.connectionInterval = parseFloat(event.target.value);
    }

    _handleUpdateConnection() {
        const {
            event,
            onUpdateConnectionParams,
        } = this.props;

        // Set minConnectionInterval and maxConnectionInterval to connectionInterval
        // that way we force the connectionInterval on SoftDevice.
        this.minConnectionInterval = this.connectionInterval;
        this.maxConnectionInterval = this.connectionInterval;

        onUpdateConnectionParams(
            event.device,
            {
                minConnectionInterval: this.minConnectionInterval,
                maxConnectionInterval: this.maxConnectionInterval,
                slaveLatency: this.slaveLatency,
                connectionSupervisionTimeout: this.connectionSupervisionTimeout,
            }
        );
    }

    _handleRejectConnectionParams() {
        const {
            event,
            onRejectConnectionParams,
        } = this.props;

        onRejectConnectionParams(event.device);
    }

    _handleIgnoreConnectionParams() {
        const {
            event,
            onIgnoreEvent,
        } = this.props;

        onIgnoreEvent(event.id);
    }

    _handleCancelUserInitiatedEvent() {
        const {
            event,
            onCancelUserInitiatedEvent,
        } = this.props;

        onCancelUserInitiatedEvent(event.id);
    }

    _getValidInputStyle() {
        return {
            boxShadow: 'inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, 0.6)',
            borderColor: '#66afe9',
        };
    }

    _getInvalidInputStyle() {
        return {
            boxShadow: 'inset 0 1px 1px rgba(0,0,0,.075), 0 0 5px rgba(255, 0, 0, 1)',
            borderColor: 'rgb(200, 10, 10)',
        };
    }

    render() {
        const {
            event,
        } = this.props;

        const device = event.device;
        const address = device.address;

        const slaveLatencyStyle = this.isSlaveLatencyValid ?
            this._getValidInputStyle() : this._getInvalidInputStyle();
        const connectionSupervisionTimeoutInputStyle = this.isConnectionSupervisionTimeoutValid ?
            this._getValidInputStyle() : this._getInvalidInputStyle();

        const ignoreButton = event.type === BLEEventType.PERIPHERAL_INITIATED_CONNECTION_UPDATE ?
            <Button type='button'
                    onClick={() => this._handleIgnoreConnectionParams()}
                    className='btn btn-default btn-sm btn-nordic'>
                    Ignore
            </Button> : '';

        const rejectButton = event.type === BLEEventType.PERIPHERAL_INITIATED_CONNECTION_UPDATE ?
            <Button type='button'
                    onClick={() => this._handleRejectConnectionParams()}
                    className='btn btn-default btn-sm btn-nordic'>
                    Reject
            </Button> : '';

        const updateButton = <Button disabled={!this.isSlaveLatencyValid || !this.isConnectionSupervisionTimeoutValid}
                                    type='button'
                                    onClick={() => this._handleUpdateConnection()}
                                    className='btn btn-primary btn-sm btn-nordic'>
                                    Update
                             </Button>;

        const cancelButton = event.type === BLEEventType.USER_INITIATED_CONNECTION_UPDATE ?
            <Button type='button'
                    onClick={() => this._handleCancelUserInitiatedEvent()}
                    className='btn btn-default btn-sm btn-nordic'>
                    Cancel
            </Button> : '';

        return (
            <div>
                <div className='event-header'>
                    <h4>{this._generateHeaderMessage()}</h4>
                </div>
                 <form className='form-horizontal'>
                    <div className='form-group '>
                        {this._createConnectionIntervalControl()}
                    </div>
                    <div className='form-group'>
                        <label className='control-label col-sm-7' htmlFor={'latency_' + address}>Latency (ms)</label>
                        <div className='col-sm-5'>
                            <Input style={slaveLatencyStyle}
                                   id={'latency_' + address}
                                   className='form-control nordic-form-control'
                                   onChange={_event => this._handleSlaveLatencyChange(_event)}
                                   type='number'
                                   value={this.slaveLatency}
                                   min={CONN_LATENCY_MIN}
                                   max={CONN_LATENCY_MAX}
                                   step={CONN_LATENCY_STEP}
                                   />
                        </div>
                    </div>
                    <div className='form-group'>
                        <div>
                            <label className='control-label col-sm-7' htmlFor={'timeout_' + address}>Timeout (ms)</label>
                            <div className='col-sm-5'>
                                <Input style={connectionSupervisionTimeoutInputStyle}
                                       id={'timeout_' + address}
                                       className='form-control nordic-form-control'
                                       onChange={_event => this._handleConnectionSupervisionTimeoutChange(_event)}
                                       type='number'
                                       min={CONN_TIMEOUT_MIN}
                                       max={CONN_TIMEOUT_MAX}
                                       step={CONN_TIMEOUT_STEP}
                                       value={this.connectionSupervisionTimeout}/>
                            </div>
                        </div>
                        <div>
                            {updateButton}
                            {cancelButton}
                            {rejectButton}
                            {ignoreButton}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

ConnectionUpdateRequestEditor.propTypes = {
    event: PropTypes.object.isRequired,
    onRejectConnectionParams: PropTypes.func.isRequired,
    onUpdateConnectionParams: PropTypes.func.isRequired,
    onIgnoreEvent: PropTypes.func.isRequired,
    onCancelUserInitiatedEvent: PropTypes.func.isRequired,
};
