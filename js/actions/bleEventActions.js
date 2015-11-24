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

export const EventType = {
    USER_INITIATED_CONNECTION_UPDATE: 0,
    PERIPHERAL_INITIATED_CONNECTION_UPDATE: 1,
};

export const BLE_EVENT_CONN_PARAM_UPDATE_REQUEST = 'BLE_EVENT_CONN_PARAM_UPDATE_REQUEST';
export const BLE_EVENT_SHOW_DIALOG = 'BLE_EVENT_SHOW_DIALOG';
export const BLE_EVENT_CLEAR_ALL_EVENTS = 'BLE_EVENT_CLEAR_ALL_EVENTS';
export const BLE_EVENT_SELECT_EVENT_INDEX = 'BLE_EVENT_SELECT_EVENT_INDEX';
export const BLE_EVENT_TIMED_OUT = 'BLE_EVENT_TIMED_OUT';

function showDialogAction(visible) {
    return {
        type: BLE_EVENT_SHOW_DIALOG,
        visible
    };
}

function selectEventAction(selectedIndex) {
    return {
        type: BLE_EVENT_SELECT_EVENT_INDEX,
        selectedIndex,
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

// Exported action creators
export function clearAllEvents() {
    return clearAllEventsAction();
}

export function selectEvent(eventIndex) {
    return selectEventAction(eventIndex);
}

export function showDialog(visible) {
    return showDialogAction(visible);
}

export function eventTimedOut(event) {
    return eventTimedOutAction(event);
}
