'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';

import { Input } from 'react-bootstrap';

import { BLEEventType } from '../actions/common';

// This component views an editor for connection update parameters
// One concept is essential:
//  If the user sets an connectionInterval we force that value to the SoftDevice
//  by setting both maxConnectionInterval and minConnection interval to that value.
export class ConnectionUpdateRequestEditor extends Component {
    constructor(props) {
        super(props);

        const requestedConnectionParams = props.event.requestedConnectionParams;

        // Use minConnection interval as start value for selected connection interval
        this.connectionInterval = requestedConnectionParams.minConnectionInterval;

        this.maxConnectionInterval = requestedConnectionParams.maxConnectionInterval;
        this.minConnectionInterval = requestedConnectionParams.minConnectionInterval;
        this.connectionSupervisionTimeout = requestedConnectionParams.connectionSupervisionTimeout;
        this.slaveLatency = requestedConnectionParams.slaveLatency;
    }

    _generateHeaderMessage() {
        const { event } = this.props;
        const address = event.device.address;

        if (event.type === BLEEventType.USER_INITIATED_CONNECTION_UPDATE) {
            return `Connection Parameters for device at ${address}`;
        } else {
            return `The device at ${address} has requested a connection parameter update. (ID#${event.id})`;
        }
    }

    _createConnectionIntervalControl() {
        const {
            event,
        } = this.props;

        const device = event.device;
        const address = device.address;

        if (device.minConnectionInterval === device.maxConnectionInterval) {
            return (
                <div>
                    <label className="control-label col-sm-6" htmlFor={"interval_" + address}>Connection Interval (ms)</label>
                    <div className="col-sm-6">
                        <Input id={"interval_" + address}
                               type="text"
                               onChange={_event => this._handleConnectionIntervalChange(_event)}
                               className="form-control nordic-form-control"
                               type="number"
                               readOnly
                               value={this.connectionInterval}/>
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                    <label className="control-label col-sm-8"
                           htmlFor={"interval_"+ address}>Connection Interval ({device.minConnectionInterval}-{device.maxConnectionInterval}ms)</label>
                    <div className="col-sm-4">
                        <Input id={"interval_" + address}
                           className="form-control nordic-form-control"
                           onChange={_event => this._handleConnectionIntervalChange(_event) }
                           type="number"
                           min={device.minConnectionInterval}
                           max={device.maxConnectionInterval}
                           value={this.connectionInterval}/>
                    </div>
                </div>
            );
        }
    }

    _isSlaveLatencyValid(slaveLatency) {
        return ( (slaveLatency >= 0) && (slaveLatency <= 1000) );
    }

    _isConnectionSupervisionTimeoutValid(connectionSupervisionTimeout) {
        return ( (connectionSupervisionTimeout >= 10) && (connectionSupervisionTimeout < 3200) );
    }

    _handleConnectionSupervisionTimeoutChange(event) {
        this.connectionSupervisionTimeout = parseInt(event.target.value, 10);
        this.isConnectionSupervisionTimeoutValid = this._isConnectionSupervisionTimeoutValid(this.connectionSupervisionTimeout);
        this.forceUpdate();
    }

    _handleSlaveLatencyChange(event) {
        this.slaveLatency = parseInt(event.target.value, 10);
        this.isSlaveLatencyValid = this._isSlaveLatencyValid(this.slaveLatency);
        this.forceUpdate();
    }

    _handleConnectionIntervalChange(event) {
        this.connectionInterval = parseInt(event.target.value, 10);
        this.forceUpdate();
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
            onRejectConnectionParams
        } = this.props;

        onRejectConnectionParams(event.device);
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

        return (
            <div>
                <div className="event-header">
                    <p>{this._generateHeaderMessage()}</p>
                </div>
                 <form className="form-horizontal">
                    <div className="form-group ">
                        {this._createConnectionIntervalControl()}
                    </div>
                    <div className="form-group">
                        <label className="control-label col-sm-6" htmlFor={"latency_" + address}>Latency (ms)</label>
                        <div className="col-sm-6">
                            <Input style={slaveLatencyStyle}
                                   id={"latency_" + address}
                                   className="form-control nordic-form-control"
                                   onChange={_event => this._handleSlaveLatencyChange(_event)}
                                   type="number"
                                   value={this.slaveLatency}/>
                        </div>
                    </div>
                    <div className="form-group">
                        <div>
                            <label className="control-label col-sm-6" htmlFor={"timeout_" + address}>Timeout (ms)</label>
                            <div className="col-sm-6">
                                <Input style={connectionSupervisionTimeoutInputStyle}
                                       id={"timeout_" + address}
                                       className="form-control nordic-form-control"
                                       onChange={_event => this._handleConnectionSupervisionTimeoutChange(_event)}
                                       type="number"
                                       value={this.connectionSupervisionTimeout}/>
                            </div>
                        </div>
                        <div>
                            <button disabled={!this.isSlaveLatencyValid || !this.isConnectionSupervisionTimeoutValid}
                                    type="button"
                                    onClick={() => this._handleUpdateConnection()}
                                    className="btn btn-primary btn-xs btn-nordic">
                                Update
                            </button>
                            <button type="button"
                                    onClick={() => this._handleRejectConnectionParams()}
                                    className="btn btn-default btn-xs btn-nordic">
                                {(event.type === BLEEventType.USER_INITIATED_CONNECTION_UPDATE) ? 'Cancel' : 'Reject'}
                            </button>
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
};
