'use strict';

import * as BLEEventActions from '../actions/bleEventActions';
import Immutable, { Record, List } from 'immutable';

import { logger } from '../logging';

const InitialState = Record({
    visible: false,
    events: List(),
    selectedEventIndex: -1,
});

const initialState = new InitialState();

const EventInitialState = Record({
    name: null,
    type: null,
    deviceAddress: null,
    index: null, // Index of this event...
    state: '', // can be, '', 'error', 'timedOut', 'rejected', 'canceled', 'failed-item', 'indeterminate', 'success'
    backgroundColor: '', // ???

});

function showEventViewer(state, visible) {
    return state.setIn(['eventViewer', 'visible'], visible);
}

function clearAllUserEvents(state) {
    return state.update('events', events => events.clear());
}

export default function bleEvent(state = initialState, action)
{
    switch(action.type) {
        case BLEEventActions.BLE_EVENT_VIEWER_VISIBLE:
            return showEventViewer(action.visible);
        case BLEEventActions.BLE_EVENT_CLEAR_ALL_USER_EVENTS:
            return clearAllUserEvents(state);
        default:
            return state;
    }
}
