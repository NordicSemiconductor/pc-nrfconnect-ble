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

import * as BLEEventActions from '../actions/bleEventActions';
import * as AdapterActions from '../actions/adapterActions';

import { BLEEventState, BLEEventType } from '../actions/common';

import * as apiHelper from '../utils/api';
import { getImmutableSecurityParameters } from '../reducers/securityReducer';

import { Record, List, Map } from 'immutable';

const InitialState = Record({
    visible: false,
    events: Map(),
    selectedEventId: -1,
});

const initialState = new InitialState();

const Event = Record({
    id: null,
    type: null,
    device: null,
    requestedConnectionParams: null,
    pairingParameters: null,
    authKeyParams: null,
    ownOobData: null,
    state: BLEEventState.UNKNOWN,
    receiveKeypressEnabled: false,
    keypressStartReceived: false,
    keypressEndReceived: false,
    sendKeypressEnabled: false,
    keypressStartSent: false,
    keypressEndSent: false,
    keypressCount: 0,
});

const ConnectionParameters = Record({
    connectionSupervisionTimeout: 0,
    maxConnectionInterval: 0,
    minConnectionInterval: 0,
    slaveLatency: 0,
});

const PairingParameters = Record({
    ioCapabilities: 'keyboardAndDisplay',
    authentication: 'noAuth',
    bond: false,
});

const AuthKeyParameters = Record({
    passkey: '',
});

// Module local variable that is used to generate a unique ID for all events that are
// added by the user or by incoming connection parameter update requests.
let eventIndex = 0;

function resetSelectedEventIdAndEventIndex(state)
{
    eventIndex = 0;
    return state.set('selectedEventId', -1);
}

function showDialog(state, visible) {
    return state.set('visible', visible);
}

function clearAllEvents(state) {
    state = resetSelectedEventIdAndEventIndex(state);
    return state.set('events', state.events.clear());
}

function connectionUpdateParamRequest(state, device, requestedConnectionParams) {
    const connectionParams = new ConnectionParameters({
        connectionSupervisionTimeout: requestedConnectionParams.connectionSupervisionTimeout,
        maxConnectionInterval: requestedConnectionParams.maxConnectionInterval,
        minConnectionInterval: requestedConnectionParams.minConnectionInterval,
        slaveLatency: requestedConnectionParams.slaveLatency,
    });

    const type = device.role === 'central' ? BLEEventType.PEER_CENTRAL_INITIATED_CONNECTION_UPDATE
        : BLEEventType.PEER_PERIPHERAL_INITIATED_CONNECTION_UPDATE;

    const event = new Event({
        type,
        device: apiHelper.getImmutableDevice(device),
        requestedConnectionParams: connectionParams,
        id: eventIndex,
        state: BLEEventState.INDETERMINATE,
    });

    let newState = state.setIn(['events', eventIndex], event);
    newState = newState.set('selectedEventId', eventIndex);
    newState = newState.set('visible', true);
    eventIndex++;

    return newState;
}

function updateEventStatus(state, eventId, eventState) {
    if (eventId < 0) {
        return state;
    }

    state = state.setIn(['events', eventId, 'state'], eventState);
    return state;
}

function selectEventId(state, selectedEventId) {
    return state.set('selectedEventId', selectedEventId);
}

function passkeyKeypressReceived(state, device, keypressType) {
    const events = state.events.filter((value, index) =>
        (value.state === BLEEventState.INDETERMINATE) &&
        (value.device.instanceId === device.instanceId));

    events.forEach(event => {
        if (event.type === BLEEventType.PASSKEY_DISPLAY && event.receiveKeypressEnabled === true) {
            state = updateEventKeypressCount(state, event.id, keypressType);
        }
    });

    return state;
}

function updateEventKeypressCount(state, eventId, keypressType) {
    if (eventId < 0) {
        return state;
    }

    let keypressCount = state.getIn(['events', eventId, 'keypressCount']);

    switch(keypressType) {
        case 'BLE_GAP_KP_NOT_TYPE_PASSKEY_DIGIT_IN':
            keypressCount++;
            break;
        case 'BLE_GAP_KP_NOT_TYPE_PASSKEY_DIGIT_OUT':
            keypressCount--;
            break;
        case 'BLE_GAP_KP_NOT_TYPE_PASSKEY_CLEAR':
            keypressCount = 0;
            break;
        case 'BLE_GAP_KP_NOT_TYPE_PASSKEY_START':
            state = state.setIn(['events', eventId, 'keypressStartReceived'], true);
            break;
        case 'BLE_GAP_KP_NOT_TYPE_PASSKEY_END':
            state = state.setIn(['events', eventId, 'keypressEndReceived'], true);
            break;
    }

    return state.setIn(['events', eventId, 'keypressCount'], keypressCount);
}

function deviceDisconnected(state, device) {
    // Find given device event that has state INDETERMINATE and set it to DISCONNECTED
    const events = state.events.filter((value, index) =>
        (value.state === BLEEventState.INDETERMINATE) &&
        (value.device.instanceId === device.instanceId));

    events.forEach(event => {
        state = updateEventStatus(state, event.id, BLEEventState.DISCONNECTED);
    });

    return state;
}

function ignoreEvent(state, eventId) {
    return state.setIn(['events', eventId, 'state'], BLEEventState.IGNORED);
}

function acceptEvent(state, eventId) {
    return state.setIn(['events', eventId, 'state'], BLEEventState.SUCCESS);
}

function removeEvent(state, eventId) {
    if (state.selectedEventId === eventId) {
        state = state.set('selectedEventId', -1);
    }

    return state.deleteIn(['events', eventId]);
}

function createUserInitiatedConnParamsUpdateEvent(state, device) {
    // Information regarding BLE parameters are taken from:
    // https://developer.bluetooth.org/gatt/characteristics/Pages/CharacteristicViewer.aspx?u=org.bluetooth.characteristic.gap.peripheral_preferred_connection_parameters.xml
    const initialConnectionParams = new ConnectionParameters({
        connectionSupervisionTimeout: device.connectionSupervisionTimeout,
        maxConnectionInterval: device.maxConnectionInterval,
        minConnectionInterval: device.minConnectionInterval,
        slaveLatency: device.slaveLatency,
    });

    const event = new Event({
        type: BLEEventType.USER_INITIATED_CONNECTION_UPDATE,
        device: apiHelper.getImmutableDevice(device),
        requestedConnectionParams: initialConnectionParams,
        id: eventIndex,
        state: BLEEventState.INDETERMINATE,
    });

    let newState = state.setIn(['events', eventIndex], event);
    newState = newState.set('selectedEventId', eventIndex);
    newState = newState.set('visible', true);
    eventIndex++;

    return newState;
}

function securityRequest(state, device, secParams) {
    const immutableSecParams = getImmutableSecurityParameters(secParams);

    const event = new Event({
        type: BLEEventType.PEER_INITIATED_PAIRING,
        device: apiHelper.getImmutableDevice(device),
        pairingParameters: immutableSecParams,
        id: eventIndex,
        state: BLEEventState.INDETERMINATE,
    });

    let newState = state.setIn(['events', eventIndex], event);
    newState = newState.set('selectedEventId', eventIndex);
    newState = newState.set('visible', true);
    eventIndex++;

    return newState;
}

function passkeyDisplay(state, device, matchRequest, passkey, receiveKeypress) {
    const eventType = matchRequest ? BLEEventType.NUMERICAL_COMPARISON : BLEEventType.PASSKEY_DISPLAY;

    const keyParams = new AuthKeyParameters({
        passkey: passkey,
    });

    const event = new Event({
        type: eventType,
        device: apiHelper.getImmutableDevice(device),
        authKeyParams: keyParams,
        id: eventIndex,
        state: BLEEventState.INDETERMINATE,
        receiveKeypressEnabled: receiveKeypress,
    });

    let newState = state.setIn(['events', eventIndex], event);
    newState = newState.set('selectedEventId', eventIndex);
    newState = newState.set('visible', true);
    eventIndex++;

    return newState;
}

function passkeyKeypressSent(state, eventId, keypressType) {
    if (eventId < 0) {
        return state;
    }

    let keypressCount = state.getIn(['events', eventId, 'keypressCount']);

    if (keypressType === 'BLE_GAP_KP_NOT_TYPE_PASSKEY_START') {
        return state.setIn(['events', eventId, 'keypressStartSent'], true);
    } else if (keypressType === 'BLE_GAP_KP_NOT_TYPE_PASSKEY_END') {
        return state.setIn(['events', eventId, 'keypressEndSent'], true);
    } else if (keypressType === 'BLE_GAP_KP_NOT_TYPE_PASSKEY_DIGIT_IN') {
        return state.setIn(['events', eventId, 'keypressCount'], ++keypressCount);
    } else if (keypressType === 'BLE_GAP_KP_NOT_TYPE_PASSKEY_DIGIT_OUT') {
        return state.setIn(['events', eventId, 'keypressCount'], --keypressCount);
    } else if (keypressType === 'BLE_GAP_KP_NOT_TYPE_PASSKEY_CLEAR') {
        return state.setIn(['events', eventId, 'keypressCount'], 0);
    }

    return state;
}

function authKeyRequest(state, device, keyType, sendKeypress) {
    const eventType = (keyType === 'BLE_GAP_AUTH_KEY_TYPE_PASSKEY') ? BLEEventType.PASSKEY_REQUEST
        : (keyType === 'BLE_GAP_AUTH_KEY_TYPE_OOB') ? BLEEventType.LEGACY_OOB_REQUEST
        : null;

    const event = new Event({
        type: eventType,
        device: apiHelper.getImmutableDevice(device),
        id: eventIndex,
        state: BLEEventState.INDETERMINATE,
        sendKeypressEnabled: sendKeypress,
    });

    let newState = state.setIn(['events', eventIndex], event);
    newState = newState.set('selectedEventId', eventIndex);
    newState = newState.set('visible', true);
    eventIndex++;

    return newState;
}

function lescOobRequest(state, device, ownOobData) {
    const event = new Event({
        type: BLEEventType.LESC_OOB_REQUEST,
        device: apiHelper.getImmutableDevice(device),
        id: eventIndex,
        state: BLEEventState.INDETERMINATE,
        ownOobData: ownOobData,
    });

    let newState = state.setIn(['events', eventIndex], event);
    newState = newState.set('selectedEventId', eventIndex);
    newState = newState.set('visible', true);
    eventIndex++;

    return newState;
}

function createUserInitiatedPairingEvent(state, device, defaultSecParams) {
    const immutableSecParams = getImmutableSecurityParameters(defaultSecParams);
    console.log(`PairingParameters: ${JSON.stringify(immutableSecParams)}`);

    const event = new Event({
        type: BLEEventType.USER_INITIATED_PAIRING,
        device: apiHelper.getImmutableDevice(device),
        pairingParameters: immutableSecParams,
        id: eventIndex,
        state: BLEEventState.INDETERMINATE,
    });

    let newState = state.setIn(['events', eventIndex], event);
    newState = newState.set('selectedEventId', eventIndex);
    newState = newState.set('visible', true);
    eventIndex++;

    return newState;
}

function authErrorOccured(state, device) {
    if (!device) {
        return state;
    }

    // Find given device event that has state INDETERMINATE and set it to ERROR
    const events = state.events.filter((value, index) =>
        (value.state === BLEEventState.INDETERMINATE || value.state === BLEEventState.PENDING) &&
        (value.device.instanceId === device.instanceId));

    events.forEach(event => {
        state = updateEventStatus(state, event.id, BLEEventState.ERROR);
    });

    return state;
}

function authSuccessOccured(state, device) {
    if (!device) {
        return state;
    }

    // Find given device event that has state INDETERMINATE and set it to ERROR
    const events = state.events.filter((value, index) =>
        (value.state === BLEEventState.INDETERMINATE || value.state === BLEEventState.PENDING) &&
        (value.device.instanceId === device.instanceId));

    events.forEach(event => {
        state = updateEventStatus(state, event.id, BLEEventState.SUCCESS);
    });

    return state;
}

function securityRequestTimedOut(state, device) {
    return authErrorOccured(state, device);
}

export default function bleEvent(state = initialState, action)
{
    switch (action.type) {
        case BLEEventActions.BLE_EVENT_SHOW_DIALOG:
            return showDialog(state, action.visible);
        case BLEEventActions.BLE_EVENT_CLEAR_ALL_EVENTS:
            return clearAllEvents(state);
        case BLEEventActions.BLE_EVENT_SELECT_EVENT_ID:
            return selectEventId(state, action.selectedEventId);
        case BLEEventActions.BLE_EVENT_IGNORE:
            return ignoreEvent(state, action.eventId);
        case BLEEventActions.BLE_EVENT_ACCEPT:
            return acceptEvent(state, action.eventId);
        case BLEEventActions.BLE_EVENT_CREATE_USER_INITIATED_CONN_PARAMS_UPDATE_EVENT:
            return createUserInitiatedConnParamsUpdateEvent(state, action.device);
        case BLEEventActions.BLE_EVENT_CREATE_USER_INITIATED_PAIRING_EVENT:
            return createUserInitiatedPairingEvent(state, action.device, action.defaultSecParams);
        case BLEEventActions.BLE_EVENT_REMOVE:
            return removeEvent(state, action.eventId);
        case AdapterActions.DEVICE_CONNECTION_PARAM_UPDATE_REQUEST:
            return connectionUpdateParamRequest(state, action.device, action.requestedConnectionParams);
        case AdapterActions.DEVICE_SECURITY_REQUEST:
            return securityRequest(state, action.device, action.params);
        case AdapterActions.DEVICE_PASSKEY_DISPLAY:
            return passkeyDisplay(state, action.device, action.matchRequest, action.passkey, action.receiveKeypress);
        case AdapterActions.DEVICE_PASSKEY_KEYPRESS_SENT:
            return passkeyKeypressSent(state, action.eventId, action.keypressType);
        case AdapterActions.DEVICE_PASSKEY_KEYPRESS_RECEIVED:
            return passkeyKeypressReceived(state, action.device, action.keypressType);
        case AdapterActions.DEVICE_AUTHKEY_REQUEST:
            return authKeyRequest(state, action.device, action.keyType, action.sendKeypress);
        case AdapterActions.DEVICE_LESC_OOB_REQUEST:
            return lescOobRequest(state, action.device, action.ownOobData);
        case AdapterActions.DEVICE_AUTHKEY_STATUS:
            return updateEventStatus(state, action.id, action.status);
        case AdapterActions.DEVICE_AUTH_ERROR_OCCURED:
            return authErrorOccured(state, action.device);
        case AdapterActions.DEVICE_AUTH_SUCCESS_OCCURED:
            return authSuccessOccured(state, action.device);
        case AdapterActions.DEVICE_PAIRING_STATUS:
            return updateEventStatus(state, action.id, action.status);
        case AdapterActions.DEVICE_SECURITY_REQUEST_TIMEOUT:
            return securityRequestTimedOut(state, action.device);
        case AdapterActions.DEVICE_CONNECTION_PARAM_UPDATE_STATUS:
            return updateEventStatus(state, action.id, action.status);
        case AdapterActions.DEVICE_DISCONNECTED:
            return deviceDisconnected(state, action.device);
        default:
            return state;
    }
}
