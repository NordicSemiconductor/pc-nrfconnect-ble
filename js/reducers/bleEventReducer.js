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
    state: BLEEventState.UNKNOWN,
});

// Module local variable that is used to generate a unique ID for all events that are
// added by the user or by incoming connection parameter update requests.
let eventIndex = 0;

function resetSelectedEventIdAndEventIndex(state)
{
    eventIndex = 0;
    return state.set('selectedEventId', -1);
}

function showDialog(state, visible) {
    return state.set('visible', visible);
}

function clearAllEvents(state) {
    state = resetSelectedEventIdAndEventIndex(state);
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
    if (eventId < 0) {
        return state;
    }

    return state.setIn(['events', eventId, 'state'], eventState);
}

function selectEventId(state, selectedEventId) {
    return state.set('selectedEventId', selectedEventId);
}

function deviceDisconnected(state, device) {
    // Find given device event that has state INDETERMINATE and set it to DISCONNECTED
    const events = state.events.filter((value, index) =>
        (value.state === BLEEventState.INDETERMINATE) &&
        (value.device.address === device.address));

    events.forEach(event => {
        state = connectionParamUpdateStatus(state, event.id, BLEEventState.DISCONNECTED);
    });

    return state;
}

function ignoreEvent(state, eventId) {
    return state.setIn(['events', eventId, 'state'], BLEEventState.IGNORED);
}

function removeEvent(state, eventId) {
    if (state.selectedEventId === eventId) {
        state = state.set('selectedEventId', -1);
    }

    return state.deleteIn(['events', eventId]);
}

function createUserInitiatedConnParamsUpdateEvent(state, device) {
    // Information regarding BLE parameters are taken from:
    // https://developer.bluetooth.org/gatt/characteristics/Pages/CharacteristicViewer.aspx?u=org.bluetooth.characteristic.gap.peripheral_preferred_connection_parameters.xml
    const defaultConnectionParams = {
        connectionSupervisionTimeout: 4000,
        maxConnectionInterval: 4000,
        minConnectionInterval: 7.5,
        slaveLatency: 0,
    };

    let newState = state.update('events', events => {
        const event = new Event({
            type: BLEEventType.USER_INITIATED_CONNECTION_UPDATE,
            device: apiHelper.getImmutableDevice(device),
            requestedConnectionParams: defaultConnectionParams,
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

export default function bleEvent(state = initialState, action)
{
    switch (action.type) {
        case BLEEventActions.BLE_EVENT_SHOW_DIALOG:
            return showDialog(state, action.visible);
        case BLEEventActions.BLE_EVENT_CLEAR_ALL_EVENTS:
            return clearAllEvents(state);
        case BLEEventActions.BLE_EVENT_SELECT_EVENT_ID:
            return selectEventId(state, action.selectedEventId);
        case BLEEventActions.BLE_EVENT_IGNORE:
            return ignoreEvent(state, action.eventId);
        case BLEEventActions.BLE_EVENT_CREATE_USER_INITIATED_CONN_PARAMS_UPDATE_EVENT:
            return createUserInitiatedConnParamsUpdateEvent(state, action.device);
        case BLEEventActions.BLE_EVENT_REMOVE:
            return removeEvent(state, action.eventId);
        case AdapterActions.DEVICE_CONNECTION_PARAM_UPDATE_REQUEST:
            return connectionUpdateParamRequest(state, action.device, action.requestedConnectionParams);
        case AdapterActions.DEVICE_CONNECTION_PARAM_UPDATE_STATUS:
            return connectionParamUpdateStatus(state, action.id, action.status);
        case AdapterActions.DEVICE_DISCONNECTED:
            return deviceDisconnected(state, action.device);
        default:
            return state;
    }
}
