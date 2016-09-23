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

import { getAppmodules } from '../utils/appmoduleRepository';
import { errorDialogActions } from 'nrfconnect-core';
const { showErrorDialog } = errorDialogActions;

export const SELECT_APPMODULE = 'APP_SELECT_APPMODULE';
export const LOAD_APPMODULES_SUCCESS = 'APP_LOAD_APPMODULES_SUCCESS';

export function selectAppmoduleAction(appmodule) {
    return {
        type: SELECT_APPMODULE,
        appmodule: appmodule
    };
}

export function loadAppmodulesSuccessAction(appmodules) {
    return {
        type: LOAD_APPMODULES_SUCCESS,
        appmodules: appmodules
    };
}

export function loadAppmodulesAction() {
    return dispatch => {
        return loadAppmodules().then(
            appmodules => dispatch(loadAppmodulesSuccessAction(appmodules))
        ).catch(
            error => dispatch(showErrorDialog(error))
        );
    };
}

function loadAppmodules() {
    return new Promise(resolve => {
        resolve(getAppmodules());
    });
}

