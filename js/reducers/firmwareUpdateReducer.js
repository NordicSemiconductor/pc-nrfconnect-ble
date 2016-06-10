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

import { Record, OrderedMap } from 'immutable';

import * as FirmwareUpdateActions from '../actions/FirmwareUpdateActions';

const InitialState = Record({
    showingUpdateDialog: false,
    showProgress: false,
    adapter: null,
});

const initialState = new InitialState({
    showingUpdateDialog: false,
    showProgress: false,
    adapter: null,
});

function firmwareUpdateRequest(state, adapter) {
    return state.merge({ showingUpdateDialog: true, adapter: adapter });
}

export default function firmwareUpdate(state = initialState, action) {
    switch (action.type) {
        case FirmwareUpdateActions.SHOW_FIRMWARE_UPDATE_REQUEST:
            return firmwareUpdateRequest(state, action.adapter);
        case FirmwareUpdateActions.HIDE_FIRMWARE_UPDATE_REQUEST:
            return state.set('showingUpdateDialog', false);
        case FirmwareUpdateActions.UPDATE_FIRMWARE:
            return state.set('adapter', action.adapter);
        case FirmwareUpdateActions.SHOW_FIRMWARE_UPDATE_SPINNER:
            return state.set('showProgress', true);
        default:
            return state;
    }
}
