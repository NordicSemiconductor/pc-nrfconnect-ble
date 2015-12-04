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

import { List, Record, Map } from 'immutable';

import * as DeviceDetailsActions from '../actions/deviceDetailsActions';
import * as AdapterActions from '../actions/adapterActions';

import { getInstanceIds, getImmutableService, getImmutableCharacteristic, getImmutableDescriptor } from '../utils/api';
import { getUuidName } from '../utils/uuid_definitions';

const InitialState = Record({
    selectedComponent: null,
    devices: Map(),
});

const DeviceDetail = Record({
    discoveringChildren: false,
    children: null,
});

const initialState = new InitialState({selectedComponent: null, devices: Map()});

function getNodeStatePath(node) {
    const nodeInstanceIds = getInstanceIds(node.instanceId);
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
    const parentStatePath = getNodeStatePath(parent);
    return state.setIn(parentStatePath.concat('discoveringChildren'), true);
}

function discoveredAttributes(state, parent, attributes) {
    const parentStatePath = getNodeStatePath(parent);
    state = state.setIn(parentStatePath.concat('discoveringChildren'), false);

    if (!attributes) {
        return state;
    }

    state = state.setIn(parentStatePath.concat('children'), Map());

    for (let attribute of attributes) {
        const attributeInstanceIds = getInstanceIds(attribute.instanceId);
        const attributeStatePath = getNodeStatePath(attribute);
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

    const attributeStatePath = getNodeStatePath(attribute);

    let errorMessage = '';
    if (error) {
        errorMessage = formatErrorMessage(error.message);
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

    const attributeStatePath = getNodeStatePath(attribute);

    let errorMessage = '';
    if (error) {
        errorMessage = formatErrorMessage(error.message);
    }

    state = state.setIn(attributeStatePath.concat('errorMessage'), errorMessage);

    if (!value) {
        // If value is null the operation failed. Trigger a state change by setting
        // the original value in a new List object.
        const attributeInstanceIds = getInstanceIds(attribute.instanceId);
        const attributeStatePath = getNodeStatePath(attribute);

        let immutableAttribute = null;
        if (attributeInstanceIds.descriptor) {
            immutableAttribute = getImmutableDescriptor(attribute);
        } else if (attributeInstanceIds.characteristic) {
            immutableAttribute = getImmutableCharacteristic(attribute);
        }

        return state.setIn(attributeStatePath.concat('value'), List(immutableAttribute.value.toArray()));

    } else {
        return state.setIn(attributeStatePath.concat('value'), List(value));
    }
}

function attributeValueChanged(state, attribute, value) {
    return completedWritingAttribute(state, attribute, value);
}

function toggledAttributeExpanded(state, attribute) {
    const attributeStatePath = getNodeStatePath(attribute);
    const previouslyExpanded = state.getIn(attributeStatePath.concat('expanded'));
    return state.setIn(attributeStatePath.concat('expanded'), !previouslyExpanded);
}

export default function deviceDetails(state = initialState, action) {
    switch (action.type) {
        case DeviceDetailsActions.SELECT_COMPONENT:
            return state.update('selectedComponent', selectedComponent => action.component.instanceId);
        case DeviceDetailsActions.DISCOVERING_ATTRIBUTES:
            return discoveringAttributes(state, action.parent);
        case DeviceDetailsActions.DISCOVERED_ATTRIBUTES:
            return discoveredAttributes(state, action.parent, action.attributes);
        case DeviceDetailsActions.TOGGLED_ATTRIBUTE_EXPANDED:
            return toggledAttributeExpanded(state, action.attribute);
        case DeviceDetailsActions.COMPLETED_READING_ATTRIBUTE:
            return completedReadingAttribute(state, action.attribute, action.value, action.error);
        case DeviceDetailsActions.COMPLETED_WRITING_ATTRIBUTE:
            return completedWritingAttribute(state, action.attribute, action.value, action.error);
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
