/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
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
