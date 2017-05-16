/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { Button } from 'react-bootstrap';
import TextInput from './input/TextInput';

import { BLEEventType } from '../actions/common';
import { Event } from '../reducers/bleEventReducer';

const CONN_INTERVAL_MIN = 7.5;
const CONN_INTERVAL_MAX = 4000;
const CONN_INTERVAL_STEP = 1.25;
const CONN_TIMEOUT_MIN = 100;
const CONN_TIMEOUT_MAX = 32000;
const CONN_TIMEOUT_STEP = 10;
const CONN_LATENCY_MIN = 0;
const CONN_LATENCY_MAX = 499;
const CONN_LATENCY_STEP = 1;

function isSlaveLatencyValid(slaveLatency) {
    return ((slaveLatency >= CONN_LATENCY_MIN) && (slaveLatency <= CONN_LATENCY_MAX));
}

function isConnectionSupervisionTimeoutValid(connectionSupervisionTimeout) {
    return ((connectionSupervisionTimeout >= CONN_TIMEOUT_MIN)
        && (connectionSupervisionTimeout < CONN_TIMEOUT_MAX));
}

const validInputStyle = {
    boxShadow: 'inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, 0.6)',
    borderColor: '#66afe9',
};

const invalidInputStyle = {
    boxShadow: 'inset 0 1px 1px rgba(0,0,0,.075), 0 0 5px rgba(255, 0, 0, 1)',
    borderColor: 'rgb(200, 10, 10)',
};

// This component views an editor for connection update parameters
// One concept is essential:
//  If the user sets an connectionInterval we force that value to the SoftDevice
//  by setting both maxConnectionInterval and minConnection interval to that value.
class ConnectionUpdateRequestEditor extends React.PureComponent {
    constructor(props) {
        super(props);

        const { event } = props;

        const requestedConnectionParams = event.requestedConnectionParams;

        this.connectionInterval = requestedConnectionParams.minConnectionInterval;
        this.connectionSupervisionTimeout = requestedConnectionParams.connectionSupervisionTimeout;
        this.slaveLatency = requestedConnectionParams.slaveLatency;

        this.maxConnectionInterval = requestedConnectionParams.maxConnectionInterval;
        this.minConnectionInterval = requestedConnectionParams.minConnectionInterval;

        this.setAndValidateSlaveLatency(this.slaveLatency);
        this.setAndValidateConnectionSupervisionTimeout(this.connectionSupervisionTimeout);

        this.handleUpdateConnection = this.handleUpdateConnection.bind(this);
        this.handleConnectionIntervalChange = this.handleConnectionIntervalChange.bind(this);
        this.handleConnectionSupervisionTimeoutChange =
            this.handleConnectionSupervisionTimeoutChange.bind(this);
        this.handleSlaveLatencyChange = this.handleSlaveLatencyChange.bind(this);
        this.onIgnoreEvent = this.onIgnoreEvent.bind(this);
        this.onUpdateConnectionParams = this.onUpdateConnectionParams.bind(this);
        this.onRejectConnectionParams = this.onRejectConnectionParams(this);
        this.onCancelUserInitiatedEvent = this.onCancelUserInitiatedEvent.bind(this);
    }

    onIgnoreEvent() {
        const { event, onIgnoreEvent } = this.props;
        onIgnoreEvent(event.id);
    }

    onUpdateConnectionParams() {
        const { event, onUpdateConnectionParams } = this.props;
        onUpdateConnectionParams(event.id);
    }

    onRejectConnectionParams() {
        const { event, onRejectConnectionParams } = this.props;
        onRejectConnectionParams(event.device);
    }

    onCancelUserInitiatedEvent() {
        const { event, onCancelUserInitiatedEvent } = this.props;
        onCancelUserInitiatedEvent(event.id);
    }

    setAndValidateConnectionSupervisionTimeout(value) {
        this.connectionSupervisionTimeout = value;
        this.isConnectionSupervisionTimeoutValid =
            isConnectionSupervisionTimeoutValid(this.connectionSupervisionTimeout);
    }

    setAndValidateSlaveLatency(value) {
        this.slaveLatency = value;
        this.isSlaveLatencyValid = isSlaveLatencyValid(value);
    }

    generateHeaderMessage() {
        const { event } = this.props;
        const address = event.device.address;

        if (event.type === BLEEventType.USER_INITIATED_CONNECTION_UPDATE) {
            return `Connection parameters update for device ${address}`;
        } else if (event.type === BLEEventType.PEER_PERIPHERAL_INITIATED_CONNECTION_UPDATE) {
            return `Connection parameters update request from device ${address}`;
        } else if (event.type === BLEEventType.PEER_CENTRAL_INITIATED_CONNECTION_UPDATE) {
            return `Connection parameters updated by peer central ${address}`;
        }
        return undefined;
    }

    createConnectionIntervalControl() {
        const {
            event,
        } = this.props;

        const device = event.device;
        const address = device.address;

        const rcp = event.requestedConnectionParams;

        const range = event.type === BLEEventType.USER_INITIATED_CONNECTION_UPDATE
            ? undefined
            : <div>({rcp.minConnectionInterval}-{rcp.maxConnectionInterval})</div>;

        return (
            <div>
                <label
                    className="control-label col-sm-7"
                    htmlFor={`interval_${address}`}
                >
                    Connection Interval (ms) {range}
                </label>
                <div className="col-sm-5">
                    <TextInput
                        id={`interval_${address}`}
                        className="form-control nordic-form-control"
                        onChange={this.handleConnectionIntervalChange}
                        type="number"
                        min={CONN_INTERVAL_MIN}
                        max={CONN_INTERVAL_MAX}
                        step={CONN_INTERVAL_STEP}
                        defaultValue={`${this.connectionInterval}`}
                        readOnly={this.readOnly}
                    />
                </div>
            </div>
        );
    }

    handleConnectionSupervisionTimeoutChange(event) {
        this.setAndValidateConnectionSupervisionTimeout(parseInt(event.target.value, 10));
        this.forceUpdate();
    }

    handleSlaveLatencyChange(event) {
        this.setAndValidateSlaveLatency(parseInt(event.target.value, 10));
        this.forceUpdate();
    }

    handleConnectionIntervalChange(event) {
        if (event.target.value === '') {
            return;
        }

        this.connectionInterval = parseFloat(event.target.value);
    }

    handleUpdateConnection() {
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
            },
        );
    }

    render() {
        const { event } = this.props;

        this.readOnly = (event.type === BLEEventType.PEER_CENTRAL_INITIATED_CONNECTION_UPDATE);

        const device = event.device;
        const address = device.address;

        const slaveLatencyStyle = this.isSlaveLatencyValid ?
            validInputStyle : invalidInputStyle;
        const connectionSupervisionTimeoutInputStyle = this.isConnectionSupervisionTimeoutValid ?
            validInputStyle : invalidInputStyle;

        const ignoreButton = event.type === BLEEventType.PEER_PERIPHERAL_INITIATED_CONNECTION_UPDATE
            ? (
                <Button
                    type="button"
                    onClick={this.onIgnoreEvent}
                    className="btn btn-default btn-sm btn-nordic"
                >
                    Ignore
                </Button>
            ) : '';

        const rejectButton = event.type === BLEEventType.PEER_PERIPHERAL_INITIATED_CONNECTION_UPDATE
            ? (
                <Button
                    type="button"
                    onClick={this.onRejectConnectionParams}
                    className="btn btn-default btn-sm btn-nordic"
                >
                    Reject
                </Button>
            ) : '';

        const disconnectButton =
            event.type === BLEEventType.PEER_CENTRAL_INITIATED_CONNECTION_UPDATE
            ? (
                <Button
                    type="button"
                    onClick={this.onRejectConnectionParams}
                    className="btn btn-default btn-sm btn-nordic"
                >
                    Disconnect
                </Button>
            ) : '';

        const updateButton = event.type !== BLEEventType.PEER_CENTRAL_INITIATED_CONNECTION_UPDATE
            ? (
                <Button
                    disabled={
                        !this.isSlaveLatencyValid || !this.isConnectionSupervisionTimeoutValid
                    }
                    type="button"
                    onClick={this.handleUpdateConnection}
                    className="btn btn-primary btn-sm btn-nordic"
                >
                    Update
                </Button>
            ) : '';

        const acceptButton = event.type === BLEEventType.PEER_CENTRAL_INITIATED_CONNECTION_UPDATE
            ? (
                <Button
                    disabled={
                        !this.isSlaveLatencyValid || !this.isConnectionSupervisionTimeoutValid
                    }
                    type="button"
                    onClick={this.onUpdateConnectionParams}
                    className="btn btn-primary btn-sm btn-nordic"
                >
                    Accept
                </Button>
            ) : '';

        const cancelButton = event.type === BLEEventType.USER_INITIATED_CONNECTION_UPDATE
            ? (
                <Button
                    type="button"
                    onClick={this.onCancelUserInitiatedEvent}
                    className="btn btn-default btn-sm btn-nordic"
                >
                    Cancel
                </Button>
            ) : '';

        return (
            <div>
                <div className="event-header">
                    <h4>{this.generateHeaderMessage()}</h4>
                </div>
                <form className="form-horizontal">
                    <div className="form-group ">
                        {this.createConnectionIntervalControl()}
                    </div>
                    <div className="form-group">
                        <label
                            className="control-label col-sm-7"
                            htmlFor={`latency_${address}`}
                        >
                            Slave latency
                        </label>
                        <div className="col-sm-5">
                            <TextInput
                                style={slaveLatencyStyle}
                                id={`latency_${address}`}
                                className="form-control nordic-form-control"
                                onChange={this.handleSlaveLatencyChange}
                                type="number"
                                value={this.slaveLatency}
                                min={CONN_LATENCY_MIN}
                                max={CONN_LATENCY_MAX}
                                step={CONN_LATENCY_STEP}
                                readOnly={this.readOnly}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div>
                            <label
                                className="control-label col-sm-7"
                                htmlFor={`timeout_${address}`}
                            >
                                Connection supervision timeout (ms)
                            </label>
                            <div className="col-sm-5">
                                <TextInput
                                    style={connectionSupervisionTimeoutInputStyle}
                                    id={`timeout_${address}`}
                                    className="form-control nordic-form-control"
                                    onChange={this.handleConnectionSupervisionTimeoutChange}
                                    type="number"
                                    min={CONN_TIMEOUT_MIN}
                                    max={CONN_TIMEOUT_MAX}
                                    step={CONN_TIMEOUT_STEP}
                                    readOnly={this.readOnly}
                                    value={this.connectionSupervisionTimeout}
                                />
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
    event: PropTypes.instanceOf(Event).isRequired,
    onRejectConnectionParams: PropTypes.func.isRequired,
    onUpdateConnectionParams: PropTypes.func.isRequired,
    onIgnoreEvent: PropTypes.func.isRequired,
    onCancelUserInitiatedEvent: PropTypes.func.isRequired,
};

export default ConnectionUpdateRequestEditor;
