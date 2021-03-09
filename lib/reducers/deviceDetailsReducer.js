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

/* eslint no-underscore-dangle: off */

'use strict';

import { List, Map, OrderedMap, Record } from 'immutable';
import { logger } from 'nrfconnect/core';

import * as AdapterActions from '../actions/adapterActions';
import * as DeviceDetailsActions from '../actions/deviceDetailsActions';
import * as ServerSetupActions from '../actions/serverSetupActions';
import {
    getImmutableCharacteristic,
    getImmutableDescriptor,
    getImmutableService,
    getInstanceIds,
} from '../utils/api';
import { toHexString } from '../utils/stringUtil';
import { getUuidName } from '../utils/uuid_definitions';

const InitialState = Record({
    selectedComponent: null,
    devices: OrderedMap(),
});

const DeviceDetail = Record({
    discoveringChildren: false,
    children: null,
});

function getInitialGapServiceCharacteristics(gapInstanceId) {
    let characteristicInstanceIdCounter = 0;

    const deviceNameCharacteristic = getImmutableCharacteristic({
        instanceId: `${gapInstanceId}.${(characteristicInstanceIdCounter += 1)}`,
        name: 'Device Name',
        uuid: '2A00',
        value: [0x6e, 0x52, 0x46, 0x35, 0x75], // nRF5x
        properties: { read: true, write: false },
        children: OrderedMap(),
    });

    const appearanceCharacteristic = getImmutableCharacteristic({
        instanceId: `${gapInstanceId}.${(characteristicInstanceIdCounter += 1)}`,
        name: 'Appearance',
        uuid: '2A01',
        value: [0x00, 0x00],
        properties: { read: true },
        children: OrderedMap(),
    });

    const ppcpCharacteristic = getImmutableCharacteristic({
        instanceId: `${gapInstanceId}.${(characteristicInstanceIdCounter += 1)}`,
        name: 'Peripheral Preferred Connection Parameters',
        uuid: '2A04',
        // no specific minimum/maximum interval and timeout, 0 slave latency
        value: [0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0xff, 0xff],
        properties: { read: true },
        children: OrderedMap(),
    });

    let characteristics = OrderedMap();
    characteristics = characteristics.set(
        deviceNameCharacteristic.instanceId,
        deviceNameCharacteristic
    );
    characteristics = characteristics.set(
        appearanceCharacteristic.instanceId,
        appearanceCharacteristic
    );
    characteristics = characteristics.set(
        ppcpCharacteristic.instanceId,
        ppcpCharacteristic
    );

    return characteristics;
}

function getInitialLocalServer() {
    let serviceInstanceIdCounter = 0;
    const gapInstanceId = `local.server.${(serviceInstanceIdCounter += 1)}`;

    const gapService = getImmutableService({
        instanceId: gapInstanceId,
        name: 'Generic Access',
        uuid: '1800',
        children: getInitialGapServiceCharacteristics(gapInstanceId),
    });
    const gattService = getImmutableService({
        instanceId: `local.server.${(serviceInstanceIdCounter += 1)}`,
        name: 'Generic Attribute',
        uuid: '1801',
        children: OrderedMap(),
    });

    let localServerChildren = OrderedMap();
    localServerChildren = localServerChildren.set(
        gapService.instanceId,
        gapService
    );
    localServerChildren = localServerChildren.set(
        gattService.instanceId,
        gattService
    );

    return new DeviceDetail({ children: localServerChildren });
}

const initialState = new InitialState({
    selectedComponent: null,
    devices: OrderedMap({ 'local.server': getInitialLocalServer() }),
});

function getNodeStatePath(instanceId) {
    const nodeInstanceIds = getInstanceIds(instanceId);
    const nodeStatePath = ['devices', nodeInstanceIds.device];

    if (nodeInstanceIds.service) {
        nodeStatePath.push('children', nodeInstanceIds.service);
    }

    if (nodeInstanceIds.characteristic) {
        nodeStatePath.push('children', nodeInstanceIds.characteristic);
    }

    if (nodeInstanceIds.descriptor) {
        nodeStatePath.push('children', nodeInstanceIds.descriptor);
    }

    return nodeStatePath;
}

function discoveringAttributes(state, parent) {
    const parentStatePath = getNodeStatePath(parent.instanceId);
    return state.setIn(parentStatePath.concat('discoveringChildren'), true);
}

function discoveredAttributes(oldState, parent, attributes) {
    let state = oldState;
    const parentStatePath = getNodeStatePath(parent.instanceId);
    state = state.setIn(parentStatePath.concat('discoveringChildren'), false);

    if (!attributes) {
        return state;
    }

    state = state.setIn(parentStatePath.concat('children'), OrderedMap());

    if (attributes.length === 0) {
        return state.setIn(parentStatePath.concat('expanded'), false);
    }

    for (let i = 0; i < attributes.length; i += 1) {
        const attribute = attributes[i];
        const attributeInstanceIds = getInstanceIds(attribute.instanceId);
        const attributeStatePath = getNodeStatePath(attribute.instanceId);
        let immutableAttribute = null;
        attribute.name = getUuidName(attribute.uuid);

        if (attributeInstanceIds.descriptor) {
            immutableAttribute = getImmutableDescriptor(attribute);
        } else if (attributeInstanceIds.characteristic) {
            immutableAttribute = getImmutableCharacteristic(attribute);
        } else if (attributeInstanceIds.service) {
            immutableAttribute = getImmutableService(attribute);
        }

        state = state.setIn(attributeStatePath, immutableAttribute);
    }

    return state;
}

function formatErrorMessage(message) {
    if (typeof message !== 'string') {
        return '';
    }

    return message
        .replace(
            'BLE_GATT_STATUS_ATTERR_INSUF_AUTHENTICATION',
            'Insufficient authentication'
        )
        .replace(
            'BLE_GATT_STATUS_ATTERR_WRITE_NOT_PERMITTED',
            'Write not permitted'
        )
        .replace(
            'BLE_GATT_STATUS_ATTERR_READ_NOT_PERMITTED',
            'Read not permitted'
        )
        .replace(
            'BLE_GATT_STATUS_ATTERR_INVALID_ATT_VAL_LENGTH',
            'Invalid length'
        )
        .replace('BLE_GATT_STATUS_', '');
}

function completedReadingAttribute(oldState, attribute, value, error) {
    let state = oldState;
    if (!attribute) {
        return state;
    }

    const attributeStatePath = getNodeStatePath(attribute.instanceId);

    let errorMessage = '';
    if (error) {
        errorMessage = formatErrorMessage(error.message);
    } else {
        const handle = attribute.valueHandle
            ? attribute.valueHandle
            : attribute.handle;
        logger.info(
            `Attribute value read, handle: 0x${toHexString(
                handle
            )}, value (0x): ${toHexString(value)}`
        );
    }

    state = state.setIn(
        attributeStatePath.concat('errorMessage'),
        errorMessage
    );

    if (!value) {
        return state;
    }

    return state.setIn(attributeStatePath.concat('value'), List(value));
}

function completedWritingAttribute(oldState, attribute, value, error) {
    let state = oldState;
    if (!attribute) {
        return state;
    }

    const attributeStatePath = getNodeStatePath(attribute.instanceId);

    let errorMessage = '';
    if (error) {
        errorMessage = formatErrorMessage(error.message);
    } else {
        const handle = attribute.valueHandle
            ? attribute.valueHandle
            : attribute.handle;
        logger.info(
            `Attribute value written, handle: 0x${toHexString(
                handle
            )}, value (0x): ${toHexString(value)}`
        );
    }

    state = state.setIn(
        attributeStatePath.concat('errorMessage'),
        errorMessage
    );

    if (!value) {
        // If value is null the operation failed. Trigger a state change by setting
        // the original value in a new List object.
        const attributeInstanceIds = getInstanceIds(attribute.instanceId);

        let immutableAttribute = null;
        if (attributeInstanceIds.descriptor) {
            immutableAttribute = getImmutableDescriptor(attribute);
        } else if (attributeInstanceIds.characteristic) {
            immutableAttribute = getImmutableCharacteristic(attribute);
        }

        return state.setIn(
            attributeStatePath.concat('value'),
            immutableAttribute.value
        );
    }
    return state.setIn(attributeStatePath.concat('value'), List(value));
}

function attributeValueChanged(oldState, attribute, value, error) {
    let state = oldState;
    if (!attribute) {
        return state;
    }

    const attributeStatePath = getNodeStatePath(attribute.instanceId);
    if (!state.hasIn(attributeStatePath)) {
        return state;
    }

    let errorMessage = '';
    if (error) {
        errorMessage = formatErrorMessage(error.message);
    }

    state = state.setIn(
        attributeStatePath.concat('errorMessage'),
        errorMessage
    );

    if (Array.isArray(value)) {
        // Normal value
        state = state.setIn(attributeStatePath.concat('value'), List(value));
    } else {
        // CCCD or other per-connection based values.
        let valueMap = Map();
        const valueKeys = Object.keys(value);
        for (let i = 0; i < valueKeys.length; i += 1) {
            const connectedDeviceIds = valueKeys[i];
            valueMap = valueMap.set(
                connectedDeviceIds,
                List(value[connectedDeviceIds])
            );
        }

        state = state.setIn(attributeStatePath.concat('value'), valueMap);
    }

    return state;
}

function multiAttributeValuteChange(oldstate, attributeValueArray) {
    // Reducing the array of attributes by calling attributeValueChanged
    // and feeding the resulting state into the next call.
    const reducer = (accumulatorState, currentValue) => {
        const { attribute, value } = currentValue;
        return attributeValueChanged(accumulatorState, attribute, value);
    };

    return attributeValueArray.reduce(reducer, oldstate);
}

function appliedServerSetup(state, services) {
    let localDeviceDetails = new DeviceDetail({ children: new OrderedMap() });

    for (let i = 0; i < services.length; i += 1) {
        const service = services[i];
        service.name = getUuidName(service.uuid);
        service.children = new OrderedMap();
        let immutableService = getImmutableService(service);

        if (service._factory_characteristics) {
            for (
                let j = 0;
                j < service._factory_characteristics.length;
                j += 1
            ) {
                const characteristic = service._factory_characteristics[j];
                characteristic.name = getUuidName(characteristic.uuid);
                characteristic.children = new OrderedMap();
                let immutableCharacteristic = getImmutableCharacteristic(
                    characteristic
                );

                if (characteristic._factory_descriptors) {
                    for (
                        let k = 0;
                        k < characteristic._factory_descriptors.length;
                        k += 1
                    ) {
                        const descriptor =
                            characteristic._factory_descriptors[k];
                        descriptor.name = getUuidName(descriptor.uuid);
                        descriptor.children = new OrderedMap();
                        const immutableDescriptor = getImmutableDescriptor(
                            descriptor
                        );
                        immutableCharacteristic = immutableCharacteristic.setIn(
                            ['children', descriptor.instanceId],
                            immutableDescriptor
                        );
                    }
                }

                immutableService = immutableService.setIn(
                    ['children', characteristic.instanceId],
                    immutableCharacteristic
                );
            }
        }

        localDeviceDetails = localDeviceDetails.setIn(
            ['children', service.instanceId],
            immutableService
        );
    }

    return state.setIn(['devices', 'local.server'], localDeviceDetails);
}

function setAttributeExpanded(state, attribute, value) {
    const expandedStatePath = getNodeStatePath(attribute.instanceId).concat(
        'expanded'
    );
    return state.setIn(expandedStatePath, value);
}

export default function deviceDetails(state = initialState, action) {
    switch (action.type) {
        case DeviceDetailsActions.SELECT_COMPONENT:
            return state.update('selectedComponent', () => action.component);
        case DeviceDetailsActions.DISCOVERING_ATTRIBUTES:
            return discoveringAttributes(state, action.parent);
        case DeviceDetailsActions.DISCOVERED_ATTRIBUTES:
            return discoveredAttributes(
                state,
                action.parent,
                action.attributes
            );
        case DeviceDetailsActions.SET_ATTRIBUTE_EXPANDED:
            return setAttributeExpanded(state, action.attribute, action.value);
        case DeviceDetailsActions.COMPLETED_READING_ATTRIBUTE:
            return completedReadingAttribute(
                state,
                action.attribute,
                action.value,
                action.error
            );
        case DeviceDetailsActions.COMPLETED_WRITING_ATTRIBUTE:
            return completedWritingAttribute(
                state,
                action.attribute,
                action.value,
                action.error
            );
        case ServerSetupActions.APPLIED_SERVER:
            return appliedServerSetup(state, action.services);
        case AdapterActions.ATTRIBUTE_VALUE_CHANGED:
            return attributeValueChanged(state, action.attribute, action.value);
        case AdapterActions.MULTI_ATTRIBUTE_VALUE_CHANGED:
            return multiAttributeValuteChange(
                state,
                action.attributeValueArray
            );
        case AdapterActions.DEVICE_CONNECTED:
            return state.setIn(
                ['devices', action.device.instanceId],
                new DeviceDetail()
            );
        case AdapterActions.ADAPTER_CLOSED:
        case AdapterActions.ADAPTER_RESET_PERFORMED:
            return initialState;
        default:
            return state;
    }
}
