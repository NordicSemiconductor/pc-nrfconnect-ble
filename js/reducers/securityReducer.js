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

import Immutable, { Record, OrderedMap, List } from 'immutable';
import * as SecurityActions from '../actions/securityActions';
import * as apiHelper from '../utils/api';
import { logger } from '../logging';

const IO_CAPS_DISPLAY_ONLY = 0;
const IO_CAPS_DISPLAY_YESNO = 1;
const IO_CAPS_KEYBOARD_ONLY = 2;
const IO_CAPS_NONE = 3;
const IO_CAPS_KEYBOARD_DISPLAY = 4;

const SecurityParameters = Record({
    bond: false,
    ioCaps: null,
    lesc: false,
    mitm: false,
    oob: false,
    keypress: false,
});

const defaultSecurityParams = new SecurityParameters({
    bond: false,
    ioCaps: IO_CAPS_KEYBOARD_DISPLAY,
    lesc: false,
    mitm: false,
    oob: false,
    keypress: false,
});

const InitialState = Record({
    securityParams: defaultSecurityParams,
    showingSecurityDialog: false,
    autoAcceptPairing: true,
});

const initialState = new InitialState();

export default function discovery(state = initialState, action) {
    switch (action.type) {
        case SecurityActions.APPLY_SECURITY_PARAMS:
            return state;
        case SecurityActions.SECURITY_PARAMS_APPLIED:
            return state.set('securityParams', new SecurityParameters(action.params));
        case SecurityActions.SECURITY_HIDE_DIALOG:
            return state.set('showingSecurityDialog', false);
        case SecurityActions.SECURITY_SHOW_DIALOG:
            return state.set('showingSecurityDialog', true);
        case SecurityActions.SECURITY_TOGGLE_AUTO_ACCEPT_PAIRING:
            return state.set('autoAcceptPairing', !state.autoAcceptPairing);
        default:
            return state;
    }
}
