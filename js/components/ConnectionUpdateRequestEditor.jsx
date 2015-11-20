'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';

export class ConnectionUpdateRequestEditor extends Component {
    constructor(props) {
        super(props);
    }

/*
    getInitialState(){
        console.log('get initial state for connection update request editor');
        return {
            connectionParameters: this.props.event.payload.conn_params,
            isSlaveLatencyValid: true,
            isConnectionSupervisionTimeoutMultiplierValid: true,
            currentConnectionInterval: this.props.event.payload.conn_params.min_conn_interval,
        };
    } */

/*
    componentWillReceiveProps(newProps) {
        if (newProps.event) {
            this.setState({
                connectionParameters: newProps.event.payload.conn_params,
                currentConnectionInterval: this.props.event.payload.conn_params.min_conn_interval,
            });
        }
    } */

    _generateHeaderMessage(eventType) {
        if (eventType === eventTypes.userInitiatedConnectionUpdate) {
            return 'Connection Parameters for device at ' + this.props.event.deviceAddress;
        } else {
            return 'The device at ' + this.props.event.deviceAddress + ' has requested a connection parameter update.';
        }
    }

    _createConnectionIntervalControl(connectionUpdateRequest, connectionHandle) {
        if (connectionUpdateRequest.min_conn_interval === connectionUpdateRequest.max_conn_interval) {
            return (
                <div>
                    <label className="control-label col-sm-6" htmlFor={"interval_"+connectionHandle}>Connection Interval (ms)</label>
                    <div className="col-sm-6">
                        <input id={"interval_" + connectionHandle}
                               onChange={this._handleConnectionIntervalChange}
                               className="form-control nordic-form-control"
                               type="number"
                               readOnly
                               value={this.state.currentConnectionInterval}/>
                    </div>
                </div>
            );
        } else {
            return (
                <div>
                    <label className="control-label col-sm-8"
                           htmlFor={"interval_"+connectionHandle}>Connection Interval ({connectionUpdateRequest.min_conn_interval}-{connectionUpdateRequest.max_conn_interval}ms)</label>
                    <div className="col-sm-4">
                        <input id={"interval_" + connectionHandle}
                               className="form-control nordic-form-control"
                               onChange={this._handleConnectionIntervalChange}
                               type="number"
                               min={connectionUpdateRequest.min_conn_interval}
                               max={connectionUpdateRequest.max_conn_interval}
                               value={this.state.currentConnectionInterval}/>
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
        const connectionParameters = Object.assign({}, this.state.connectionParameters);

        const connectionSupervisionTimeoutMultiplier = parseInt(event.target.value, 10);
        connectionParameters.conn_sup_timeout = connectionSupervisionTimeoutMultiplier;

        const isConnectionSupervisionTimeoutMultiplierValid = this._isConnectionSupervisionTimeoutMultiplerValid(connectionSupervisionTimeoutMultiplier);
        this.setState({
            connectionParameters,
            isConnectionSupervisionTimeoutMultiplierValid
        });
    }

    _handleSlaveLatencyChange(event) {
        const connectionParameters = Object.assign({}, this.state.connectionParameters);

        const slaveLatency = parseInt(event.target.value, 10);
        connectionParameters.slave_latency = slaveLatency;

        const isSlaveLatencyValid = this._isSlaveLatencyValid(slaveLatency);
        this.setState({
            connectionParameters,
            isSlaveLatencyValid
        });
    }

    _handleConnectionIntervalChange() {
        const currentConnectionInterval = parseInt(event.target.value, 10);

        this.setState({
            currentConnectionInterval,
        });
    }

    _updateConnection(connectionHandle) {
        let newConnectionParameters = Object.assign({}, this.state.connectionParameters);
        newConnectionParameters.max_conn_interval = this.state.currentConnectionInterval;

        connectionActions.connectionParametersUpdate(connectionHandle, newConnectionParameters, this.props.event.id);
        this.props.onUpdate();
    }

    _cancel() {
        connectionActions.rejectOrCancelParametersUpdate(this.props.event.payload.conn_handle, this.props.event.id);
        this.props.onUpdate();
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
            connectionHandle,
            isSlaveLatencyValid,
            isConnectionSupervisionTimeoutMultiplierValid,
        } = this.props;

        const theEvent = this.props.event;
        const connectionHandle = theEvent.payload.conn_handle;
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
                        {this._createConnectionIntervalControl(this.state.connectionParameters, connectionHandle)}

                    </div>
                    <div className="form-group">
                        <label className="control-label col-sm-6" htmlFor={"latency_" + connectionHandle}>Latency (ms)</label>
                        <div className="col-sm-6">
                            <input style={slaveLatencyStyle}
                                   id={"latency_" + connectionHandle}
                                   className="form-control nordic-form-control"
                                   onChange={this._handleSlaveLatencyChange}
                                   type="number"
                                   value={this.state.connectionParameters.slave_latency}/>
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
                                       value={this.state.connectionParameters.conn_sup_timeout}/>
                            </div>
                        </div>
                        <div>
                            <button disabled={!isSlaveLatencyValid || !isConnectionSupervisionTimeoutMultiplierValid}
                                    type="button"
                                    onClick={this._updateConnection.bind(this, connectionHandle, this.props.connectionUpdateRequest)}
                                    className="btn btn-primary btn-xs btn-nordic">
                                Update
                            </button>
                            <button type="button"
                                    onClick={this._cancel}
                                    className="btn btn-default btn-xs btn-nordic">
                                {(eventType === eventTypes.userInitiatedConnectionUpdate) ? 'Cancel' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </form>

            </div>
        );
    }
}
