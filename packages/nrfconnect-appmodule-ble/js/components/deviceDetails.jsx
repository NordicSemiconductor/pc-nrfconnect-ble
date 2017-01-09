/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

import React, { PropTypes } from 'react';

import ConnectedDevice from './ConnectedDevice';
import CentralDevice from './CentralDevice';
import EnumeratingAttributes from './EnumeratingAttributes';
import ServiceItem from './ServiceItem';
import { getUuidByName } from '../utils/uuid_definitions';

export default class DeviceDetailsView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.dfuUuid = getUuidByName('Secure DFU');
    }

    renderChildren(instanceId) {
        const deviceDetail = this.props.deviceDetails.devices.get(instanceId);

        if (deviceDetail.discoveringChildren) {
            return <EnumeratingAttributes bars={1} />;
        }

        const children = deviceDetail.get('children');
        if (children) {
            return <div className="service-items-wrap">
                    {children.map(service => this.createServiceItem(service))}
                </div>;
        }

        return undefined;
    }

    createServiceItem(service) {
        const {
            selected,
            onSelectComponent,
            onSetAttributeExpanded,
            onReadCharacteristic,
            onWriteCharacteristic,
            onReadDescriptor,
            onWriteDescriptor,
        } = this.props;


        return <ServiceItem key={service.instanceId}
                     item={service}
                     selectOnClick={true}
                     selected={selected}
                     onSelectAttribute={onSelectComponent}
                     onSetAttributeExpanded={onSetAttributeExpanded}
                     onReadCharacteristic={onReadCharacteristic}
                     onWriteCharacteristic={onWriteCharacteristic}
                     onReadDescriptor={onReadDescriptor}
                     onWriteDescriptor={onWriteDescriptor} />;
    }

    _hasDfuService(instanceId) {
        const deviceDetail = this.props.deviceDetails.devices.get(instanceId);
        if (!deviceDetail.discoveringChildren) {
            const services = deviceDetail.get('children');
            if (services) {
                return services.some(service => service.uuid === this.dfuUuid);
            }
        }
        return false;
    }

    render() {
        const {
            adapter,
            device,
            selected, // instanceId for the selected component
            onSelectComponent,
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
                deviceDetails,
                onShowAdvertisingSetupDialog,
                onToggleAdvertising,
                autoConnUpdate,
                onToggleAutoConnUpdate,
                onShowSecurityParamsDialog,
                onToggleAutoAcceptPairing,
                onDeleteBondInfo,
                onSetSecurityParams,
                onOpenCustomUuidFile,
                security,
            } = this.props;

            const localDevice = (<CentralDevice id={instanceId + '_details'}
                                          position={centralPosition}
                                          name={name}
                                          address={address}
                                          advertising={advertising}
                                          selected={selected}
                                          onShowSetupDialog={onShowAdvertisingSetupDialog}
                                          onToggleAdvertising={onToggleAdvertising}
                                          autoConnUpdate={autoConnUpdate}
                                          onToggleAutoConnUpdate={onToggleAutoConnUpdate}
                                          onShowSecurityParamsDialog={onShowSecurityParamsDialog}
                                          onToggleAutoAcceptPairing={onToggleAutoAcceptPairing}
                                          onDeleteBondInfo={onDeleteBondInfo}
                                          onSetSecurityParams={onSetSecurityParams}
                                          onOpenCustomUuidFile={onOpenCustomUuidFile}
                                          security={security} />
            );

            if (!deviceDetails) {
                return (
                    <div className="local-server device-details-view" id={instanceId + '_details'} style={this.props.style}>
                        {localDevice}
                    </div>
                );
            }

            const services = this.renderChildren('local.server');

            return (
                <div className="local-server device-details-view" id={instanceId + '_details'} style={this.props.style}>
                    {localDevice}
                    {services}
                </div>
            );
        }

        const {
            onDisconnectFromDevice,
            onPairWithDevice,
            onUpdateDeviceConnectionParams,
            onShowDfuDialog,
        } = this.props;

        const deviceDetail = this.props.deviceDetails.devices.get(instanceId);
        const isDfuSupported = this._hasDfuService(instanceId);
        const onClickDfu = () => {
            onShowDfuDialog(device);
        };

        if (!deviceDetail) {
            return <div/>;
        }

        const connectedDevice = (<ConnectedDevice id={instanceId + '_details'}
                                                  sourceId={adapter.instanceId + '_details'}
                                                  key={instanceId}
                                                  device={device}
                                                  selected={selected}
                                                  layout="vertical"
                                                  isDfuSupported={isDfuSupported}
                                                  onClickDfu={onClickDfu}
                                                  onSelectComponent={onSelectComponent}
                                                  onDisconnect={() => onDisconnectFromDevice(device)}
                                                  onPair={() => onPairWithDevice(device)}
                                                  onConnectionParamsUpdate={() => onUpdateDeviceConnectionParams(device)}/>);

        const services = this.renderChildren(instanceId);

        return (
            <div className="remote-server device-details-view" id={instanceId + '_details'} style={this.props.style}>
                {connectedDevice}
                {services}
            </div>
        );
    }
}

DeviceDetailsView.propTypes = {
    device: PropTypes.object.isRequired,
    selected: PropTypes.string,
    onSelectComponent: PropTypes.func.isRequired,
    onSetAttributeExpanded: PropTypes.func.isRequired,
    onUpdateDeviceConnectionParams: PropTypes.func,
    deviceDetails: PropTypes.object,
    adapter: PropTypes.object,
    onReadCharacteristic: PropTypes.func,
    onWriteCharacteristic: PropTypes.func,
    onReadDescriptor: PropTypes.func,
    onWriteDescriptor: PropTypes.func,
    onDisconnectFromDevice: PropTypes.func,
    onPairWithDevice: PropTypes.func,
    onShowAdvertisingSetupDialog: PropTypes.func,
    onToggleAdvertising: PropTypes.func,
    onToggleAutoConnUpdate: PropTypes.func,
    autoConnUpdate: PropTypes.bool,
    security: PropTypes.object,
    onToggleAutoAcceptPairing: PropTypes.func,
    onDeleteBondInfo: PropTypes.func,
    onShowSecurityParamsDialog: PropTypes.func,
    onOpenCustomUuidFile: PropTypes.func,
};
