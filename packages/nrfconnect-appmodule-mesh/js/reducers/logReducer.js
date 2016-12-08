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

import { Record, List } from 'immutable';

import * as LogAction from '../actions/logActions';

const InitialState = Record({
    autoScroll: true,
    entries: List(),
    diplayRTTLog: true,

});

const initialState = new InitialState();

export default function log(state = initialState, action) {
    switch (action.type) {
        case LogAction.ADD_ENTRY:
            return state.set('entries', state.entries.push(action.entry));
        case LogAction.ADD_ENTRIES:
            return addEnteries(state, action)
        case LogAction.CLEAR_ENTRIES:
            return state.set('entries', state.entries.clear());
        case LogAction.TOGGLE_AUTOSCROLL:
            return state.set('autoScroll', !state.autoScroll);
        case LogAction.TOGGLE_RTTLOG:
            return state.set('diplayRTTLog', !state.diplayRTTLog);
        case LogAction.REMOVE_START_OF_LOG:
            return removeStartOfLog(state, action);
        default:
            return state;
    }
}

function removeStartOfLog(state, action) {
    const delLength = state.entries.size / 2;
    return state.set('entries', state.entries.splice(0, delLength));
}

function addEnteries(state, action) {
    return state.set('entries', state.entries.push(...(action.entries)));
}
