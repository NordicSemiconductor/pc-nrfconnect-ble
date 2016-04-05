/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
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

import * as BLEEventActions from '../actions/bleEventActions';
import * as AdapterActions from '../actions/adapterActions';

import { BLEEventState, BLEEventType } from '../actions/common';

import * as apiHelper from '../utils/api';

import { Record, List, Map } from 'immutable';

const InitialState = Record({
    visible: false,
    events: List(),
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

    const event = new Event({
        type: BLEEventType.PEER_INITIATED_CONNECTION_UPDATE,
        device: apiHelper.getImmutableDevice(device),
        requestedConnectionParams: connectionParams,
        id: eventIndex,
        state: BLEEventState.INDETERMINATE,
    });

    let newState = state.set('events', state.events.push(event));
    newState = newState.set('selectedEventId', eventIndex);
    newState = newState.set('visible', true);
    eventIndex++;

    return newState;
}

function updateEventStatus(state, eventId, eventState) {
    if (eventId < 0) {
        return state;
    }

    return state.setIn(['events', eventId, 'state'], eventState);
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

    let newState = state.set('events', state.events.push(event));
    newState = newState.set('selectedEventId', eventIndex);
    newState = newState.set('visible', true);
    eventIndex++;

    return newState;
}

function securityRequest(state, device) {
    const initialPairingParams = new PairingParameters();

    const event = new Event({
        type: BLEEventType.PEER_INITIATED_PAIRING,
        device: apiHelper.getImmutableDevice(device),
        pairingParameters: initialPairingParams,
        id: eventIndex,
        state: BLEEventState.INDETERMINATE,
    });

    let newState = state.set('events', state.events.push(event));
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

    let newState = state.set('events', state.events.push(event));
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

    let newState = state.set('events', state.events.push(event));
    newState = newState.set('selectedEventId', eventIndex);
    newState = newState.set('visible', true);
    eventIndex++;

    return newState;
}

function createUserInitiatedPairingEvent(state, device) {
    const initialPairingParams = new PairingParameters();

    const event = new Event({
        type: BLEEventType.USER_INITIATED_PAIRING,
        device: apiHelper.getImmutableDevice(device),
        pairingParameters: initialPairingParams,
        id: eventIndex,
        state: BLEEventState.INDETERMINATE,
    });

    let newState = state.set('events', state.events.push(event));
    newState = newState.set('selectedEventId', eventIndex);
    newState = newState.set('visible', true);
    eventIndex++;

    return newState;
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
        case BLEEventActions.BLE_EVENT_CREATE_USER_INITIATED_CONN_PARAMS_UPDATE_EVENT:
            return createUserInitiatedConnParamsUpdateEvent(state, action.device);
        case BLEEventActions.BLE_EVENT_CREATE_USER_INITIATED_PAIRING_EVENT:
            return createUserInitiatedPairingEvent(state, action.device);
        case BLEEventActions.BLE_EVENT_REMOVE:
            return removeEvent(state, action.eventId);
        case AdapterActions.DEVICE_CONNECTION_PARAM_UPDATE_REQUEST:
            return connectionUpdateParamRequest(state, action.device, action.requestedConnectionParams);
        case AdapterActions.DEVICE_SECURITY_REQUEST:
            return securityRequest(state, action.device);
        case AdapterActions.DEVICE_PASSKEY_DISPLAY:
            return passkeyDisplay(state, action.device, action.matchRequest, action.passkey, action.receiveKeypress);
        case AdapterActions.DEVICE_PASSKEY_KEYPRESS_SENT:
            return passkeyKeypressSent(state, action.eventId, action.keypressType);
        case AdapterActions.DEVICE_PASSKEY_KEYPRESS_RECEIVED:
            return passkeyKeypressReceived(state, action.device, action.keypressType);
        case AdapterActions.DEVICE_AUTHKEY_REQUEST:
            return authKeyRequest(state, action.device, action.keyType, action.sendKeypress);
        case AdapterActions.DEVICE_AUTHKEY_STATUS:
            return updateEventStatus(state, action.id, action.status);
        case AdapterActions.DEVICE_PAIRING_STATUS:
            return updateEventStatus(state, action.id, action.status);
        case AdapterActions.DEVICE_CONNECTION_PARAM_UPDATE_STATUS:
            return updateEventStatus(state, action.id, action.status);
        case AdapterActions.DEVICE_DISCONNECTED:
            return deviceDisconnected(state, action.device);
        default:
            return state;
    }
}
