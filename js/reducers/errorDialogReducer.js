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

import * as ErrorDialogActions from '../actions/errorDialogActions';

import { Record, List } from 'immutable';
import { logger } from '../logging';

const InitialState = Record({
    visible: false,
    errors: List(),
    debug: false,
});

const initialState = new InitialState();

function hideAndClearErrors(state) {
    // Only clear the list of errors if we are not in debug mode.
    if (state.debug !== true) {
        state = state.set('errors', state.errors.clear());
    }

    return state.set('visible', false);
}

function showErrors(state, errors) {
    if (errors !== undefined) {
        if (errors.constructor !== Array) {
            state = addErrorMessage(state, errors);
        } else {
            errors.forEach(error => {
                state = addErrorMessage(state, error);
            });
        }
    }

    return state.set('visible', true);
}

function toggleDebug(state) {
    if (state.debug === false) {
        logger.info('Enabling debug output in error dialog. Also disables clearing of messages in the dialog after OK is clicked.');
    } else {
        logger.info('Disabling debug output in error dialog.');
    }

    return state.set('debug', !state.debug);
}

function addErrorMessage(state, error) {
    // We do not want to log validation errors
    if(error.name !== 'ValidationError') {
        logger.error(error.message);
        logger.debug(error.stack);
    }

    return state.set('errors', state.errors.push(error));
}

export default function errorDialog(state = initialState, action)
{
    switch (action.type) {
        case ErrorDialogActions.CLOSE:
            return hideAndClearErrors(state);
        case ErrorDialogActions.SHOW_ERROR_MESSAGES:
            return showErrors(state, action.errors);
        case ErrorDialogActions.ADD_ERROR_MESSAGE:
            return addErrorMessage(state, action.error);
        case ErrorDialogActions.TOGGLE_DEBUG:
            return toggleDebug(state);
        default:
            return state;
    }
}
