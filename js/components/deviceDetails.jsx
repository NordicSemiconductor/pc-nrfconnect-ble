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
import EnumeratingAttributes from './EnumeratingAttributes.jsx';

// import KeyNavigation from './common/TreeViewKeyNavigationMixin.jsx';
import logger from '../logging';

import ServiceItem from './ServiceItem';
import {GattDatabases} from './../gattDatabases';

export default class DeviceDetailsView extends Component {
    render() {
        const {
            adapter,
            device,
            selected,
        } = this.props;
        const {
            instanceId,
            name,
            address,
            role,
        } = device;

        const centralPosition = {
            x: 0,
            y: 0,
        };

        if (device && role === undefined) {
            const {
                device: {
                    advertising,
                },
                onSelectComponent,
                onShowAdvertisingSetupDialog,
                onToggleAdvertising,
            } = this.props;
            /*TODO: Add local server*/
            return (
                <CentralDevice id={instanceId + '_details'}
                               position={centralPosition}
                               name={name}
                               address={address}
                               advertising={advertising}
                               selected={selected}
                               onShowDialog={onShowAdvertisingSetupDialog}
                               onToggleAdvertising={onToggleAdvertising} />
            );
        }

        const {
            onSelectComponent,
            onToggleAttributeExpanded,
            onDisconnectFromDevice,
            onPairWithDevice,
            onUpdateDeviceConnectionParams,
        } = this.props;

        const deviceDetail = this.props.deviceDetails.devices.get(instanceId);

        const connectedDevice = <ConnectedDevice id={instanceId + 'details'}
                                                 sourceId={adapter.instanceId + 'details'}
                                                 key={instanceId}
                                                 device={device}
                                                 selected={selected}
                                                 layout="vertical"
                                                 onSelectComponent={onSelectComponent}
                                                 onDisconnect={() => onDisconnectFromDevice(device)}
                                                 onPair={() => onPairWithDevice(device)}
                                                 onConnectionParamsUpdate={() => onUpdateDeviceConnectionParams(device)}/>;

        if (deviceDetail.discoveringChildren) {
            return (
                <div className="device-details-view" id={instanceId + '_details'} style={this.props.style}>
                    {connectedDevice}
                    <EnumeratingAttributes bars={1} />
                </div>
            );
        } else {
            const children = deviceDetail.get('children');
            const childrenList = [];

            if (children) {
                children.forEach(service => {
                    childrenList.push(<ServiceItem key={service.instanceId}
                                                   item={service}
                                                   selectOnClick={true}
                                                   selected={selected}
                                                   onSelectAttribute={onSelectComponent}
                                                   onToggleAttributeExpanded={onToggleAttributeExpanded}
                                                   />
                    );
                });
            }

            return (
                <div className="device-details-view" id={instanceId + '_details'} style={this.props.style}>
                    {connectedDevice}
                    <div className="service-items-wrap">
                        {childrenList}
                    </div>
                </div>
            );
        }
    }
}
