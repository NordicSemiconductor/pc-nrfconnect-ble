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

export const CLOSE = 'ERROR_CLOSE_ERROR_DIALOG';
export const SHOW_ERROR_MESSAGES = 'ERROR_SHOW_ERROR_MESSAGES';
export const ADD_ERROR_MESSAGE = 'ERROR_ADD_ERROR_MESSAGE';
export const TOGGLE_DEBUG = 'ERROR_TOGGLE_DEBUG';

function closeErrorDialogAction() {
    return {
        type: CLOSE,
    };
}

function showErrorDialogAction(errors) {
    return {
        type: SHOW_ERROR_MESSAGES,
        errors,
    };
}

function addErrorAction(error) {
    return {
        type: ADD_ERROR_MESSAGE,
        error,
    };
}

function toggleDebugAction() {
    return {
        type: TOGGLE_DEBUG,
    };
}

// Exported action creators
export function showErrorDialog(errors) {
    return showErrorDialogAction(errors);
}

export function addError(error) {
    return addErrorAction(error);
}

export function closeErrorDialog() {
    return closeErrorDialogAction();
}

export function toggleDebug() {
    return toggleDebugAction();
}
