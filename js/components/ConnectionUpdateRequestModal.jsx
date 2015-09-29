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

import connectionStore from '../stores/connectionStore.js';
import connectionActions from '../actions/connectionActions.js';

import {Modal} from 'react-bootstrap';

var ConnectionUpdateRequestModal = React.createClass({
    mixins: [Reflux.listenTo(connectionStore, "onConnectionsChanged")],
    getInitialState: function(){
        return Object.assign({}, connectionStore.getInitialState(), {visible: false});
    },
    onConnectionsChanged: function(newState) {
        // Show modal only if there are updaterequests, and keep showing it until user presses 'close' button
        // regardless of updateRequest state. (This is why listenTo is used and not connect)
        if (!this.state.visible) {
            if (Object.keys(this.state.updateRequests).length > 0) {
                this.setState(Object.assign({}, newState, {visible: true}));
            }
        } else {
            this.setState(newState);
        }
    },
    _close: function(){
        this.setState({visible:false});
    },
    _updateConnection: function(connectionHandle, connectionParameters) {
        connectionActions.connectionParametersUpdate(connectionHandle, connectionParameters);
    },
    _handleChange: function(connectionHandle, inputIdentifier, event) {
        var newUpdateRequests = Object.assign({}, this.state.updateRequests);

        newUpdateRequests[connectionHandle][inputIdentifier] = parseInt(event.target.value, 10);
        this.setState({
            updateRequests: newUpdateRequests
        });
    },
    _createConnectionIntervalControl: function(connectionRequest, connectionHandle) {
        if (connectionRequest.min_conn_interval === connectionRequest.max_conn_interval) {
            return (<input id={"interval_" + connectionHandle} className="form-control nordic-form-control" type="number"  readOnly value = {connectionRequest.max_conn_interval}/>);
        } else {
            return (<input id={"interval_" + connectionHandle} type="range" min={connectionRequest.min_conn_interval} max={connectionRequest.max_conn_interval} value={connectionRequest.min_conn_interval}/>);
        }
    },
    render: function() {
        var requests = [];
        var key = 0;
        for (var connectionHandle in this.state.updateRequests) {
            var connectionRequest = this.state.updateRequests[connectionHandle];

            requests.push(
                <div key={key}>
                    <p>The device at {connectionRequest.deviceAddress} has issued a connection update request</p>
                     <form className="form-horizontal">
                        <div className="form-group ">
                            <div>
                                <label className=" control-label" htmlFor={"interval_"+connectionHandle}>Connection Interval</label>
                                {this._createConnectionIntervalControl(connectionRequest, connectionHandle)}&nbsp;ms
                            </div>
                            <div>
                                <label className="control-label" htmlFor={"latency_" + connectionHandle}>Latency</label>
                                <input id={"latency_" + connectionHandle} className="form-control nordic-form-control" 
                                       onChange={this._handleChange.bind(this, connectionHandle, 'slave_latency')} type="number" 
                                       value={connectionRequest.slave_latency}/>&nbsp;ms
                            </div>
                            <div>
                                <label className="control-label" htmlFor={"timeout_" + connectionHandle}>Timeout</label>                            
                                <input id={"timeout_" + connectionHandle} className="form-control nordic-form-control" 
                                       onChange={this.handleChange} type="number" value={connectionRequest.conn_sup_timeout}/>&nbsp;ms
                            </div>
                            <div>
                                <button type="button" onClick={this._updateConnection.bind(this, parseInt(connectionHandle, 10), connectionRequest)} className="btn btn-primary btn-xs btn-nordic">
                                    Update
                                </button>
                            </div>
                        </div>
                    </form>
                
                </div>
            );
            key++;
        }

        var isDisabled = (Object.keys(this.state.updateRequests).length > 0);
        return (
            <Modal dialogClassName="connection-request-modal" show={this.state.visible} onHide={this._close}>
                <Modal.Header closeButton>
                    <Modal.Title>Connection Update Requests</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {requests}
                </Modal.Body>
                <Modal.Footer>
                    <button disabled={isDisabled} className="btn btn-primary btn-nordic"onClick={this._close}>Close</button>
                </Modal.Footer>
            </Modal>
        );
    }
});
module.exports = ConnectionUpdateRequestModal;