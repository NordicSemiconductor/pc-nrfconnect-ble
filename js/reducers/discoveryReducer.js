'use strict';

import Immutable, { Record, Map, List } from 'immutable';
import * as DiscoveryAction from '../actions/discoveryActions';
import * as AdapterAction from '../actions/adapterActions';
import * as apiHelper from '../utils/api';

const InitialState = Record({
    devices: Map(),
    errors: List(),
});

const initialState = new InitialState();

function deviceDiscovered(state, device) {
    let newDevice = apiHelper.getImmutableDevice(device);
    const existingDevice = state.devices.get(device.address);

    // Keep exising name if new name is empty
    if (existingDevice && existingDevice.name !== '' && device.name === '') {
        newDevice = newDevice.setIn(['name'], existingDevice.name);
    }

    // Keep existing list of services if new list is empty
    if (existingDevice && existingDevice.services.size > 0 && device.services.size === 0) {
        newDevice = newDevice.setIn(['services'], existingDevice.services);
    }

    return state.setIn(['devices', device.address], newDevice);

}

function addError(state, error) {
    return state.update('errors', errors => errors.push(error));
}

function clearList(state) {
    return state.update('devices', devices => devices.clear());
}

function deviceConnect(state, device) {
    return state.setIn(['devices', device.address, 'isConnecting'], true);
}

function deviceConnected(state, device) {
    return state.deleteIn(['devices', device.address]);
}

function deviceConnectTimeout(state, deviceAddress) {
    return state.setIn(['devices', deviceAddress.address, 'isConnecting'], false);
}

function deviceCancelConnect(state) {
    const _devices = state.devices;
    let newDevices = Immutable.Map();

    _devices.forEach((device, address) => {
        newDevices = newDevices.set(address, device.set('isConnecting', false));
    });

    return state.set('devices', newDevices);
}

export default function discovery(state = initialState, action) {
    switch (action.type) {
        case DiscoveryAction.DISCOVERY_CLEAR_LIST:
            return clearList(state);
        case DiscoveryAction.ERROR_OCCURED:
            return addError(state, action.error);
        case AdapterAction.DEVICE_DISCOVERED:
            return deviceDiscovered(state, action.device);
        case AdapterAction.DEVICE_CONNECT:
            return deviceConnect(state, action.device);
        case AdapterAction.DEVICE_CONNECTED:
            return deviceConnected(state, action.device);
        case AdapterAction.DEVICE_CONNECT_TIMEOUT:
            return deviceConnectTimeout(state, action.deviceAddress);
        case AdapterAction.DEVICE_CANCEL_CONNECT:
            return deviceCancelConnect(state);
        default:
            return state;
    }
}
