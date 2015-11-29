'use strict';

// const NONE_TEXT = 'None';
const DEFAULT_ADAPTER_STATUS = 'Select com port';

import { combineReducers } from 'redux';

import * as apiHelper from '../utils/api';

import deviceDetails from './deviceDetailsReducer';
import serverSetup from './serverSetupReducer';

import * as AdapterAction from '../actions/adapterActions';
import { logger } from '../logging';

function getSelectedAdapter(state) {
    return {
        adapter: state.adapters[state.selectedAdapter],
        index: state.selectedAdapter,
    };
}

function findDevice(state, deviceInstanceId) {
    const { adapter } = getSelectedAdapter(state);

    return adapter.devices.find(function(device) {
        return device.instanceId.id === deviceInstanceId;
    });
}

function maintainNoneField(state) {
    return;
    /*
    const noneIndex = state.adapters.indexOf(NONE_TEXT);

    if(noneIndex != -1 && state.api.adapters.length > 0) {
        state.adapters.splice(noneIndex, 1);
    } else if(noneIndex == -1 && state.api.adapters.length === 0) {
        state.adapters.push(NONE_TEXT);
    } */
}

function addAdapter(state, adapter) {
    state.api.adapters.push(adapter);
    state.adapters.push(apiHelper.getImmutableAdapter(adapter));

    maintainNoneField(state);
    return state;
}

function removeAdapter(state, adapter) {
    const adapterIndex = state.api.adapters.indexOf(adapter);

    if (adapterIndex !== -1) {
        state.api.adapters.splice(adapterIndex, 1);
        state.adapters.splice(adapterIndex, 1);
        state.adapterIndicator = 'off';
        state.selectedAdapter = null;
        state.adapterStatus = DEFAULT_ADAPTER_STATUS;

        maintainNoneField(state);
    } else {
        logger.error(`You removed an adapter I did not know about: ${adapter.adapterStatus.port}.`);
    }

    return state;
}

function openAdapter(state, adapter) {
    logger.info(`Opening adapter ${adapter.state.port}`);

    state.adapterStatus = adapter.state.port;
    return state;
}

function adapterOpened(state, adapter) {
    logger.info(`Adapter ${adapter.state.port} opened`);

    // Since we maintain state.api.adapters and state.adapters simultaniously
    // we use adapter index from state.api.adapters to access the "same" adapter
    // in state.adapters
    const adapterIndex = state.api.adapters.indexOf(adapter);

    state.api.selectedAdapter = adapter;

    state.selectedAdapter = adapterIndex;
    state.adapterStatus = adapter.state.port;
    state.adapterIndicator = 'on';

    return state;
}

function adapterStateChanged(state, adapter, adapterState) {
    const adapterIndex = state.api.adapters.indexOf(adapter);

    const _adapter = state.adapters[adapterIndex];
    const immutableState = apiHelper.getImmutableAdapterState(adapterState);

    state.adapters[adapterIndex] = _adapter.set('state', immutableState);

    return state;
}

function closeAdapter(state, adapter) {
    state.adapterIndicator = 'off';
    state.api.selectedAdapter = null;
    state.selectedAdapter = null;
    state.adapterStatus = DEFAULT_ADAPTER_STATUS;

    return state;
}

function adapterError(state, adapter, error) {
    logger.error(`Error on adapter ${adapter.state.port}: ${error.message}`);
    logger.debug(error.description);

    state.adapterStatus = 'Error connecting';
    state.adapterIndicator = 'error';
    state.api.selectedAdapter = null;
    state.selectedAdapter = null;
    state.errors.push(error.message);

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
    const { adapter, index } = getSelectedAdapter(state);

    state.adapters[index] = adapter.setIn(['connectedDevices', _device.instanceId], _device);
    return state;
}

function deviceDisconnected(state, device) {
    const { adapter, index } = getSelectedAdapter(state);
    state.adapters[index] = adapter.deleteIn(['connectedDevices', device.instanceId]);

    return state;
}

function deviceInitiatePairing(state, device) {
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

    state.errors.push(error.message);
    return state;
}

export default function adapter(state =
    {
        api: {
            adapters: [],
            selectedAdapter: null,
        },
        adapters: [],
        adapterStatus: DEFAULT_ADAPTER_STATUS,
        adapterIndicator: 'off',
        selectedAdapter: null, // index of selected adapter in .adapters (not api.adapters)
        errors: [],
    }, action) {
    state = Object.assign({}, state);

    const adapterSubReducers = combineReducers({
        deviceDetails,
        serverSetup,
    });
    const selectedAdapter = state.adapters[state.selectedAdapter];

    if (selectedAdapter) {
        const newSubReducerStates = adapterSubReducers({deviceDetails: selectedAdapter.deviceDetails, serverSetup: selectedAdapter.serverSetup}, action);
        state.adapters[state.selectedAdapter] = selectedAdapter.merge(newSubReducerStates);
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
        default:
            return state;
    }
}
