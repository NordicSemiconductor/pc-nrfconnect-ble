'use strict';

// const NONE_TEXT = 'None';
const DEFAULT_ADAPTER_STATUS = 'Select com port';

import * as AdapterAction from '../actions/adapterActions';

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
    let retval = Object.assign({}, state);

    retval.api.adapters.push(adapter);

    retval.adapters.push({
        port: adapter.adapterState.port,
        state: adapter.adapterState
    });

    maintainNoneField(retval);
    return retval;
}

function removeAdapter(state, adapter) {
    let retval = Object.assign({}, state);
    const adapterIndex = retval.api.adapters.indexOf(adapter);

    if(adapterIndex !== -1) {
        retval.api.adapters.splice(adapterIndex, 1);
        retval.adapters.splice(adapterIndex, 1);
        retval.adapterIndicator = 'off';
        retval.selectedAdapter = null;
        retval.adapterStatus = DEFAULT_ADAPTER_STATUS;

        maintainNoneField(retval);
    } else {
        console.log(`You removed an adapter I did not know about: ${adapter.adapterStatus.port}.`);
    }

    return retval;
}

function openAdapter(state, adapter) {
    let retval = Object.assign({}, state);
    retval.adapterStatus = adapter.adapterState.port;
    return retval;
}

function adapterOpened(state, adapter) {
    let retval = Object.assign({}, state);

    // Since we maintain retval.api.adapters and retval.adapters simultaniously
    // we use adapter index from retval.api.adapters to access the "same" adapter
    // in retval.adapters
    const adapterIndex = retval.api.adapters.indexOf(adapter);

    retval.api.selectedAdapter = adapter;
    retval.selectedAdapter = adapterIndex;
    retval.adapterStatus = adapter.adapterState.port;
    retval.adapterIndicator = 'on';
    return retval;
}

function adapterStateChanged(state, adapter, adapterState) {
    let retval = Object.assign({}, state);

    const adapterIndex = retval.api.adapters.indexOf(adapter);
    retval.adapters[adapterIndex].state = adapterState;

    return retval;
}

function closeAdapter(state, adapter) {
    let retval = Object.assign({}, state);
    retval.adapterIndicator = 'off';
    retval.api.selectedAdapter = null;
    retval.selectedAdapter = null;
    retval.adapterStatus = DEFAULT_ADAPTER_STATUS;
    return retval;
}

function adapterError(state, adapter, error) {
    let retval = Object.assign({}, state);
    retval.adapterStatus = 'Error connecting';
    retval.adapterIndicator = 'error';
    retval.api.selectedAdapter = null;
    retval.selectedAdapter = null;
    retval.errors.push(error.message);
    return retval;
}

function deviceConnect(state, device) {
    let retval = Object.assign({}, state);
    return retval;
}

function deviceConnected(state, device) {
    let retval = Object.assign({}, state);
    return retval;
}

function addError(state, error) {
    let retval = Object.assign({}, state);
    retval.errors.push(error);
    return retval;
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
        selectedAdapter: null,
        errors: [],
    }, action) {
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
            return adapterStateChanged(state, action.adapter, action.adapterState);
        case AdapterAction.ERROR_OCCURED:
            return addError(state, action.error);
        case AdapterAction.DEVICE_CONNECT:
            return deviceConnect(state, action.device);
        case AdapterAction.DEVICE_CONNECTED:
            return deviceConnected(state, action.device);
        default:
            return state;
    }
}
