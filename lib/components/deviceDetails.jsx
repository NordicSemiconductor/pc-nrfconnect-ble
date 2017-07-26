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

import React from 'react';
import PropTypes from 'prop-types';

import ConnectedDevice from './ConnectedDevice';
import CentralDevice from './CentralDevice';
import EnumeratingAttributes from './EnumeratingAttributes';
import ServiceItem from './ServiceItem';
import { SECURE_DFU_UUID } from '../utils/definitions';

class DeviceDetailsView extends React.PureComponent {
    constructor(props) {
        super(props);

        this.onDisconnectFromDevice = this.onDisconnectFromDevice.bind(this);
        this.onUpdateDeviceConnectionParams = this.onUpdateDeviceConnectionParams.bind(this);
        this.onPairWithDevice = this.onPairWithDevice.bind(this);
        this.onShowDfuDialog = this.onShowDfuDialog.bind(this);
    }

    onDisconnectFromDevice() {
        const { device, onDisconnectFromDevice } = this.props;
        onDisconnectFromDevice(device);
    }

    onUpdateDeviceConnectionParams() {
        const { device, onUpdateDeviceConnectionParams } = this.props;
        onUpdateDeviceConnectionParams(device);
    }

    onPairWithDevice() {
        const { device, onPairWithDevice } = this.props;
        onPairWithDevice(device);
    }

    onShowDfuDialog() {
        const { device, onShowDfuDialog } = this.props;
        onShowDfuDialog(device);
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

        return (
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
        );
    }

    hasDfuService(instanceId) {
        const deviceDetail = this.props.deviceDetails.devices.get(instanceId);
        if (!deviceDetail.discoveringChildren) {
            const services = deviceDetail.get('children');
            if (services) {
                return services.some(service => service.uuid === SECURE_DFU_UUID);
            }
        }
        return false;
    }

    renderChildren(instanceId) {
        const deviceDetail = this.props.deviceDetails.devices.get(instanceId);

        if (deviceDetail.discoveringChildren) {
            return <EnumeratingAttributes bars={1} />;
        }

        const children = deviceDetail.get('children');
        if (children) {
            return (
                <div className="service-items-wrap">
                    {children.valueSeq().map(service => this.createServiceItem(service))}
                </div>
            );
        }

        return undefined;
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

            const localDevice = (
                <CentralDevice
                    id={`${instanceId}_details`}
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
                    security={security}
                />
            );

            if (!deviceDetails) {
                return (
                    <div className="local-server device-details-view" id={`${instanceId}_details`} style={this.props.style}>
                        {localDevice}
                    </div>
                );
            }

            const services = this.renderChildren('local.server');

            return (
                <div className="local-server device-details-view" id={`${instanceId}_details`} style={this.props.style}>
                    {localDevice}
                    {services}
                </div>
            );
        }

        const deviceDetail = this.props.deviceDetails.devices.get(instanceId);
        const isDfuSupported = this.hasDfuService(instanceId);

        if (!deviceDetail) {
            return <div />;
        }

        const connectedDevice = (
            <ConnectedDevice
                id={`${instanceId}_details`}
                sourceId={`${adapter.instanceId}_details`}
                key={instanceId}
                device={device}
                selected={selected}
                layout="vertical"
                isDfuSupported={isDfuSupported}
                onClickDfu={this.onShowDfuDialog}
                onSelectComponent={onSelectComponent}
                onDisconnect={this.onDisconnectFromDevice}
                onPair={this.onPairWithDevice}
                onConnectionParamsUpdate={this.onUpdateDeviceConnectionParams}
            />
        );

        const services = this.renderChildren(instanceId);

        return (
            <div className="remote-server device-details-view" id={`${instanceId}_details`} style={this.props.style}>
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
    deviceDetails: null,
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
