/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

import { Record, OrderedMap } from 'immutable';

import * as ServerSetupActions from '../actions/serverSetupActions';
import * as AdapterAction from '../actions/adapterActions';

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

function getInitialGapServiceCharacteristics(gapInstanceId) {
    let characteristicInstanceIdCounter = 0;

    const deviceNameCharacteristic = getImmutableCharacteristic({
        instanceId: gapInstanceId + '.' + characteristicInstanceIdCounter++,
        name: 'Device Name',
        uuid: '2A00',
        value: [0x6E, 0x52, 0x46, 0x35, 0x75], // nRF5x
        properties: { read: true, write: true },
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
        properties: { read: true },
        readPerm: 'open',
        writePerm: 'open',
        maxLength: 20,
        children: OrderedMap(),
    });

    const ppcpCharacteristic = getImmutableCharacteristic({
        instanceId: gapInstanceId + '.' + characteristicInstanceIdCounter++,
        name: 'Peripheral Preferred Connection Parameters',
        uuid: '2A04',
        value: [0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0xFF, 0xFF], // no specific minimum/maximum interval and timeout, 0 slave latency
        properties: { read: true },
        readPerm: 'open',
        writePerm: 'open',
        maxLength: 20,
        children: OrderedMap(),
    });

    let characteristics = OrderedMap();
    characteristics = characteristics.set(deviceNameCharacteristic.instanceId, deviceNameCharacteristic);
    characteristics = characteristics.set(appearanceCharacteristic.instanceId, appearanceCharacteristic);
    characteristics = characteristics.set(ppcpCharacteristic.instanceId, ppcpCharacteristic);

    return characteristics;
}

function getInitialServices() {
    let serviceInstanceIdCounter = 0;
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

    let localServerChildren = OrderedMap();
    localServerChildren = localServerChildren.set(gapService.instanceId, gapService);
    localServerChildren = localServerChildren.set(gattService.instanceId, gattService);

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

function addNewAttribute(state, newAttribute, oldAttribute = undefined) {
    if (oldAttribute) {
        newAttribute = newAttribute.merge(cloneLoadedObject(oldAttribute));
    }

    const newStatePath = getNodeStatePath(newAttribute.instanceId);
    return state.setIn(newStatePath, newAttribute);
}

function createNewService(serviceInstanceId) {
    return getImmutableService({
        instanceId: deviceInstanceId + '.' + serviceInstanceId,
        name: 'New Service',
        children: OrderedMap(),
    });
}

function addNewService(state, oldService = undefined) {
    const serviceInstanceId = getNextAvailableInstanceId(state);
    return addNewAttribute(state, createNewService(serviceInstanceId), oldService);
}

function createNewCharacteristic(parent, characteristicInstanceId) {
    return getImmutableCharacteristic({
        instanceId: parent.instanceId + '.' + characteristicInstanceId,
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
    return addNewAttribute(state, createNewCharacteristic(parent, characteristicInstanceId), oldCharacteristic);
}

function createNewDescriptor(parent, descriptorInstanceId) {
    return getImmutableDescriptor({
        instanceId: parent.instanceId + '.' + descriptorInstanceId,
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
    return addNewAttribute(state, createNewDescriptor(parent, descriptorInstanceId), oldDescriptor);
}

function changedAttribute(state, attribute) {
    const attributeStatePath = getNodeStatePath(attribute.instanceId);

    if (attribute.properties) {
        attribute.properties = getImmutableProperties(attribute.properties);
    }

    return state.mergeIn(attributeStatePath, attribute);
}

function removeAttribute(state) {
    const attributeStatePath = getNodeStatePath(state.selectedComponent);
    const changedState = state.merge({ selectedComponent: null, showingDeleteDialog: false });
    return changedState.deleteIn(attributeStatePath);
}

function cloneLoadedObject(attribute) {
    let retval = {};

    for (let entry in attribute) {
        if (attribute.hasOwnProperty(entry) && entry !== 'children') {
            retval[entry] = attribute[entry];
        }
    }

    if (retval.properties) {
        retval.properties = getImmutableProperties(retval.properties);
    }

    return retval;
}

function getNextAvailableInstanceId(state) {
    let maxId = 0;
    state.get('children').map(service => {
        maxId = Math.max(maxId, parseServiceInstanceId(service));
        service.get('children').map(characteristic => {
            maxId = Math.max(maxId, parseCharacteristicInstanceId(characteristic));
            characteristic.get('children').map(descriptor => {
                maxId = Math.max(maxId, parseDescriptorInstanceId(descriptor));
            });
        });
    });
    return maxId + 1;
}

function parseServiceInstanceId(service) {
    return parseInt(service.get('instanceId').split('.')[2]);
}

function parseCharacteristicInstanceId(characteristic) {
    return parseInt(characteristic.get('instanceId').split('.')[3]);
}

function parseDescriptorInstanceId(descriptor) {
    return parseInt(descriptor.get('instanceId').split('.')[4]);
}

function loadSetup(state, setup) {
    if (setup && setup.children) {
        let newState = new InitialState();
        newState = newState.setIn(['children'], OrderedMap());

        getObjectValues(setup.children).map(service => {
            newState = addNewService(newState, service);
            getObjectValues(service.children).map(characteristic => {
                newState = addNewCharacteristic(newState, service, characteristic);
                getObjectValues(characteristic.children).map(descriptor => {
                    newState = addNewDescriptor(newState, characteristic, descriptor);
                });
            });
        });

        // Only update the children data, everything else that is stored we ignore
        state = state.setIn(['selectedComponent'], null);
        return state.setIn(['children'], newState.children);
    }
}

function getObjectValues(obj) {
    return Object.keys(obj).map(key => {
        return obj[key];
    });
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
            // Adapter reducer keeps track of which adapter has applied servers.
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
        case AdapterAction.ADAPTER_CLOSED:
            return initialState;
        default:
            return state;
    }
}
