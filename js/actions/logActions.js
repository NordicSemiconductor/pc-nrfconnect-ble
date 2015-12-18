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

export const ADD_ENTRY = 'LOG_ADD_ENTRY';
export const CLEAR_ENTRIES = 'LOG_CLEAR_ENTRIES';
export const TOGGLE_AUTOSCROLL = 'LOG_TOGGLE_AUTOSCROLL';

import { LogReader } from '../logging';

let logReader;
let entryCallback;

function _startLogReader(dispatch) {
    entryCallback = function(entry) {
        dispatch(logAddEntryAction(entry));
    };

    if (logReader === undefined) {
        logReader = new LogReader();
        logReader.on('entry', entryCallback);
    }

    logReader.start();
}

function _stopLogReader(dispatch) {
    if (entryCallback !== undefined && logReader !== undefined) {
        logReader.removeListener(entryCallback);
        logReader.stop();
    }
}

function logAddEntryAction(entry) {
    return {
        type: ADD_ENTRY,
        entry,
    };
}

function clearEntriesAction() {
    return {
        type: CLEAR_ENTRIES,
    };
}

function toggleAutoScrollAction() {
    return {
        type: TOGGLE_AUTOSCROLL,
    };
}

export function toggleAutoScroll() {
    return toggleAutoScrollAction();
}

export function clear() {
    return clearEntriesAction();
}

export function startReading() {
    return dispatch => {
        return _startLogReader(dispatch);
    };
}

export function stopReading() {
    return dispatch => {
        return _stopLogReader(dispatch);
    };
}
