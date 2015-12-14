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
    errors: [],
    selectedComponent: null,
    showingDeleteDialog: false,
    children: null,
});

const deviceInstanceId = 'local.server';
let serviceInstanceIdCounter = 0;
let characteristicInstanceIdCounter = 0;
let descriptorInstanceIdCounter = 0;

function getInitialGapServiceCharacteristics(gapInstanceId) {
    const deviceNameCharacteristic = getImmutableCharacteristic({
        instanceId: gapInstanceId + '.' + characteristicInstanceIdCounter++,
        name: 'Device Name',
        uuid: '2A00',
        value: [0x6E, 0x52, 0x46, 0x35, 0x31, 0x38, 0x32, 0x32],
        properties: {read: true, write: true},
        readPerm: 'open',
        writePerm: 'open',
        maxLength: 20,
        children: OrderedMap(),
    });

    const appearanceCharacteristic = getImmutableCharacteristic({
        instanceId: gapInstanceId + '.' + characteristicInstanceIdCounter++,
        name: 'Appearance',
        uuid: '2A01',
        value: [0x00, 0x00],
        properties: {read: true},
        readPerm: 'open',
        writePerm: 'open',
        maxLength: 20,
        children: OrderedMap(),
    });

    characteristics = {};
    characteristics[deviceNameCharacteristic.instanceId] = deviceNameCharacteristic;
    characteristics[appearanceCharacteristic.instanceId] = appearanceCharacteristic;

    return OrderedMap(characteristics);
}

function getInitialServices() {
    serviceInstanceIdCounter = 0;
    characteristicInstanceIdCounter = 0;
    descriptorInstanceIdCounter = 0;

    const gapInstanceId = deviceInstanceId + '.' + serviceInstanceIdCounter++;

    const gapService = getImmutableService({
        instanceId: gapInstanceId,
        name: 'Generic Access',
        uuid: '1800',
        children: getInitialGapServiceCharacteristics(gapInstanceId),
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
    errors: [],
    selectedComponent: null,
    showingDeleteDialog: false,
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

function toggleAttributeExpanded(state, attribute) {
    const attributeStatePath = getNodeStatePath(attribute.instanceId);
    const previouslyExpanded = state.getIn(attributeStatePath .concat('expanded'));
    return state.setIn(attributeStatePath.concat('expanded'), !previouslyExpanded);
}

function addNewService(state) {
    const newService = getImmutableService({
        instanceId: deviceInstanceId + '.' + serviceInstanceIdCounter++,
        name: 'New Service',
        children: OrderedMap(),
    });
    const newServiceStatePath = getNodeStatePath(newService.instanceId);

    return state.setIn(newServiceStatePath, newService);
}

function addNewCharacteristic(state, parent) {
    const newCharacteristic = getImmutableCharacteristic({
        instanceId: parent.instanceId + '.' + characteristicInstanceIdCounter++,
        name: 'New Characteristic',
        readPerm: 'open',
        writePerm: 'open',
        fixedLength: false,
        maxLength: 20,
        children: OrderedMap(),
    });
    const newCharacteristicStatePath = getNodeStatePath(newCharacteristic.instanceId);

    return state.setIn(newCharacteristicStatePath, newCharacteristic);
}

function addNewDescriptor(state, parent) {
    const newDescriptor = getImmutableDescriptor({
        instanceId: parent.instanceId + '.' + descriptorInstanceIdCounter++,
        name: 'New Descriptor',
        readPerm: 'open',
        writePerm: 'open',
        fixedLength: false,
        maxLength: 20,
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

function removeAttribute(state) {
    const attributeStatePath = getNodeStatePath(state.selectedComponent);
    const changedState = state.merge({selectedComponent: null, showingDeleteDialog: false});
    return changedState.deleteIn(attributeStatePath);
}

function loadSetup(state, setup) {
    if (setup && setup.children && setup.children.length > 0) {
        // TODO: Add/create immutable version
        const services = setup.children;

        for (let service in services) {
            const characteristics = service.children;
            // TODO: Add/create immutable version

            for (let characteristic in characteristics) {
                // TODO: Add/create immutable version
                const descriptors = characteristic.children;

                for(let descriptor in descriptors) {
                    // TODO: Add/create immutable version
                }
            }
        }
    }
}

export default function deviceDetails(state = initialState, action) {
    switch (action.type) {
        case ServerSetupActions.SELECT_COMPONENT:
            return state.set('selectedComponent', action.component.instanceId);
        case ServerSetupActions.TOGGLE_ATTRIBUTE_EXPANDED:
            return toggleAttributeExpanded(state, action.attribute);
        case ServerSetupActions.ADD_NEW_SERVICE:
            return addNewService(state);
        case ServerSetupActions.ADD_NEW_CHARACTERISTIC:
            return addNewCharacteristic(state, action.parent);
        case ServerSetupActions.ADD_NEW_DESCRIPTOR:
            return addNewDescriptor(state, action.parent);
        case ServerSetupActions.CHANGED_ATTRIBUTE:
            return changedAttribute(state, action.attribute);
        case ServerSetupActions.REMOVE_ATTRIBUTE:
            return removeAttribute(state, action.attribute);
        case ServerSetupActions.CLEAR_SERVER:
            return initialState;
        case ServerSetupActions.SHOW_DELETE_DIALOG:
            return state.set('showingDeleteDialog', true);
        case ServerSetupActions.HIDE_DELETE_DIALOG:
            return state.set('showingDeleteDialog', false);
        case ServerSetupActions.SHOW_ERROR_DIALOG:
            return state.set('errors', action.errors);
        case ServerSetupActions.HIDE_ERROR_DIALOG:
            return state.set('errors', '');
        case ServerSetupActions.LOAD:
            return loadSetup(state, action.setup);
        default:
            return state;
    }
}
