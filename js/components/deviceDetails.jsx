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

import Component from 'react-pure-render/component';

import ConnectedDevice from './ConnectedDevice.jsx';
import CentralDevice from './CentralDevice.jsx';

// import KeyNavigation from './common/TreeViewKeyNavigationMixin.jsx';
import logger from '../logging';

import ServiceItem from './ServiceItem';
import {GattDatabases} from './../gattDatabases';

export default class DeviceDetailsView extends Component {
    render() {
        const {
            instanceId,
            name,
            address,
            role,
        } = this.props.node;

        var centralPosition = {
            x: 0,
            y: 0,
        };
        var services = [];

        if (this.props.node && role === undefined) {
            /*TODO: Add local server*/
            return (
                <CentralDevice id="adapter-details" name={name} address={address.address} position={centralPosition}/>
            );
        } else if (this.props.isEnumeratingServices) {
            return (
                <div className="device-details-view" id={instanceId + '_details'} style={this.props.style}>
                    <ConnectedDevice device={this.props.device} node={this.props.node} sourceId={'central_details'} id ={instanceId + '_details'} layout="vertical"/>
                    <div className="service-items-wrap device-body text-small">
                        <div style={{textAlign:'center'}}>Enumerating services...</div>
                        <img className="spinner center-block" src="resources/ajax-loader.gif" height="32" width="32"/>
                    </div>
                </div>
            );
        } else if (this.props.gattDatabase) {
            return (
                <div className="device-details-view" id={instanceId + '_details'} style={this.props.style}>
                    <ConnectedDevice device={this.props.device} node={this.props.node} sourceId="central_details" id={instanceId + '_details'} layout="vertical"/>
                    <div className="service-items-wrap">
                        {this.props.gattDatabase.services.map((service, i) =>
                            <ServiceItem name={service.name} key={i} characteristics={service.characteristics} item={service} selected={this.props.selected} onSelectedAttribute={this.props.onSelectedComponent} selectOnClick={true} connectionHandle={this.props.device.connection.conn_handle} />
                        )}
                    </div>
                </div>
            );
        } else {return <div/>;}
    }
}
