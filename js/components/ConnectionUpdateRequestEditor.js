/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
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

        this.connectionInterval = requestedConnectionParams.minConnectionInterval;
        this.connectionSupervisionTimeout = requestedConnectionParams.connectionSupervisionTimeout;
        this.slaveLatency = requestedConnectionParams.slaveLatency;

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
        } else if (event.type === BLEEventType.PEER_PERIPHERAL_INITIATED_CONNECTION_UPDATE) {
            return `Connection parameters update request from device ${address}`;
        } else if (event.type === BLEEventType.PEER_CENTRAL_INITIATED_CONNECTION_UPDATE) {
            return `Connection parameters updated by peer central ${address}`;
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
                        defaultValue={this.connectionInterval}
                        readOnly={this.readOnly}/>
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
            onUpdateConnectionParams,
            onRejectConnectionParams,
            onIgnoreEvent,
            onCancelUserInitiatedEvent,
        } = this.props;

        this.readOnly = (event.type === BLEEventType.PEER_CENTRAL_INITIATED_CONNECTION_UPDATE);

        const device = event.device;
        const address = device.address;

        const slaveLatencyStyle = this.isSlaveLatencyValid ?
            this._getValidInputStyle() : this._getInvalidInputStyle();
        const connectionSupervisionTimeoutInputStyle = this.isConnectionSupervisionTimeoutValid ?
            this._getValidInputStyle() : this._getInvalidInputStyle();

        const ignoreButton = event.type === BLEEventType.PEER_PERIPHERAL_INITIATED_CONNECTION_UPDATE ?
            <Button type='button'
                    onClick={() => onIgnoreEvent(event.id)}
                    className='btn btn-default btn-sm btn-nordic'>
                    Ignore
            </Button> : '';

        const rejectButton = event.type === BLEEventType.PEER_PERIPHERAL_INITIATED_CONNECTION_UPDATE ?
            <Button type='button'
                    onClick={() => onRejectConnectionParams(event.device)}
                    className='btn btn-default btn-sm btn-nordic'>
                    Reject
            </Button> : '';

        const disconnectButton = event.type === BLEEventType.PEER_CENTRAL_INITIATED_CONNECTION_UPDATE ?
            <Button type='button'
                    onClick={() => onRejectConnectionParams(event.device)}
                    className='btn btn-default btn-sm btn-nordic'>
                    Disconnect
            </Button> : '';

        const updateButton = event.type !== BLEEventType.PEER_CENTRAL_INITIATED_CONNECTION_UPDATE ?
            <Button disabled={!this.isSlaveLatencyValid || !this.isConnectionSupervisionTimeoutValid}
                                    type='button'
                                    onClick={() => this._handleUpdateConnection()}
                                    className='btn btn-primary btn-sm btn-nordic'>
                                    Update
                             </Button> : '';

        const acceptButton = event.type === BLEEventType.PEER_CENTRAL_INITIATED_CONNECTION_UPDATE ?
            <Button disabled={!this.isSlaveLatencyValid || !this.isConnectionSupervisionTimeoutValid}
                                    type='button'
                                    onClick={() => onUpdateConnectionParams(event.id)}
                                    className='btn btn-primary btn-sm btn-nordic'>
                                    Accept
                             </Button> : '';

        const cancelButton = event.type === BLEEventType.USER_INITIATED_CONNECTION_UPDATE ?
            <Button type='button'
                    onClick={() => onCancelUserInitiatedEvent(event.id)}
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
                                   readOnly={this.readOnly}
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
                                       readOnly={this.readOnly}
                                       value={this.connectionSupervisionTimeout}/>
                            </div>
                        </div>
                        <div>
                            {cancelButton}
                            {rejectButton}
                            {disconnectButton}
                            {updateButton}
                            {acceptButton}
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
