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
});

const initialState = new InitialState();

export default function log(state = initialState, action) {
    switch (action.type) {
        case LogAction.ADD_ENTRY:
            return state.set('entries', state.entries.push(action.entry));
        case LogAction.CLEAR_ENTRIES:
            return state.set('entries', state.entries.clear());
        case LogAction.TOGGLE_AUTOSCROLL:
            return state.set('autoScroll', !autoScroll);
        default:
            return state;
    }
}
