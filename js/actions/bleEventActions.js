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

export const BLE_EVENT_CONN_PARAM_UPDATE_REQUEST = 'BLE_EVENT_CONN_PARAM_UPDATE_REQUEST';
export const BLE_EVENT_SHOW_DIALOG = 'BLE_EVENT_SHOW_DIALOG';
export const BLE_EVENT_CLEAR_ALL_EVENTS = 'BLE_EVENT_CLEAR_ALL_EVENTS';
export const BLE_EVENT_SELECT_EVENT_ID = 'BLE_EVENT_SELECT_EVENT_ID';
export const BLE_EVENT_TIMED_OUT = 'BLE_EVENT_TIMED_OUT';
export const BLE_EVENT_IGNORE = 'BLE_EVENT_IGNORE';

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

// Exported action creators
export function clearAllEvents() {
    return clearAllEventsAction();
}

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
