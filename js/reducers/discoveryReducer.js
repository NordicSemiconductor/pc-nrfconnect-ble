'use strict';

import Immutable, { Record, Map, List } from 'immutable';
import * as DiscoveryAction from '../actions/discoveryActions';
import * as AdapterAction from '../actions/adapterActions';

const InitialState = Record({
    devices: Map(),
    errors: List()
});

const initialState = new InitialState();

function deviceFound(state, device) {
    const newDevice = Immutable.fromJS(device);
    newDevice.isConnecting = false;

    return state.update(
        'devices',
        devices => devices.set(device.address, newDevice)
    );
}

function addError(state, error) {
    return state.update('errors', errors => errors.push(error));
}

function clearList(state) {
    return state.update('devices', devices => devices.clear());
}

function deviceConnect(state, device) {
    const newDevice = state.devices.get(device.address);
    newDevice.isConnecting = true;
    return state.update('devices', devices => devices.set(device.address, newDevice));
}

function deviceConnected(state, device) {
    return state.update('devices', devices => devices.delete(device.address));
}

function deviceCancelConnect(state) {
    state.devices.map((device, key) => {
        device.isConnecting = false;
    });

    return state;
}

export default function discovery(state = initialState, action) {
    switch (action.type) {
        case DiscoveryAction.DISCOVERY_DEVICE_FOUND:
            return deviceFound(state, action.device);
        case DiscoveryAction.DISCOVERY_CLEAR_LIST:
            return clearList(state);
        case DiscoveryAction.ERROR_OCCURED:
            return addError(state, action.error);
        case AdapterAction.DEVICE_CONNECT:
            return deviceConnect(state, action.device);
        case AdapterAction.DEVICE_CONNECTED:
            return deviceConnected(state, action.device);
        case AdapterAction.DEVICE_CANCEL_CONNECT:
            return deviceCancelConnect(state);
        default:
            return state;
    }
}
