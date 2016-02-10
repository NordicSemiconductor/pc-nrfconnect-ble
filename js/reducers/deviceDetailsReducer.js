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

import { List, Record, Map, OrderedMap } from 'immutable';

import * as DeviceDetailsActions from '../actions/deviceDetailsActions';
import * as AdapterActions from '../actions/adapterActions';
import * as ServerSetupActions from '../actions/serverSetupActions';

import { getInstanceIds, getImmutableService, getImmutableCharacteristic, getImmutableDescriptor } from '../utils/api';
import { getUuidName } from '../utils/uuid_definitions';
import { toHexString } from '../utils/stringUtil';
import { logger } from '../logging';

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
        instanceId: gapInstanceId + '.' + characteristicInstanceIdCounter++,
        name: 'Device Name',
        uuid: '2A00',
        value: [0x6E, 0x52, 0x46, 0x35, 0x31, 0x38, 0x32, 0x32],
        properties: {read: true, write: true},
        children: OrderedMap(),
    });

    const appearanceCharacteristic = getImmutableCharacteristic({
        instanceId: gapInstanceId + '.' + characteristicInstanceIdCounter++,
        name: 'Appearance',
        uuid: '2A01',
        value: [0x00, 0x00],
        properties: {read: true},
        children: OrderedMap(),
    });

    const ppcpCharacteristic = getImmutableCharacteristic({
        instanceId: gapInstanceId + '.' + characteristicInstanceIdCounter++,
        name: 'Peripheral Preferred Connection Parameters',
        uuid: '2A04',
        value: [0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0xFF, 0xFF],
        properties: {read: true},
        children: OrderedMap(),
    });

    const characteristics = {};
    characteristics[deviceNameCharacteristic.instanceId] = deviceNameCharacteristic;
    characteristics[appearanceCharacteristic.instanceId] = appearanceCharacteristic;
    characteristics[ppcpCharacteristic.instanceId] = ppcpCharacteristic;

    return OrderedMap(characteristics);
}

function getInitialLocalServer() {
    let serviceInstanceIdCounter = 0;
    const gapInstanceId = 'local.server' + '.' + serviceInstanceIdCounter++;

    const gapService = getImmutableService({
        instanceId: gapInstanceId,
        name: 'Generic Access',
        uuid: '1800',
        children: getInitialGapServiceCharacteristics(gapInstanceId),
    });
    const gattService = getImmutableService({
        instanceId: 'local.server' + '.' + serviceInstanceIdCounter++,
        name: 'Generic Attribute',
        uuid: '1801',
        children: OrderedMap(),
    });

    localServerChildren = {};
    localServerChildren[gapService.instanceId] = gapService;
    localServerChildren[gattService.instanceId] = gattService;

    return new DeviceDetail({children: OrderedMap(localServerChildren)});
}

const initialState = new InitialState({selectedComponent: null, devices: OrderedMap({'local.server': getInitialLocalServer()})});

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

function discoveredAttributes(state, parent, attributes) {
    const parentStatePath = getNodeStatePath(parent.instanceId);
    state = state.setIn(parentStatePath.concat('discoveringChildren'), false);

    if (!attributes) {
        return state;
    }

    state = state.setIn(parentStatePath.concat('children'), OrderedMap());

    if (attributes.length === 0) {
        return state.setIn(parentStatePath.concat('expanded'), false);
    }

    for (let attribute of attributes) {
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
        .replace('BLE_GATT_STATUS_ATTERR_INSUF_AUTHENTICATION', 'Insufficient authentication')
        .replace('BLE_GATT_STATUS_ATTERR_WRITE_NOT_PERMITTED', 'Write not permitted')
        .replace('BLE_GATT_STATUS_ATTERR_READ_NOT_PERMITTED', 'Read not permitted')
        .replace('BLE_GATT_STATUS_ATTERR_INVALID_ATT_VAL_LENGTH', 'Invalid length')
        .replace('BLE_GATT_STATUS_', '');
}

function completedReadingAttribute(state, attribute, value, error) {
    if (!attribute) {
        return state;
    }

    const attributeStatePath = getNodeStatePath(attribute.instanceId);

    let errorMessage = '';
    if (error) {
        errorMessage = formatErrorMessage(error.message);
    } else {
        const handle = attribute.valueHandle ? attribute.valueHandle : attribute.handle;
        logger.info(`Attribute value read, handle: ${handle}, value (0x): ${toHexString(value)}`);
    }

    state = state.setIn(attributeStatePath.concat('errorMessage'), errorMessage);

    if (!value) {
        return state;
    }

    return state.setIn(attributeStatePath.concat('value'), List(value));
}

function completedWritingAttribute(state, attribute, value, error) {
    if (!attribute) {
        return state;
    }

    const attributeStatePath = getNodeStatePath(attribute.instanceId);

    let errorMessage = '';
    if (error) {
        errorMessage = formatErrorMessage(error.message);
    } else {
        const handle = attribute.valueHandle ? attribute.valueHandle : attribute.handle;
        logger.info(`Attribute value written, handle: ${handle}, value (0x): ${toHexString(value)}`);
    }

    state = state.setIn(attributeStatePath.concat('errorMessage'), errorMessage);

    if (!value) {
        // If value is null the operation failed. Trigger a state change by setting
        // the original value in a new List object.
        const attributeInstanceIds = getInstanceIds(attribute.instanceId);
        const attributeStatePath = getNodeStatePath(attribute.instanceId);

        let immutableAttribute = null;
        if (attributeInstanceIds.descriptor) {
            immutableAttribute = getImmutableDescriptor(attribute);
        } else if (attributeInstanceIds.characteristic) {
            immutableAttribute = getImmutableCharacteristic(attribute);
        }

        return state.setIn(attributeStatePath.concat('value'), immutableAttribute.value);
    } else {
        return state.setIn(attributeStatePath.concat('value'), List(value));
    }
}

function attributeValueChanged(state, attribute, value, error) {
    if (!attribute) {
        return state;
    }

    const attributeStatePath = getNodeStatePath(attribute.instanceId);

    let errorMessage = '';
    if (error) {
        errorMessage = formatErrorMessage(error.message);
    } else {
        const handle = attribute.valueHandle ? attribute.valueHandle : attribute.handle;
        logger.info(`Attribute value changed, handle: ${handle}, value (0x): ${toHexString(value)}`);
    }

    state = state.setIn(attributeStatePath.concat('errorMessage'), errorMessage);

    if (Array.isArray(value)) {
        // Normal value
        state = state.setIn(attributeStatePath.concat('value'), List(value));
    } else {
        // CCCD or other per-connection based values.
        let valueMap = Map();
        for (let connectedDeviceIds in value) {
            valueMap = valueMap.set(connectedDeviceIds, List(value[connectedDeviceIds]));
        }

        state = state.setIn(attributeStatePath.concat('value'), valueMap);
    }

    return state;
}

function appliedServerSetup(state, services) {
    let localDeviceDetails = new DeviceDetail({children: new OrderedMap()});

    for (let service of services) {
        service.name = getUuidName(service.uuid);
        service.children = new OrderedMap();
        let immutableService = getImmutableService(service);

        if (service._factory_characteristics) {
            for (let characteristic of service._factory_characteristics) {
                characteristic.name = getUuidName(characteristic.uuid);
                characteristic.properties = characteristic.properties.properties;
                characteristic.children = new OrderedMap();
                let immutableCharacteristic = getImmutableCharacteristic(characteristic);

                if (characteristic._factory_descriptors) {
                    for (let descriptor of characteristic._factory_descriptors) {
                        descriptor.name = getUuidName(descriptor.uuid);
                        descriptor.children = new OrderedMap();
                        let immutableDescriptor = getImmutableDescriptor(descriptor);
                        immutableCharacteristic = immutableCharacteristic.setIn(['children', descriptor.instanceId], immutableDescriptor);
                    }
                }

                immutableService = immutableService.setIn(['children', characteristic.instanceId], immutableCharacteristic);
            }
        }

        localDeviceDetails = localDeviceDetails.setIn(['children', service.instanceId], immutableService);
    }

    return state.setIn(['devices', 'local.server'], localDeviceDetails);
}

function setAttributeExpanded(state, attribute, value) {
    const expandedStatePath = getNodeStatePath(attribute.instanceId).concat('expanded');
    return state.setIn(expandedStatePath, value);
}

export default function deviceDetails(state = initialState, action) {
    switch (action.type) {
        case DeviceDetailsActions.SELECT_COMPONENT:
            return state.update('selectedComponent', selectedComponent => action.component);
        case DeviceDetailsActions.DISCOVERING_ATTRIBUTES:
            return discoveringAttributes(state, action.parent);
        case DeviceDetailsActions.DISCOVERED_ATTRIBUTES:
            return discoveredAttributes(state, action.parent, action.attributes);
        case DeviceDetailsActions.SET_ATTRIBUTE_EXPANDED:
            return setAttributeExpanded(state, action.attribute, action.value);
        case DeviceDetailsActions.COMPLETED_READING_ATTRIBUTE:
            return completedReadingAttribute(state, action.attribute, action.value, action.error);
        case DeviceDetailsActions.COMPLETED_WRITING_ATTRIBUTE:
            return completedWritingAttribute(state, action.attribute, action.value, action.error);
        case ServerSetupActions.APPLIED_SERVER:
            return appliedServerSetup(state, action.server);
        case AdapterActions.ATTRIBUTE_VALUE_CHANGED:
            return attributeValueChanged(state, action.attribute, action.value);
        case AdapterActions.DEVICE_CONNECTED:
            return state.setIn(['devices', action.device.instanceId], new DeviceDetail());
        case AdapterActions.READING_ATTRIBUTE:
            return state;
        default:
            return state;
    }
}
