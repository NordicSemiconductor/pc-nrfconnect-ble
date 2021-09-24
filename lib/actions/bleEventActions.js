/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

export const BLE_EVENT_CONN_PARAM_UPDATE_REQUEST =
    'BLE_EVENT_CONN_PARAM_UPDATE_REQUEST';
export const BLE_EVENT_SHOW_DIALOG = 'BLE_EVENT_SHOW_DIALOG';
export const BLE_EVENT_CLEAR_ALL_EVENTS = 'BLE_EVENT_CLEAR_ALL_EVENTS';
export const BLE_EVENT_SELECT_EVENT_ID = 'BLE_EVENT_SELECT_EVENT_ID';
export const BLE_EVENT_TIMED_OUT = 'BLE_EVENT_TIMED_OUT';
export const BLE_EVENT_IGNORE = 'BLE_EVENT_IGNORE';
export const BLE_EVENT_ACCEPT = 'BLE_EVENT_ACCEPT';
export const BLE_EVENT_REMOVE = 'BLE_EVENT_REMOVE';
export const BLE_EVENT_CREATE_USER_INITIATED_CONN_PARAMS_UPDATE_EVENT =
    'BLE_EVENT_CREATE_USER_INITIATED_CONN_PARAMS_UPDATE_EVENT';
export const BLE_EVENT_CREATE_USER_INITIATED_PHY_UPDATE_EVENT =
    'BLE_EVENT_CREATE_USER_INITIATED_PHY_UPDATE_EVENT';
export const BLE_EVENT_CREATE_USER_INITIATED_MTU_UPDATE_EVENT =
    'BLE_EVENT_CREATE_USER_INITIATED_MTU_UPDATE_EVENT';
export const BLE_EVENT_CREATE_USER_INITIATED_DATA_LENGTH_UPDATE_EVENT =
    'BLE_EVENT_CREATE_USER_INITIATED_DATA_LENGTH_UPDATE_EVENT';
export const BLE_EVENT_CREATE_USER_INITIATED_PAIRING_EVENT =
    'BLE_EVENT_CREATE_USER_INITIATED_PAIRING_EVENT';

function showDialogAction(visible) {
    return {
        type: BLE_EVENT_SHOW_DIALOG,
        visible,
    };
}

function selectEventIdAction(selectedEventId) {
    return {
        type: BLE_EVENT_SELECT_EVENT_ID,
        selectedEventId,
    };
}

function clearAllEventsAction() {
    return {
        type: BLE_EVENT_CLEAR_ALL_EVENTS,
    };
}

function eventTimedOutAction(event) {
    return {
        type: BLE_EVENT_TIMED_OUT,
        event,
    };
}

function ignoreEventAction(eventId) {
    return {
        type: BLE_EVENT_IGNORE,
        eventId,
    };
}

function acceptEventAction(eventId) {
    return {
        type: BLE_EVENT_ACCEPT,
        eventId,
    };
}

function removeEventAction(eventId) {
    return {
        type: BLE_EVENT_REMOVE,
        eventId,
    };
}

function createUserInitiatedConnParamsUpdateEventAction(device) {
    return {
        type: BLE_EVENT_CREATE_USER_INITIATED_CONN_PARAMS_UPDATE_EVENT,
        device,
    };
}

function createUserInitiatedPhyUpdateEventAction(device) {
    return {
        type: BLE_EVENT_CREATE_USER_INITIATED_PHY_UPDATE_EVENT,
        device,
    };
}

function createUserInitiatedMtuUpdateEventAction(device, mtu) {
    return {
        type: BLE_EVENT_CREATE_USER_INITIATED_MTU_UPDATE_EVENT,
        device,
        mtu,
    };
}

function createUserInitiatedDataLengthUpdateEventAction(device, dataLength) {
    return {
        type: BLE_EVENT_CREATE_USER_INITIATED_DATA_LENGTH_UPDATE_EVENT,
        device,
        dataLength,
    };
}

function createUserInitiatedPairingEventAction(device, defaultSecParams) {
    return {
        type: BLE_EVENT_CREATE_USER_INITIATED_PAIRING_EVENT,
        device,
        defaultSecParams,
    };
}

// Exported action creators
export function selectEventId(eventId) {
    return selectEventIdAction(eventId);
}

export function showDialog(visible) {
    return showDialogAction(visible);
}

export function eventTimedOut(event) {
    return eventTimedOutAction(event);
}

export function ignoreEvent(eventId) {
    return ignoreEventAction(eventId);
}

export function acceptEvent(eventId) {
    return acceptEventAction(eventId);
}

export function removeEvent(eventId) {
    return removeEventAction(eventId);
}

export function clearAllEvents() {
    return clearAllEventsAction();
}

export function createUserInitiatedConnParamsUpdateEvent(device) {
    return createUserInitiatedConnParamsUpdateEventAction(device);
}

export function createUserInitiatedPhyUpdateEvent(device) {
    return createUserInitiatedPhyUpdateEventAction(device);
}

export function createUserInitiatedMtuUpdateEvent(device) {
    return dispatch => {
        dispatch(createUserInitiatedMtuUpdateEventAction(device));
    };
}

export function createUserInitiatedDataLengthUpdateEvent(device) {
    return dispatch => {
        dispatch(createUserInitiatedDataLengthUpdateEventAction(device));
    };
}

export function createUserInitiatedPairingEvent(device) {
    return (dispatch, getState) => {
        const defaultSecParams =
            getState().app.adapter.selectedAdapter.security.securityParams;
        dispatch(
            createUserInitiatedPairingEventAction(device, defaultSecParams)
        );
    };
}
