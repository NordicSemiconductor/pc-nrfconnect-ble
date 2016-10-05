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

import * as AppActions from '../actions/appActions';
import { getImmutableAppmodule } from '../utils/api';

const InitialState = Record({
    selectedAppmodule: null,
    appmodules: List()
});

const initialState = new InitialState();

export default function (state = initialState, action) {
    switch (action.type) {
        case AppActions.SELECT_APPMODULE:
            return setSelectedAppmodule(state, action.name);
        case AppActions.LOAD_APPMODULES_SUCCESS:
            return setAppmoduleList(state, action.appmodules);
        default:
            return state;
    }
}

function setSelectedAppmodule(state, name) {
    return state.set('selectedAppmodule', name);
}

function setAppmoduleList(state, appmodules) {
    const appmoduleArray = appmodules.map(appmodule => {
        return getImmutableAppmodule(appmodule);
    });
    return state.set('appmodules', List(appmoduleArray));
}

