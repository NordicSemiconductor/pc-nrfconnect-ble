'use strict';

import * as ErrorDialogActions from '../actions/errorDialogActions';

import { Record, List } from 'immutable';

const InitialState = Record({
    visible: false,
    errors: List(),
});

const initialState = new InitialState();

function hideAndClearErrors(state) {
    state = state.updateIn(['errors'], errors => errors.clear());
    return state.set('visible', false);
}

function showErrors(state, errors) {
    if (errors !== undefined) {
        if (errors.constructor !== Array) {
            state = addErrorMessage(state, errors);
        } else {
            errors.forEach(error => {
                state = state.updateIn(['errors'], _errors => _errors.push(error));
            });
        }
    }

    return state.set('visible', true);
}

function addErrorMessage(state, error) {
    return state.updateIn(['errors'], errors => errors.push(error));
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
        default:
            return state;
    }
}
