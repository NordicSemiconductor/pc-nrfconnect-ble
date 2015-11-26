'use strict';

import * as BLEEventActions from '../actions/bleEventActions';
import * as AdapterActions from '../actions/adapterActions';

import { BLEEventState, BLEEventType } from '../actions/common';

import * as apiHelper from '../utils/api';

import { Record, List } from 'immutable';

const InitialState = Record({
    visible: false,
    events: List(),
    selectedEventId: -1,
});

const initialState = new InitialState();

const Event = Record({
    id: null,
    type: null,
    device: null,
    requestedConnectionParams: null,
    state: BLEEventState.UNKNOWN
});

let eventIndex = 0;

function showDialog(state, visible) {
    return state.set('visible', visible);
}

function clearAllUserEvents(state) {
    return state.update('events', events => events.clear());
}

function connectionUpdateParamRequest(state, device, requestedConnectionParams) {
    let newState = state.update('events', events => {
        const event = new Event({
            type: BLEEventType.PERIPHERAL_INITIATED_CONNECTION_UPDATE,
            device: apiHelper.getImmutableDevice(device),
            requestedConnectionParams: requestedConnectionParams,
            id: eventIndex,
            state: BLEEventState.INDETERMINATE,
        });

        return events.push(event);
    });

    newState = newState.set('selectedEventId', eventIndex);
    newState = newState.set('visible', true);
    eventIndex++;

    return newState;
}

function connectionParamUpdateStatus(state, eventId, eventState) {
    return state.setIn(['events', eventId, 'state'], eventState);
}

function selectEventId(state, selectedEventId) {
    return state.set('selectedEventId', selectedEventId);
}

export default function bleEvent(state = initialState, action)
{
    switch(action.type) {
        case BLEEventActions.BLE_EVENT_SHOW_DIALOG:
            return showDialog(state, action.visible);
        case BLEEventActions.BLE_EVENT_CLEAR_ALL_USER_EVENTS:
            return clearAllUserEvents(state);
        case BLEEventActions.BLE_EVENT_SELECT_EVENT_ID:
            return selectEventId(state, action.selectedEventId);
        case AdapterActions.DEVICE_CONNECTION_PARAM_UPDATE_REQUEST:
            return connectionUpdateParamRequest(state, action.device, action.requestedConnectionParams);
        case AdapterActions.DEVICE_CONNECTION_PARAM_UPDATE_STATUS:
            return connectionParamUpdateStatus(state, action.id, action.status);
        default:
            return state;
    }
}
