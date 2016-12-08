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

export const SELECT_MAIN_VIEW = 'APP_SELECT_MAIN_VIEW';
export const RESIZE_RIGHT_SIDE_BAR = 'RESIZE_RIGHT_SIDE_BAR';

function selectMainViewAction(view) {
    return {
        type: SELECT_MAIN_VIEW,
        view: view,
    };
}

function _resizeRightSideBar() {
    return {
        type: RESIZE_RIGHT_SIDE_BAR
    };
}

export function selectMainView(view) {
    return selectMainViewAction(view);
}


export function toggleRightSideBar() {
    return _resizeRightSideBar();
}
