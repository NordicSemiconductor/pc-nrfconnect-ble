'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';

import * as BLEEventActions from '../actions/bleEventActions';

export class ConnectionUpdateRequestEditor extends Component {
    constructor(props) {
        super(props);

        this.connectionInterval = this.props.event.minConnectionInterval;
        this.isSlaveLatencyValid = true;
    }

/*
    getInitialState(){
        console.log('get initial state for connection update request editor');
        return {
            connectionParameters: this.props.event.payload.conn_params,
            isSlaveLatencyValid: true,
            isConnectionSupervisionTimeoutMultiplierValid: true,
            connectionInterval: this.props.event.payload.conn_params.min_conn_interval,
        };
    } */

/*
    componentWillReceiveProps(newProps) {
        if (newProps.event) {
            this.setState({
                connectionParameters: newProps.event.payload.conn_params,
                connectionInterval: this.props.event.payload.conn_params.min_conn_interval,
            });
        }
    } */

    _generateHeaderMessage() {
        const { eventType, deviceAddress } = this.props;

        if (eventType === BLEEventActions.EventType.USER_INITIATED_CONNECTION_UPDATE) {
            return 'Connection Parameters for device at ' + deviceAddress;
        } else {
            return 'The device at ' + deviceAddress + ' has requested a connection parameter update.';
        }
    }

    _createConnectionIntervalControl() {
        const {
            connectionUpdateRequest,
            deviceAddress,
            onConnectionIntervalChange,
            connectionInterval
        } = this.props;

        if (connectionUpdateRequest.minConnectionInterval === connectionUpdateRequest.maxConnectionInterval) {
            return (
                <div>
                    <label className="control-label col-sm-6" htmlFor={"interval_" + deviceAddress}>Connection Interval (ms)</label>
                    <div className="col-sm-6">
                        <input id={"interval_" + deviceAddress}
                               onChange={event => onConnectionIntervalChange(parseInt(event.target.value, 10))}
                               className="form-control nordic-form-control"
                               type="number"
                               readOnly
                               value={connectionInterval}/>
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                    <label className="control-label col-sm-8"
                           htmlFor={"interval_"+ deviceAddress}>Connection Interval ({connectionUpdateRequest.minConnectionInterval}-{connectionUpdateRequest.maxConnectionInterval}ms)</label>
                    <div className="col-sm-4">
                        <input id={"interval_" + deviceAddress}
                               className="form-control nordic-form-control"
                               onChange={(event) => { onConnectionIntervalChange(parseInt(event.target.value, 10)); }}
                               type="number"
                               min={connectionUpdateRequest.minConnectionInterval}
                               max={connectionUpdateRequest.maxConnectionInterval}
                               value={this.connectionInterval}/>
                    </div>
                </div>
            );
        }
    }

    _checkValidity(slaveLatency, connectionSupervisionTimeoutMultiplierValid) {
        let isSlaveLatencyValid = true;
        let isConnectionSupervisionTimeoutMultiplierValid = true;

        if ( (connectionSupervisionTimeoutMultiplierValid < 10) || (connectionSupervisionTimeoutMultiplierValid < 3200)) {
            isConnectionSupervisionTimeoutMultiplierValid = false;
        }
        return {
            isSlaveLatencyValid,
            isConnectionSupervisionTimeoutMultiplierValid
        };
    }

    _isSlaveLatencyValid(slaveLatency) {
        return ( (slaveLatency >= 0) && (slaveLatency <= 1000) );
    }

    _isConnectionSupervisionTimeoutMultiplerValid(connectionSupervisionTimeoutMultiplier) {
        return ( (connectionSupervisionTimeoutMultiplier >= 10) && (connectionSupervisionTimeoutMultiplier < 3200) );
    }

    _handleConnectionSupervisionTimeoutMultiplerChange(event) {
        this.connectionSupervisionTimeoutMultiplier = parseInt(event.target.value, 10);
        this.isConnectionSupervisionTimeoutMultiplierValid = this._isConnectionSupervisionTimeoutMultiplerValid(this.connectionSupervisionTimeoutMultiplier);
    }

    _handleSlaveLatencyChange(event) {
        this.slaveLatency = parseInt(event.target.value, 10);
        this.isSlaveLatencyValid = this._isSlaveLatencyValid(this.slaveLatency);
    }

    _handleConnectionIntervalChange() {
        this.connectionInterval = parseInt(event.target.value, 10);
    }

    _getCopyOfConnectionParameters(connectionParameters) {
        return {
            minConnectionInterval : connectionParameters.minConnectionInterval,
            maxConnectionInterval : this.connectionInterval,
            slaveLatency : connectionParameters.slaveLatency,
            connectionSupervisionTimeout : connectionParameters.connectionSupervisionTimeout,
        };
    }

    _updateConnection() {
        const {
            deviceInstanceId,
            connectionParameters,
        } = this.props;

        const copyOfConnectionParameters = this._getCopyOfConnectionParameters(connectionParameters);
        copyOfConnectionParameters.connectionSupervisionTimeout = this.connectionSupervisionTimeout;
        BLEEventActions.updateConnectionParameters(deviceInstanceId, copyOfConnectionParameters);

        // this.props.onUpdate();
    }

    _cancel() {
        const {
            deviceInstanceId
        } = this.props;

        BLEEventActions.rejectConnectionParameters(deviceInstanceId);
        // this.props.onUpdate();
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
            eventType,
            deviceAddress,
            deviceInstanceId,
            /* deviceInstanceId, use deviceAddress instead */
            isSlaveLatencyValid,
            isConnectionSupervisionTimeoutMultiplierValid,
            connectionInterval,
            connectionParameters,
            onConnectionIntervalChange,

/*            minConnectionInterval,
            maxConnectionInterval,
            slaveLatency,
            connectionSupervisionTimeout  -> use connectionParamters instead <- */
        } = this.props;

        const slaveLatencyStyle = isSlaveLatencyValid ?
            this._getValidInputStyle() : this._getInvalidInputStyle();
        const connectionSupervisionTimeoutMultiplierInputStyle = isConnectionSupervisionTimeoutMultiplierValid ?
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
                        <label className="control-label col-sm-6" htmlFor={"latency_" + connectionHandle}>Latency (ms)</label>
                        <div className="col-sm-6">
                            <input style={slaveLatencyStyle}
                                   id={"latency_" + connectionHandle}
                                   className="form-control nordic-form-control"
                                   onChange={this._handleSlaveLatencyChange}
                                   type="number"
                                   value={connectionParameters.slave_latency}/>
                        </div>
                    </div>
                    <div className="form-group">
                        <div>
                            <label className="control-label col-sm-6" htmlFor={"timeout_" + connectionHandle}>Timeout (ms)</label>
                            <div className="col-sm-6">
                                <input style={connectionSupervisionTimeoutMultiplierInputStyle}
                                       id={"timeout_" + connectionHandle}
                                       className="form-control nordic-form-control"
                                       onChange={this._handleConnectionSupervisionTimeoutMultiplerChange}
                                       type="number"
                                       value={connectionParameters.connectionSupervisionTimeout}/>
                            </div>
                        </div>
                        <div>
                            <button disabled={!isSlaveLatencyValid || !isConnectionSupervisionTimeoutMultiplierValid}
                                    type="button"
                                    onClick={this._updateConnection}
                                    className="btn btn-primary btn-xs btn-nordic">
                                Update
                            </button>
                            <button type="button"
                                    onClick={this._cancel}
                                    className="btn btn-default btn-xs btn-nordic">
                                {(eventType === BLEEventActions.EventType.USER_INITIATED_CONNECTION_UPDATE) ? 'Cancel' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
