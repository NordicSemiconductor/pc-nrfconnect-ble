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
        delete connectionParameters.deviceAddress;
        connectionActions.connectionParametersUpdate(connectionHandle, connectionParameters);
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
                            <label className=" control-label" htmlFor="interval">Connection Interval</label>
                            <div>
                                <input className="form-control nordic-form-control" type="number" id="interval" value = {connectionRequest.max_conn_interval}/>
                            </div>
                            <label className="control-label" htmlFor="latency">Latency</label>
                            <div >
                                <input className="form-control nordic-form-control" type="number" id="latency" value={connectionRequest.slave_latency}/>
                            </div>
                            <label className="control-label" htmlFor="timeout">Timeout</label>
                            <div>
                                <input className="form-control nordic-form-control" type="number" id="timeout" value={connectionRequest.conn_sup_timeout}/>
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