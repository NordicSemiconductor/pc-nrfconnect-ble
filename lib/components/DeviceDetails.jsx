/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* eslint react/forbid-prop-types: off */

'use strict';

import PropTypes from 'prop-types';
import React from 'react';

import { SECURE_DFU_UUID } from '../utils/definitions';
import CentralDevice from './CentralDevice';
import ConnectedDevice from './ConnectedDevice';
import EnumeratingAttributes from './EnumeratingAttributes';
import ServiceItem from './ServiceItem';

const DeviceDetailsView = ({
    device,
    selected, // instanceId for the selected component
    onSelectComponent,
    onSetAttributeExpanded,
    onUpdateDeviceConnectionParams,
    onUpdateDevicePhy,
    onUpdateDeviceMtu,
    onUpdateDeviceDataLength,
    deviceDetails,
    connectedDevicesNumber,
    adapter,
    onReadCharacteristic,
    onWriteCharacteristic,
    onReadDescriptor,
    onWriteDescriptor,
    onDisconnectFromDevice,
    onPairWithDevice,
    onShowAdvertisingSetupDialog,
    onToggleAdvertising,
    onToggleAutoConnUpdate,
    autoConnUpdate,
    security,
    onToggleAutoAcceptPairing,
    onDeleteBondInfo,
    onShowSecurityParamsDialog,
    onOpenCustomUuidFile,
    onSetSecurityParams,
    onShowDfuDialog,
    style,
}) => {
    const renderChildren = id => {
        const deviceDetail = deviceDetails.devices.get(id);

        if (deviceDetail.discoveringChildren) {
            return <EnumeratingAttributes bars={1} />;
        }

        const children = deviceDetail.get('children');
        if (children) {
            return (
                <div className="service-items-wrap">
                    {children.valueSeq().map(service => (
                        <ServiceItem
                            key={service.instanceId}
                            item={service}
                            selectOnClick
                            selected={selected}
                            onSelectAttribute={onSelectComponent}
                            onSetAttributeExpanded={onSetAttributeExpanded}
                            onReadCharacteristic={onReadCharacteristic}
                            onWriteCharacteristic={onWriteCharacteristic}
                            onReadDescriptor={onReadDescriptor}
                            onWriteDescriptor={onWriteDescriptor}
                        />
                    ))}
                </div>
            );
        }

        return undefined;
    };

    const {
        instanceId,
        name,
        address,
        role,
    } = device;

    if (device && role === undefined) {
        return (
            <div className="local-server device-details-view" id={`${instanceId}_details`} style={style}>
                <CentralDevice
                    id={`${instanceId}_details`}
                    position={{ x: 0, y: 0 }}
                    name={name}
                    address={address}
                    advertising={device.advertising}
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
                    security={security}
                    isDeviceDetails
                />
                {deviceDetails && renderChildren('local.server')}
            </div>
        );
    }

    if (!deviceDetails.devices.get(instanceId)) {
        return <div />;
    }

    const hasDfuService = () => {
        const deviceDetail = deviceDetails.devices.get(instanceId);
        if (!deviceDetail.discoveringChildren) {
            const services = deviceDetail.get('children');
            if (services) {
                return services.some(service => service.uuid === SECURE_DFU_UUID);
            }
        }
        return false;
    };

    return (
        <div className="remote-server device-details-view" id={`${instanceId}_details`} style={style}>
            <ConnectedDevice
                id={`${instanceId}_details`}
                sourceId={`${adapter.instanceId}_details`}
                key={instanceId}
                device={device}
                selected={selected}
                layout="vertical"
                connectedDevicesNumber={connectedDevicesNumber}
                isDfuSupported={hasDfuService(instanceId)}
                onClickDfu={() => onShowDfuDialog(device)}
                onSelectComponent={onSelectComponent}
                onDisconnect={() => onDisconnectFromDevice(device)}
                onPair={() => onPairWithDevice(device)}
                onConnectionParamsUpdate={() => onUpdateDeviceConnectionParams(device)}
                onPhyUpdate={() => onUpdateDevicePhy(device)}
                onMtuUpdate={() => onUpdateDeviceMtu(device)}
                onDataLengthUpdate={() => onUpdateDeviceDataLength(device)}
            />
            {renderChildren(instanceId)}
        </div>
    );
};

DeviceDetailsView.propTypes = {
    device: PropTypes.object.isRequired,
    selected: PropTypes.string,
    onSelectComponent: PropTypes.func.isRequired,
    onSetAttributeExpanded: PropTypes.func.isRequired,
    onUpdateDeviceConnectionParams: PropTypes.func,
    onUpdateDevicePhy: PropTypes.func,
    onUpdateDeviceMtu: PropTypes.func,
    onUpdateDeviceDataLength: PropTypes.func,
    deviceDetails: PropTypes.object,
    connectedDevicesNumber: PropTypes.number,
    adapter: PropTypes.object,
    onReadCharacteristic: PropTypes.func.isRequired,
    onWriteCharacteristic: PropTypes.func.isRequired,
    onReadDescriptor: PropTypes.func.isRequired,
    onWriteDescriptor: PropTypes.func.isRequired,
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
    onSetSecurityParams: PropTypes.func,
    onShowDfuDialog: PropTypes.func,
    style: PropTypes.object,
};

DeviceDetailsView.defaultProps = {
    selected: null,
    onUpdateDeviceConnectionParams: null,
    onUpdateDevicePhy: null,
    onUpdateDeviceMtu: null,
    onUpdateDeviceDataLength: null,
    deviceDetails: null,
    connectedDevicesNumber: 0,
    adapter: null,
    onDisconnectFromDevice: null,
    onPairWithDevice: null,
    onShowAdvertisingSetupDialog: null,
    onToggleAdvertising: null,
    onToggleAutoConnUpdate: null,
    autoConnUpdate: false,
    security: null,
    onToggleAutoAcceptPairing: null,
    onDeleteBondInfo: null,
    onShowSecurityParamsDialog: null,
    onOpenCustomUuidFile: null,
    onSetSecurityParams: null,
    onShowDfuDialog: null,
    style: null,
};

export default DeviceDetailsView;
