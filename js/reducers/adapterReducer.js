'use strict';

// const NONE_TEXT = 'None';
const DEFAULT_ADAPTER_STATUS = 'Select com port';

import { List, Record } from 'immutable';
import { combineReducers } from 'redux';

import * as apiHelper from '../utils/api';

import deviceDetails from './deviceDetailsReducer';
import serverSetup from './serverSetupReducer';

import * as AdapterAction from '../actions/adapterActions';
import { logger } from '../logging';

const ImmutableRoot = Record({
    api: { adapters: [], selectedAdapter: null },
    adapters: List(),
    adapterStatus: 'Select COM port',
    adapterIndicator: 'off',
    selectedAdapter: null, // Index of selected adapter in .adapters (not api.adapters)
    errors: List(),
});

function getImmutableRoot() {
    return new ImmutableRoot();
}

function getSelectedAdapter(state) {
    return {
        adapter: state.getIn(['adapters', state.selectedAdapter]),
        index: state.selectedAdapter,
    };
}

function addAdapter(state, adapter) {
    state.api.adapters.push(adapter);
    return state.update('adapters', adapters => adapters.push(apiHelper.getImmutableAdapter(adapter)));
}

function removeAdapter(state, adapter) {
    const adapterIndex = state.api.adapters.indexOf(adapter);

    if (adapterIndex !== -1) {
        state.api.adapters.splice(adapterIndex, 1);

        if(adapterIndex === state.selectedAdapter) {
            state = state.set('adapterIndicator', 'off');
            state = state.set('selectedAdapter', null);
            state = state.set('adapterStatus', DEFAULT_ADAPTER_STATUS);
        }

        state = state.deleteIn(['adapters', adapterIndex]);
    } else {
        logger.error(`You removed an adapter I did not know about: ${adapter.adapterStatus.port}.`);
    }

    return state;
}

function openAdapter(state, adapter) {
    logger.info(`Opening adapter ${adapter.state.port}`);
    state = state.set('adapterStatus', adapter.state.port);
    return state;
}

function adapterOpened(state, adapter) {
    logger.info(`Adapter ${adapter.state.port} opened`);

    // Since we maintain state.api.adapters and state.adapters simultaniously
    // we use adapter index from state.api.adapters to access the "same" adapter
    // in state.adapters
    const adapterIndex = state.api.adapters.indexOf(adapter);

    state.api.selectedAdapter = adapter;

    state = state.set('selectedAdapter', adapterIndex);
    state = state.set('adapterStatus', adapter.state.port);
    state = state.set('adapterIndicator', 'on');

    return state;
}

function adapterStateChanged(state, adapter, adapterState) {
    const adapterIndex = state.api.adapters.indexOf(adapter);

    const immutableState = apiHelper.getImmutableAdapterState(adapterState);
    state = state.setIn(['adapters', adapterIndex, 'state'], immutableState);

    return state;
}

function closeAdapter(state, adapter) {
    state.api.selectedAdapter = null;

    state = state.set('adapterIndicator', 'off');
    state = state.set('selectedAdapter',  null);
    state = state.set('adapterStatus', DEFAULT_ADAPTER_STATUS);

    return state;
}

function adapterError(state, adapter, error) {
    logger.error(`Error on adapter ${adapter.state.port}: ${error.message}`);
    logger.debug(error.description);

    state.api.selectedAdapter = null;
    state = state.set('adapterStatus', 'Error connecting');
    state = state.set('adapterIndicator', 'error');
    state = state.set('selectedAdapter', null);
    state = state.update('errors', errors => errors.push(error.message));

    return state;
}

function deviceConnect(state, device) {
    return state;
}

function deviceConnected(state, device) {
    if (device.address === undefined) {
        return state;
    }

    const _device = apiHelper.getImmutableDevice(device);
    const { index } = getSelectedAdapter(state);

    return state.updateIn(['adapters', index, 'connectedDevices'],
        connectedDevices => connectedDevices.set(_device.instanceId, _device));
}

function connectedDeviceUpdated(state, device) {
    if(device.address === undefined) {
        return state;
    }

    const { index } = getSelectedAdapter(state);

    // TODO: check if received state is of immutable type
    const _device = apiHelper.getImmutableDevice(device);
    return state.mergeIn(['adapters', index, 'connectedDevices', _device.instanceId], _device);
}

function deviceDisconnected(state, device) {
    const { index } = getSelectedAdapter(state);
    return state.deleteIn(['adapters', index, 'connectedDevices', device.instanceId]);
}

function deviceInitiatePairing(state, device) {
    return state;
}

function deviceSecurityChanged(state, device, parameters) {
    if (device.address === undefined) {
        return state;
    }

    const { index } = getSelectedAdapter(state);

    const bonded = parameters.bonded;
    const sm1Levels = parameters.sm1Levels;

    state = state.setIn(['adapters', index, 'connectedDevices', device.instanceId, 'bonded'], bonded);
    state = state.setIn(['adapters', index, 'connectedDevices', device.instanceId, 'securityMode1Levels'], sm1Levels);
    return state;
}

function addError(state, error) {
    if (error.message === undefined) {
        console.log(`Error does not contain a message! Something is wrong!`);
        return;
    }

    logger.error(error.message);

    if (error.description) {
        logger.debug(error.description);
    }

    state = state.update('errors', errors => errors.push(error.message));
    return state;
}

export default function adapter(state = getImmutableRoot(), action) {
    const adapterSubReducers = combineReducers({
        deviceDetails,
        serverSetup,
    });

    if(state.selectedAdapter) {
        const selectedAdapter = state.getIn(['adapters', state.selectedAdapter]);

        if (selectedAdapter) {
            const newSubReducerStates = adapterSubReducers(
                {
                    deviceDetails: selectedAdapter.deviceDetails,
                    serverSetup: selectedAdapter.serverSetup,
                }, action);

            state = state.mergeIn(['adapters', state.selectedAdapter], newSubReducerStates);
        }
    }

    switch (action.type) {
        case AdapterAction.ADAPTER_OPEN:
            return openAdapter(state, action.adapter);
        case AdapterAction.ADAPTER_OPENED:
            return adapterOpened(state, action.adapter);
        case AdapterAction.ADAPTER_CLOSE:
            return closeAdapter(state, action.adapter);
        case AdapterAction.ADAPTER_ADDED:
            return addAdapter(state, action.adapter);
        case AdapterAction.ADAPTER_REMOVED:
            return removeAdapter(state, action.adapter);
        case AdapterAction.ADAPTER_ERROR:
            return adapterError(state, action.adapter, action.error);
        case AdapterAction.ADAPTER_STATE_CHANGED:
            return adapterStateChanged(state, action.adapter, action.state);
        case AdapterAction.ERROR_OCCURED:
            return addError(state, action.error);
        case AdapterAction.DEVICE_CONNECT:
            return deviceConnect(state, action.device);
        case AdapterAction.DEVICE_CONNECTED:
            return deviceConnected(state, action.device);
        case AdapterAction.DEVICE_DISCONNECTED:
            return deviceDisconnected(state, action.device);
        case AdapterAction.DEVICE_INITIATE_PAIRING:
            return deviceInitiatePairing(state, action.device);
        case AdapterAction.DEVICE_CONNECTION_PARAM_UPDATE_STATUS:
            return connectedDeviceUpdated(state, action.device);
        case AdapterAction.DEVICE_SECURITY_CHANGED:
            return deviceSecurityChanged(state, action.device, action.parameters);
        default:
            return state;
    }
}
