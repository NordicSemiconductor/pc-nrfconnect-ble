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

import React, { PropTypes } from 'react';

import Component from 'react-pure-render/component';

import ConnectedDevice from './ConnectedDevice';
import CentralDevice from './CentralDevice';
import EnumeratingAttributes from './EnumeratingAttributes';

import ServiceItem from './ServiceItem';
import { traverseItems, findSelectedItem } from './../common/treeViewKeyNavigation';

let moveUpHandle;
let moveDownHandle;
let moveRightHandle;
let moveLeftHandle;

export default class DeviceDetailsView extends Component {
    constructor(props) {
        super(props);
        this._registerKeyboardShortcuts();
    }

    _registerKeyboardShortcuts() {
        // Setup keyboard shortcut callbacks
        //
        // Since we move between the different "tabs" we have to
        // remove the listeners and add them again so that the correct instance
        // of this class is associated with the callback registered on window.
        this.moveUp = () => this._selectNextComponent(true);
        this.moveDown = () => this._selectNextComponent(false);
        this.moveRight = () => this._expandComponent(true);
        this.moveLeft = () => this._expandComponent(false);

        if (moveDownHandle) {
            window.removeEventListener('core:move-down', moveDownHandle);
        }

        window.addEventListener('core:move-down', this.moveDown);
        moveDownHandle = this.moveDown;

        if (moveUpHandle) {
            window.removeEventListener('core:move-up', moveUpHandle);
        }

        window.addEventListener('core:move-up', this.moveUp);
        moveUpHandle = this.moveUp;

        if (moveRightHandle) {
            window.removeEventListener('core:move-right', moveRightHandle);
        }

        window.addEventListener('core:move-right', this.moveRight);
        moveRightHandle = this.moveRight;

        if (moveLeftHandle) {
            window.removeEventListener('core:move-left', moveLeftHandle);
        }

        window.addEventListener('core:move-left', this.moveLeft);
        moveLeftHandle = this.moveLeft;
    }

    _selectNextComponent(backward) {
        const { device, deviceDetails, selected, onSelectComponent } = this.props;
        let foundCurrent = false;

        for (let item of traverseItems(deviceDetails, device.instanceId, true, backward)) {
            if (selected === null) {
                if (item !== null) {
                    onSelectComponent(item);
                    return;
                }
            }

            if (item.instanceId === selected) {
                foundCurrent = true;
            } else if (foundCurrent) {
                onSelectComponent(item);
                return;
            }
        }
    }

    _expandComponent(expand) {
        const {
            device,
            deviceDetails,
            selected,
            onToggleAttributeExpanded,
        } = this.props;

        if (!selected) {
            return;
        }

        const item = findSelectedItem(deviceDetails, device.instanceId, selected);

        if (item) {
            // TODO: when the deviceDetailActions and deviceDetailsReducer supports
            // TODO: exclicit expansion/collapsing we add that.
            onToggleAttributeExpanded(item);
        }
    }

    render() {
        const {
            adapter,
            device,
            selected, // instanceId for the selected component
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
                               onShowSetupDialog={onShowAdvertisingSetupDialog}
                               onToggleAdvertising={onToggleAdvertising} />
            );
        }

        const {
            onSelectComponent,
            onToggleAttributeExpanded,
            onReadCharacteristic,
            onWriteCharacteristic,
            onReadDescriptor,
            onWriteDescriptor,
            onDisconnectFromDevice,
            onPairWithDevice,
            onUpdateDeviceConnectionParams,
        } = this.props;

        const deviceDetail = this.props.deviceDetails.devices.get(instanceId);

        if (!deviceDetail) {
            return <div/>;
        }

        const connectedDevice = (<ConnectedDevice id={instanceId + '_details'}
                                                 sourceId={adapter.instanceId + '_details'}
                                                 key={instanceId}
                                                 device={device}
                                                 selected={selected}
                                                 layout="vertical"
                                                 onSelectComponent={onSelectComponent}
                                                 onDisconnect={() => onDisconnectFromDevice(device)}
                                                 onPair={() => onPairWithDevice(device)}
                                                 onConnectionParamsUpdate={() => onUpdateDeviceConnectionParams(device)}/>);


        if (deviceDetail && deviceDetail.discoveringChildren) {
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
                                                   onReadCharacteristic={onReadCharacteristic}
                                                   onWriteCharacteristic={onWriteCharacteristic}
                                                   onReadDescriptor={onReadDescriptor}
                                                   onWriteDescriptor={onWriteDescriptor} />
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

DeviceDetailsView.propTypes = {
    device: PropTypes.object.isRequired,
    selected: PropTypes.string,
    onSelectComponent: PropTypes.func.isRequired,
    onToggleAttributeExpanded: PropTypes.func.isRequired,
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
};
