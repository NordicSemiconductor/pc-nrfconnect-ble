/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
