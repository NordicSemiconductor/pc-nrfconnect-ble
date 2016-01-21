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

import { Record, OrderedMap } from 'immutable';

import * as ServerSetupActions from '../actions/serverSetupActions';

import { getInstanceIds, getImmutableService, getImmutableCharacteristic, getImmutableDescriptor, getImmutableProperties } from '../utils/api';
import { logger } from '../logging';

const InitialState = Record({
    selectedComponent: null,
    showingDeleteDialog: false,
    showingClearDialog: false,
    showingDiscardDialog: false,
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

    const ppcpCharacteristic = getImmutableCharacteristic({
        instanceId: gapInstanceId + '.' + characteristicInstanceIdCounter++,
        name: 'Peripheral Preferred Connection Parameters',
        uuid: '2A04',
        value: [0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0xFF, 0xFF],
        properties: {read: true},
        readPerm: 'open',
        writePerm: 'open',
        maxLength: 20,
        children: OrderedMap(),
    });

    const characteristics = {};
    characteristics[deviceNameCharacteristic.instanceId] = deviceNameCharacteristic;
    characteristics[appearanceCharacteristic.instanceId] = appearanceCharacteristic;
    characteristics[ppcpCharacteristic.instanceId] = ppcpCharacteristic;

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

    let localServerChildren = {};
    localServerChildren[gapService.instanceId] = gapService;
    localServerChildren[gattService.instanceId] = gattService;

    return OrderedMap(localServerChildren);
}

const initialState = new InitialState({
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

function setAttributeExpanded(state, attribute, value) {
    const expandedStatePath = getNodeStatePath(attribute.instanceId).concat('expanded');
    return state.setIn(expandedStatePath, value);
}

function createNewService() {
    return getImmutableService({
        instanceId: deviceInstanceId + '.' + serviceInstanceIdCounter++,
        name: 'New Service',
        children: OrderedMap(),
    });
}

function addNewService(state) {
    const newService = createNewService();
    const newServiceStatePath = getNodeStatePath(newService.instanceId);

    return state.setIn(newServiceStatePath, newService);
}

function createNewCharacteristic(parent) {
    return getImmutableCharacteristic({
        instanceId: parent.instanceId + '.' + characteristicInstanceIdCounter++,
        name: 'New Characteristic',
        readPerm: 'open',
        writePerm: 'open',
        fixedLength: false,
        maxLength: 20,
        children: OrderedMap(),
    });
}

function addNewCharacteristic(state, parent) {
    const newCharacteristic = createNewCharacteristic(parent);
    const newCharacteristicStatePath = getNodeStatePath(newCharacteristic.instanceId);

    return state.setIn(newCharacteristicStatePath, newCharacteristic);
}

function createNewDescriptor(parent) {
    return getImmutableDescriptor({
        instanceId: parent.instanceId + '.' + descriptorInstanceIdCounter++,
        name: 'New Descriptor',
        readPerm: 'open',
        writePerm: 'open',
        fixedLength: false,
        maxLength: 20,
        children: OrderedMap(),
    });
}

function addNewDescriptor(state, parent) {
    const newDescriptor = createNewDescriptor(parent);
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

function cloneObjectV1(service) {
    let retval = {};

    for (let entry in service) {
        if (service.hasOwnProperty(entry) && entry !== 'children' && entry !== 'instanceId') {
            retval[entry] = service[entry];
        }
    }

    if (retval.properties) {
        retval.properties = getImmutableProperties(retval.properties);
    }

    return retval;
}

function loadSetup(state, setup) {
    if (setup && setup.children) {
        const services = Object.keys(setup.children);

        let newState = new InitialState();
        newState = newState.setIn(['children'], OrderedMap());

        for (let service of services) {
            const _service = setup.children[service];
            let newService = createNewService();

            newService = newService.merge(cloneObjectV1(_service));
            newState = newState.setIn(getNodeStatePath(newService.instanceId), newService);

            const characteristics = Object.keys(_service.children);

            for (let characteristic of characteristics) {
                const _characteristic = _service.children[characteristic];

                const descriptors = Object.keys(_characteristic.children);
                let newCharacteristic = createNewCharacteristic(newService);
                newCharacteristic = newCharacteristic.merge(cloneObjectV1(_characteristic));
                newState = newState.setIn(getNodeStatePath(newCharacteristic.instanceId), newCharacteristic);

                for (let descriptor of descriptors) {
                    const _descriptor = _characteristic.children[descriptor];
                    let newDescriptor = createNewDescriptor(newCharacteristic);
                    newDescriptor = newDescriptor.merge(cloneObjectV1(_descriptor));
                    newState = newState.setIn(getNodeStatePath(newDescriptor.instanceId), newDescriptor);
                }
            }
        }

        // Only update the children data, everything else that is stored we ignore
        state = state.setIn(['selectedComponent'], null);
        return state.setIn(['children'], newState.children);
    }
}

export default function deviceDetails(state = initialState, action) {
    switch (action.type) {
        case ServerSetupActions.SELECT_COMPONENT:
            return state.set('selectedComponent', action.component);
        case ServerSetupActions.SET_ATTRIBUTE_EXPANDED:
            return setAttributeExpanded(state, action.attribute, action.value);
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
            logger.info('Server setup was cleared');
            return initialState;
        case ServerSetupActions.APPLIED_SERVER:
            logger.info('Server setup was applied');
            return state;
        case ServerSetupActions.SHOW_DELETE_DIALOG:
            return state.set('showingDeleteDialog', true);
        case ServerSetupActions.HIDE_DELETE_DIALOG:
            return state.set('showingDeleteDialog', false);
        case ServerSetupActions.SHOW_CLEAR_DIALOG:
            return state.set('showingClearDialog', true);
        case ServerSetupActions.HIDE_CLEAR_DIALOG:
            return state.set('showingClearDialog', false);
        case ServerSetupActions.SHOW_DISCARD_DIALOG:
            return state.set('showingDiscardDialog', true);
        case ServerSetupActions.HIDE_DISCARD_DIALOG:
            return state.set('showingDiscardDialog', false);
        case ServerSetupActions.LOAD:
            return loadSetup(state, action.setup);
        default:
            return state;
    }
}
