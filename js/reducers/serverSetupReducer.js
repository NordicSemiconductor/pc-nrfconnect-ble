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

import { getInstanceIds, getImmutableService, getImmutableCharacteristic, getImmutableDescriptor, getImmutableProperties } from '../utils/api';

const InitialState = Record({
    selectedComponent: null,
    showDeleteDialog: false,
    children: null,
});

const deviceInstanceId = 'local.server';
let serviceInstanceIdCounter = 0;
let characteristicInstanceIdCounter = 0;
let descriptorInstanceIdCounter = 0;

function getInitialServices() {
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

    return OrderedMap(localServerChildren);
}

const initialState = new InitialState({
    selectedComponent: null,
    showDeleteDialog: false,
    children: getInitialServices(),
});

function getNodeStatePath(nodeInstanceId) {
    const nodeInstanceIds = getInstanceIds(nodeInstanceId);
    const nodeStatePath = [];

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
    const attributeStatePath = getNodeStatePath(attribute.instanceId);
    const previouslyExpanded = state.getIn(attributeStatePath .concat('expanded'));
    return state.setIn(attributeStatePath.concat('expanded'), !previouslyExpanded);
}

function addedNewService(state) {
    const newService = getImmutableService({
        instanceId: deviceInstanceId + '.' + serviceInstanceIdCounter++,
        name: 'New Service',
        children: OrderedMap(),
    });
    const newServiceStatePath = getNodeStatePath(newService.instanceId);

    return state.setIn(newServiceStatePath, newService);
}

function addedNewCharacteristic(state, parent) {
    const newCharacteristic = getImmutableCharacteristic({
        instanceId: parent.instanceId + '.' + characteristicInstanceIdCounter++,
        name: 'New Characteristic',
        security: 'open',
        children: OrderedMap(),
    });
    const newCharacteristicStatePath = getNodeStatePath(newCharacteristic.instanceId);

    return state.setIn(newCharacteristicStatePath, newCharacteristic);
}

function addedNewDescriptor(state, parent) {
    const newDescriptor = getImmutableDescriptor({
        instanceId: parent.instanceId + '.' + descriptorInstanceIdCounter++,
        name: 'New Descriptor',
        children: OrderedMap(),
    });
    const newDescriptorStatePath = getNodeStatePath(newDescriptor.instanceId);

    return state.setIn(newDescriptorStatePath, newDescriptor);
}

function changedAttribute(state, attribute) {
    const instanceIds = getInstanceIds(attribute.instanceId);
    const attributeStatePath = getNodeStatePath(attribute.instanceId);

    if (attribute.properties) {
        attribute.properties = getImmutableProperties(attribute.properties);
    }

    return state.mergeIn(attributeStatePath, attribute);
}

function removedAttribute(state) {
    const attributeStatePath = getNodeStatePath(state.selectedComponent);
    const changedState = state.merge({selectedComponent: null, showDeleteDialog: false});
    return changedState.deleteIn(attributeStatePath);
}

export default function deviceDetails(state = initialState, action) {
    switch (action.type) {
        case ServerSetupActions.SELECT_COMPONENT:
            return state.set('selectedComponent', action.component.instanceId);
        case ServerSetupActions.TOGGLED_ATTRIBUTE_EXPANDED:
            return toggledAttributeExpanded(state, action.attribute);
        case ServerSetupActions.ADDED_NEW_SERVICE:
            return addedNewService(state);
        case ServerSetupActions.ADDED_NEW_CHARACTERISTIC:
            return addedNewCharacteristic(state, action.parent);
        case ServerSetupActions.ADDED_NEW_DESCRIPTOR:
            return addedNewDescriptor(state, action.parent);
        case ServerSetupActions.CHANGED_ATTRIBUTE:
            return changedAttribute(state, action.attribute);
        case ServerSetupActions.REMOVED_ATTRIBUTE:
            return removedAttribute(state, action.attribute);
        case ServerSetupActions.SHOW_DELETE_DIALOG:
            return state.set('showDeleteDialog', true);
        case ServerSetupActions.HIDE_DELETE_DIALOG:
            return state.set('showDeleteDialog', false);
        default:
            return state;
    }
}
