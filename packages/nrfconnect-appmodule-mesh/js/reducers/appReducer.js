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

import { Record } from 'immutable';

import * as AppActions from '../actions/appActions';

const InitialState = Record({
    selectedMainView: 'ConnectionMap',
    sizeOfRightPane: 300,
    isRightSideBarCollapsed: false,
});

const initialState = new InitialState();
function toggleRightSideSize(state) {
    if (!state.get('isRightSideBarCollapsed')) {
        return state.set('sizeOfRightPane', 5)
                    .set('isRightSideBarCollapsed', true);
    }
    return state.set('sizeOfRightPane', 300)
                .set('isRightSideBarCollapsed', false);
}

export default function app(state = initialState, action) {
    switch (action.type) {
        case AppActions.SELECT_MAIN_VIEW:
            return state.set('selectedMainView', action.view);
        case AppActions.RESIZE_RIGHT_SIDE_BAR:
            return toggleRightSideSize(state)
        default:
            return state;
    }
}
