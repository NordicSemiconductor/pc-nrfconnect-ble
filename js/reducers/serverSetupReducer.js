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

import { List, Record, OrderedMap } from 'immutable';

import * as ServerSetupActions from '../actions/serverSetupActions';

import { getInstanceIds, getImmutableService, getImmutableCharacteristic, getImmutableDescriptor } from '../utils/api';

const InitialState = Record({
    selectedComponent: null,
    localServer: null,
    tempServer: null,
});

const LocalServer = Record({
    // Add whatever we need here...
    children: null,
});

const deviceInstanceId = 'local.server';
let serviceInstanceIdCounter = 0;
let characteristicInstanceIdCounter = 0;
let descriptorInstanceIdCounter = 0;

function getInitialLocalServer() {
    serviceInstanceIdCounter = 0;
    characteristicInstanceIdCounter = 0;
    descriptorInstanceIdCounter = 0;

    const gapService = getImmutableService({
        instanceId: deviceInstanceId + '.' + serviceInstanceIdCounter++,
        name: 'Generic Access',
        uuid: '1800',
        children: OrderedMap(),
    });
    const gattService = getImmutableService({
        instanceId: deviceInstanceId + '.' + serviceInstanceIdCounter++,
        name: 'Generic Attribute',
        uuid: '1801',
        children: OrderedMap(),
    });

    localServerChildren = {};
    localServerChildren[gapService.instanceId] = gapService;
    localServerChildren[gattService.instanceId] = gattService;

    return new LocalServer({
        children: OrderedMap(localServerChildren),
    });
}

const initialState = new InitialState({
    selectedComponent: null,
    localServer: getInitialLocalServer(),
    tempServer: getInitialLocalServer(),
});

function getNodeStatePath(node) {
    const nodeInstanceIds = getInstanceIds(node.instanceId);
    const nodeStatePath = ['tempServer'];

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

function toggledAttributeExpanded(state, attribute) {
    const attributeStatePath = getNodeStatePath(attribute);
    const previouslyExpanded = state.getIn(attributeStatePath .concat('expanded'));
    return state.setIn(attributeStatePath.concat('expanded'), !previouslyExpanded);
}

function addedNewService(state) {
    const newService = getImmutableService({
        instanceId: deviceInstanceId + '.' + serviceInstanceIdCounter++,
        children: OrderedMap(),
    });
    const newServiceStatePath = getNodeStatePath(newService);

    return state.setIn(newServiceStatePath, newService);
}

function addedNewCharacteristic(state, parent) {
    const newCharacteristic = getImmutableCharacteristic({
        instanceId: parent.instanceId + '.' + characteristicInstanceIdCounter++,
        children: OrderedMap(),
    });
    const newCharacteristicStatePath = getNodeStatePath(newCharacteristic);

    return state.setIn(newCharacteristicStatePath, newCharacteristic);
}

function addedNewDescriptor(state, parent) {
    const newDescriptor = getImmutableDescriptor({
        instanceId: parent.instanceId + '.' + descriptorInstanceIdCounter++,
        children: OrderedMap(),
    });
    const newDescriptorStatePath = getNodeStatePath(newDescriptor);

    return state.setIn(newDescriptorStatePath, newDescriptor);
}

function removedAttribute(state, attribute) {
    const attributeStatePath = getNodeStatePath(attribute);
    return state.deleteIn(attributeStatePath);
}

export default function deviceDetails(state = initialState, action) {
    switch (action.type) {
        case ServerSetupActions.SELECT_COMPONENT:
            return state.update('selectedComponent', selectedComponent => action.component.instanceId);
        case ServerSetupActions.TOGGLED_ATTRIBUTE_EXPANDED:
            return toggledAttributeExpanded(state, action.attribute);
        case ServerSetupActions.ADDED_NEW_SERVICE:
            return addedNewService(state);
        case ServerSetupActions.ADDED_NEW_CHARACTERISTIC:
            return addedNewCharacteristic(state, action.parent);
        case ServerSetupActions.ADDED_NEW_DESCRIPTOR:
            return addedNewDescriptor(state, action.parent);
        case ServerSetupActions.REMOVED_ATTRIBUTE:
            return removedAttribute(action.attribute);
        default:
            return state;
    }
}
