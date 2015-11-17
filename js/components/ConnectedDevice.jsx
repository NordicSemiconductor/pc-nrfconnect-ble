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

import React, { Component } from 'react';
import {Dropdown, MenuItem} from 'react-bootstrap';

import Connector from './Connector';
import { prepareDeviceData } from '../common/deviceProcessing';
//import {connectionActions, eventTypes} from '../actions/connectionActions.js';

export default class ConnectedDevice extends Component {
    constructor(props) {
        super(props);
        this.connectorCanBeDrawn = false;
    }

    _onSelect(event, eventKey) {
        console.log(eventKey);
        switch(eventKey) {
            case "Disconnect":
                connectionActions.disconnectFromDevice(this.props.device.peer_addr.address);
                break;
            case "Update":
                const event = {
                    conn_handle : this.props.device.connection.conn_handle,
                    conn_params : this.props.device.connection.conn_params
                };
                connectionActions.connectionParametersUpdateRequest(event, eventTypes.userInitiatedConnectionUpdate);
                break;
        }
    }

    render() {
        const {
            node,
            device,
            id,
            sourceId,
            layout
        } = this.props;

        const _device = prepareDeviceData(device);
        const role = node.id === "central" ? "Central" : "Peripheral";
        const connected = !node.connectionLost;

        const style={
            width: '250px',
            opacity: node.connectionLost ? 0.5 : 1.0
        };

        return (
            <div id={id} className="device standalone" style={style}>
                <div className="top-bar">
                {
                 //   <i className={connected ? "icon-link" : "icon-link-broken" }></i>
                 //   <span className="subtle-text">{connected ? 'Connected' : 'Disconnected'}</span>
                 //   <span className="subtle-text pull-right" style={{marginTop: '2px'}}>{device.rssi}</span>
                 //
                 //    <div style={{float: 'right'}}>
                 //       <span style={{width: device.rssi_level + 'px'}} className="icon-signal icon-foreground"></span>
                 //       <span className="icon-signal icon-background"></span>
                 //   </div>
                }
                </div>

                <div className="device-body text-small" >
                    <div>
                        <div className="pull-right">
                            <Dropdown onSelect={this._onSelect}>
                                <Dropdown.Toggle noCaret>
                                    <span className="icon-cog" aria-hidden="true" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <MenuItem eventKey="Update">Update Connection</MenuItem>
                                    <MenuItem eventKey="Bond">Bond</MenuItem>
                                    <MenuItem eventKey="Disconnect">Disconnect</MenuItem>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        <div className="role-flag pull-right">{role}</div>
                        <strong>{device.name}</strong>
                    </div>
                    <div className="address-text">{_device.address}</div>
                    <div className="flag-line">
                        {_device.services.map(function(service, index) {
                            return (<div key={index} className="device-flag">{service}</div>)
                        })}
                    </div>
                </div>
                <Connector sourceId={sourceId} targetId={id} device={_device} layout={layout}/>
            </div>
        );
    }
}
