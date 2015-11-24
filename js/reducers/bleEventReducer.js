'use strict';

import * as BLEEventActions from '../actions/bleEventActions';
import * as AdapterActions from '../actions/adapterActions';

import * as apiHelper from '../utils/api';

import { Record, List } from 'immutable';

const InitialState = Record({
    visible: false,
    events: List(),
    selectedIndex: -1,
});

const initialState = new InitialState();

const Event = Record({
    type: null,
    device: null,
    index: null, // Index of this event...
    state: '', // can be, '', 'error', 'timedOut', 'rejected', 'canceled', 'failed-item', 'indeterminate', 'success'
});

let eventIndex = 0;

function showDialog(state, visible) {
    return state.set('visible', visible);
}

function clearAllUserEvents(state) {
    return state.update('events', events => events.clear());
}

function connectionUpdateParamRequest(state, device) {
    return state.update('events', events => {
        events.push(new Event({
            type: BLEEventActions.EventType.PERIPHERAL_INITIATED_CONNECTION_UPDATE,
            device: apiHelper.getImmutableDevice(device),
            index: eventIndex++,
        }));
    });
}

function selectEventIndex(state, selectedIndex) {
    return state.set('selectedIndex', selectedIndex);
}

export default function bleEvent(state = initialState, action)
{
    switch(action.type) {
        case BLEEventActions.BLE_EVENT_SHOW_DIALOG:
            return showDialog(state, action.visible);
        case BLEEventActions.BLE_EVENT_CLEAR_ALL_USER_EVENTS:
            return clearAllUserEvents(state);
        case BLEEventActions.BLE_EVENT_SELECT_EVENT_INDEX:
            return selectEventIndex(state, action.selectedIndex);
        case AdapterActions.DEVICE_CONNECTION_PARAM_UPDATE_REQUEST:
            return connectionUpdateParamRequest(state, action.device);
        default:
            return state;
    }
}
