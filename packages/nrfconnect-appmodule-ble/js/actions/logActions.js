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

export const ADD_ENTRY = 'LOG_ADD_ENTRY';
export const ADD_ENTRIES = 'LOG_ADD_ENTRIES';
export const CLEAR_ENTRIES = 'LOG_CLEAR_ENTRIES';
export const TOGGLE_AUTOSCROLL = 'LOG_TOGGLE_AUTOSCROLL';

import { LogReader } from '../logging';

let logReader;
let entryCallback;

function _startLogReader(dispatch) {
    entryCallback = function(entries) {
        dispatch(logAddEntriesAction(entries));
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

function logAddEntriesAction(entries) {
    return {
        type: ADD_ENTRIES,
        entries,
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
