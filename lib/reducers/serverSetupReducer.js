/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import { OrderedMap, Record } from 'immutable';
import { logger } from 'pc-nrfconnect-shared';

import * as AdapterAction from '../actions/adapterActions';
import * as ServerSetupActions from '../actions/serverSetupActions';
import {
    getImmutableCharacteristic,
    getImmutableDescriptor,
    getImmutableProperties,
    getImmutableService,
    getInstanceIds,
} from '../utils/api';

const InitialState = Record({
    selectedComponent: null,
    showingDeleteDialog: false,
    showingApplyDialog: false,
    showingClearDialog: false,
    children: null,
});

const deviceInstanceId = 'local.server';

function getInitialGapServiceCharacteristics(gapInstanceId) {
    let characteristicInstanceIdCounter = 0;

    const deviceNameCharacteristic = getImmutableCharacteristic({
        instanceId: `${gapInstanceId}.${(characteristicInstanceIdCounter += 1)}`,
        name: 'Device Name',
        uuid: '2A00',
        value: [0x6e, 0x52, 0x46, 0x35, 0x75], // nRF5x
        properties: { read: true, write: true },
        readPerm: 'open',
        writePerm: 'open',
        maxLength: 20,
        children: OrderedMap(),
    });

    const appearanceCharacteristic = getImmutableCharacteristic({
        instanceId: `${gapInstanceId}.${(characteristicInstanceIdCounter += 1)}`,
        name: 'Appearance',
        uuid: '2A01',
        value: [0x00, 0x00],
        properties: { read: true },
        readPerm: 'open',
        writePerm: 'open',
        maxLength: 20,
        children: OrderedMap(),
    });

    const ppcpCharacteristic = getImmutableCharacteristic({
        instanceId: `${gapInstanceId}.${(characteristicInstanceIdCounter += 1)}`,
        name: 'Peripheral Preferred Connection Parameters',
        uuid: '2A04',
        // no specific minimum/maximum interval and timeout, 0 slave latency
        value: [0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0xff, 0xff],
        properties: { read: true },
        readPerm: 'open',
        writePerm: 'open',
        maxLength: 20,
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

function getInitialServices() {
    let serviceInstanceIdCounter = 0;
    const gapInstanceId = `${deviceInstanceId}.${(serviceInstanceIdCounter += 1)}`;

    const gapService = getImmutableService({
        instanceId: gapInstanceId,
        name: 'Generic Access',
        uuid: '1800',
        children: getInitialGapServiceCharacteristics(gapInstanceId),
    });
    const gattService = getImmutableService({
        instanceId: `${deviceInstanceId}.${(serviceInstanceIdCounter += 1)}`,
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
    const expandedStatePath = getNodeStatePath(attribute.instanceId).concat(
        'expanded'
    );
    return state.setIn(expandedStatePath, value);
}

function cloneLoadedObject(attribute) {
    const retval = {};

    const keys = Object.keys(attribute);
    for (let i = 0; i < keys.length; i += 1) {
        const entry = keys[i];
        if (
            Object.prototype.hasOwnProperty.call(attribute, entry) &&
            entry !== 'children'
        ) {
            retval[entry] = attribute[entry];
        }
    }

    if (retval.properties) {
        retval.properties = getImmutableProperties(retval.properties);
    }

    return retval;
}

function addNewAttribute(state, newAttribute, oldAttribute = undefined) {
    let attr = newAttribute;
    if (oldAttribute) {
        attr = newAttribute.merge(cloneLoadedObject(oldAttribute));
    }

    const newStatePath = getNodeStatePath(attr.instanceId);
    return state.setIn(newStatePath, attr);
}

function createNewService(serviceInstanceId) {
    return getImmutableService({
        instanceId: `${deviceInstanceId}.${serviceInstanceId}`,
        name: 'New Service',
        children: OrderedMap(),
    });
}

function parseServiceInstanceId(service) {
    return parseInt(service.get('instanceId').split('.')[2], 10);
}

function parseCharacteristicInstanceId(characteristic) {
    return parseInt(characteristic.get('instanceId').split('.')[3], 10);
}

function parseDescriptorInstanceId(descriptor) {
    return parseInt(descriptor.get('instanceId').split('.')[4], 10);
}

function getNextAvailableInstanceId(state) {
    let maxId = 0;
    state.get('children').map(service => {
        maxId = Math.max(maxId, parseServiceInstanceId(service));
        return service.get('children').map(characteristic => {
            maxId = Math.max(
                maxId,
                parseCharacteristicInstanceId(characteristic)
            );
            return characteristic.get('children').map(descriptor => {
                maxId = Math.max(maxId, parseDescriptorInstanceId(descriptor));
                return undefined;
            });
        });
    });
    return maxId + 1;
}

function addNewService(state, oldService = undefined) {
    const serviceInstanceId = getNextAvailableInstanceId(state);
    return addNewAttribute(
        state,
        createNewService(serviceInstanceId),
        oldService
    );
}

function createNewCharacteristic(parent, characteristicInstanceId) {
    return getImmutableCharacteristic({
        instanceId: `${parent.instanceId}.${characteristicInstanceId}`,
        name: 'New Characteristic',
        readPerm: 'open',
        writePerm: 'open',
        fixedLength: false,
        maxLength: 20,
        children: OrderedMap(),
    });
}

function addNewCharacteristic(state, parent, oldCharacteristic = undefined) {
    const characteristicInstanceId = getNextAvailableInstanceId(state);
    return addNewAttribute(
        state,
        createNewCharacteristic(parent, characteristicInstanceId),
        oldCharacteristic
    );
}

function createNewDescriptor(parent, descriptorInstanceId) {
    return getImmutableDescriptor({
        instanceId: `${parent.instanceId}.${descriptorInstanceId}`,
        name: 'New Descriptor',
        readPerm: 'open',
        writePerm: 'open',
        fixedLength: false,
        maxLength: 20,
        children: OrderedMap(),
    });
}

function addNewDescriptor(state, parent, oldDescriptor = undefined) {
    const descriptorInstanceId = getNextAvailableInstanceId(state);
    return addNewAttribute(
        state,
        createNewDescriptor(parent, descriptorInstanceId),
        oldDescriptor
    );
}

function changedAttribute(state, attribute) {
    const attributeStatePath = getNodeStatePath(attribute.instanceId);

    const attr = attribute;
    if (attr.properties) {
        attr.properties = getImmutableProperties(attr.properties);
    }

    return state.mergeIn(attributeStatePath, attr);
}

function removeAttribute(state) {
    const attributeStatePath = getNodeStatePath(state.selectedComponent);
    const changedState = state.merge({
        selectedComponent: null,
        showingDeleteDialog: false,
    });
    return changedState.deleteIn(attributeStatePath);
}

function getObjectValues(obj) {
    return Object.keys(obj).map(key => obj[key]);
}

function loadSetup(state, setup) {
    if (setup && setup.children) {
        let newState = new InitialState();
        newState = newState.setIn(['children'], OrderedMap());

        getObjectValues(setup.children).map(service => {
            newState = addNewService(newState, service);
            return getObjectValues(service.children).map(characteristic => {
                newState = addNewCharacteristic(
                    newState,
                    service,
                    characteristic
                );
                return getObjectValues(characteristic.children).map(
                    descriptor => {
                        newState = addNewDescriptor(
                            newState,
                            characteristic,
                            descriptor
                        );
                        return undefined;
                    }
                );
            });
        });

        // Only update the children data, everything else that is stored we ignore
        return state
            .setIn(['selectedComponent'], null)
            .setIn(['children'], newState.children);
    }
    return state;
}

export default function serverSetup(state = initialState, action) {
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
            // Adapter reducer keeps track of which adapter has applied servers.
            logger.info('Server setup was applied');
            return state.set('showingApplyDialog', false);
        case ServerSetupActions.SHOW_APPLY_DIALOG:
            return state.set('showingApplyDialog', true);
        case ServerSetupActions.HIDE_APPLY_DIALOG:
            return state.set('showingApplyDialog', false);
        case ServerSetupActions.SHOW_DELETE_DIALOG:
            return state.set('showingDeleteDialog', true);
        case ServerSetupActions.HIDE_DELETE_DIALOG:
            return state.set('showingDeleteDialog', false);
        case ServerSetupActions.SHOW_CLEAR_DIALOG:
            return state.set('showingClearDialog', true);
        case ServerSetupActions.HIDE_CLEAR_DIALOG:
            return state.set('showingClearDialog', false);
        case ServerSetupActions.LOAD:
            return loadSetup(state, action.setup);
        case AdapterAction.ADAPTER_CLOSED:
            return initialState;
        default:
            return state;
    }
}
