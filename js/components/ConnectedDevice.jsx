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

import React, { Component, PropTypes } from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';

import Connector from './Connector';
import { prepareDeviceData } from '../common/deviceProcessing';

export default class ConnectedDevice extends Component {
    constructor(props) {
        super(props);
        this.connectorCanBeDrawn = false;
    }

    _onSelect(event, eventKey) {
        const {
            onDisconnect,
            onBond,
            onConnectionUpdate
        } = this.props;

        switch (eventKey) {
            case 'Disconnect':
                onDisconnect();
                break;
            case 'Update':
                onConnectionUpdate();
                console.log('Connect');
                // connectionActions.connectionParametersUpdateRequest(event, eventTypes.userInitiatedConnectionUpdate);
                break;
            case 'Bond':
                console.log('Ohh, yes, lets do that bonding.');
                onBond();
                break;
            default:
                console.log('Unknown eventKey received: ' + eventKey);
        }
    }

    render() {
        const {
            node,
            id,
            sourceId,
            layout,
            onDisconnect,
            onBond,
            onConnectionUpdate,
        } = this.props;

        const _device = prepareDeviceData(node.device);
        const role = node.id === 'central' ? 'Central' : 'Peripheral';

        const style = {
            width: '250px',
            opacity: node.connectionLost ? 0.5 : 1.0,
        };

        return (
            <div id={id} className="device standalone" style={style}>
                <div className="top-bar">
                </div>

                <div className="device-body text-small" >
                    <div>
                        <div className="pull-right">
                            <Dropdown onSelect={(event, eventKey) => { this._onSelect(event, eventKey); }}>
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
                        <strong>{_device.name}</strong>
                    </div>
                    <div className="address-text">{_device.address}</div>
                    <div className="flag-line">
                        {_device.services.map((service, index) => {
                            return (<div key={index} className="device-flag">{service}</div>);
                        })}
                    </div>
                </div>
            </div>
        );
    }
}


ConnectedDevice.propTypes = {
    id: PropTypes.string.isRequired,
    node: PropTypes.object.isRequired,
    sourceId: PropTypes.string.isRequired,
    layout: PropTypes.string.isRequired,
    onDisconnect: PropTypes.func.isRequired,
    onBond: PropTypes.func.isRequired,
    onConnectionUpdate: PropTypes.func.isRequired,
};
