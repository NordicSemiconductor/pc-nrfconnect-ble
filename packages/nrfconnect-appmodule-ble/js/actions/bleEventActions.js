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

export const BLE_EVENT_CONN_PARAM_UPDATE_REQUEST = 'BLE_EVENT_CONN_PARAM_UPDATE_REQUEST';
export const BLE_EVENT_SHOW_DIALOG = 'BLE_EVENT_SHOW_DIALOG';
export const BLE_EVENT_CLEAR_ALL_EVENTS = 'BLE_EVENT_CLEAR_ALL_EVENTS';
export const BLE_EVENT_SELECT_EVENT_ID = 'BLE_EVENT_SELECT_EVENT_ID';
export const BLE_EVENT_TIMED_OUT = 'BLE_EVENT_TIMED_OUT';
export const BLE_EVENT_IGNORE = 'BLE_EVENT_IGNORE';
export const BLE_EVENT_ACCEPT = 'BLE_EVENT_ACCEPT';
export const BLE_EVENT_REMOVE = 'BLE_EVENT_REMOVE';
export const BLE_EVENT_CREATE_USER_INITIATED_CONN_PARAMS_UPDATE_EVENT = 'BLE_EVENT_CREATE_USER_INITIATED_CONN_PARAMS_UPDATE_EVENT';
export const BLE_EVENT_CREATE_USER_INITIATED_PAIRING_EVENT = 'BLE_EVENT_CREATE_USER_INITIATED_PAIRING_EVENT';

function _createUserInitiatedPairingEventAction(dispatch, getState, device) {
    const defaultSecParams =  getState().adapter.getIn(['adapters', getState().adapter.selectedAdapter, 'security', 'securityParams']);
    dispatch(createUserInitiatedPairingEventAction(device, defaultSecParams));
}

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

export function createUserInitiatedPairingEvent(device) {
    return (dispatch, getState) => {
        return _createUserInitiatedPairingEventAction(dispatch, getState, device);
    };
}
