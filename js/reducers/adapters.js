'use strict';

import {
    ADAPTER_OPEN,
    ADAPTER_OPENED,
    ADAPTER_CLOSE,
    ADAPTER_ADDED,
    ADAPTER_REMOVED,
    ADAPTER_ERROR,
    ERROR_OCCURED } from '../actions/adapterActions';

const NONE_TEXT = 'None';
const DEFAULT_ADAPTER_STATUS = 'Select com port';

function maintainNoneField(state) {
    const noneIndex = state.adapters.indexOf(NONE_TEXT);

    if(noneIndex != -1 && state.adapters.length > 0) {
        state.adapters.splice(noneIndex, 1);
    } else if(noneIndex == -1 && state.adapters.length === 0) {
        state.adapters.push(NONE_TEXT);
    }
}

function addAdapter(state, adapter) {
    let retval = Object.assign({}, state);
    retval.adapters.push(adapter);
    maintainNoneField(retval);
    return retval;
}

function removeAdapter(state, adapter) {
    let retval = Object.assign({}, state);
    const adapterIndex = retval.adapters.indexOf(adapter);

    if(adapterIndex !== -1) {
        retval.adapters.splice(adapterIndex, 1);
        maintainNoneField(retval);
    } else {
        console.log(`You removed an adapter I did not know about: ${adapter.adapterStatus.port}.`);
    }

    return retval;
}

function openAdapter(state, adapter) {
    let retval = Object.assign({}, state);
    retval.selectedAdapter = adapter;
    retval.adapterStatus = adapter.adapterState.port;
    return retval;
}

function adapterOpened(state, adapter) {
    let retval = Object.assign({}, state);
    retval.selectedAdapter = adapter;
    retval.adapterStatus = adapter.adapterState.port;
    retval.adapterIndicator = 'on';
    return retval;
}

function closeAdapter(state, adapter) {
    let retval = Object.assign({}, state);
    retval.adapterIndicator = 'off';
    retval.selectedAdapter = null;
    retval.adapterStatus = DEFAULT_ADAPTER_STATUS;
    return retval;
}

function adapterError(state, adapter, error) {
    let retval = Object.assign({}, state);
    retval.adapterStatus = 'Error connecting';
    retval.adapterIndicator = 'error';
    retval.errors.push(error.message);
    return retval;
}

function addError(state, error) {
    let retval = Object.assign({}, state);
    retval.errors.push(error);
    return retval;
}

export default function adapter(state = {
        adapters: [NONE_TEXT],
        adapterStatus: DEFAULT_ADAPTER_STATUS,
        adapterIndicator: 'off',
        selectedAdapter: null,
        errors: []
        },
        action) {
    switch (action.type) {
        case ADAPTER_OPEN:
            return openAdapter(state, action.adapter);
        case ADAPTER_OPENED:
            return adapterOpened(state, action.adapter);
        case ADAPTER_CLOSE:
            return closeAdapter(state, action.adapter);
        case ADAPTER_ADDED:
            return addAdapter(state, action.adapter);
        case ADAPTER_REMOVED:
            return removeAdapter(state, action.adapter);
        case ADAPTER_ERROR:
            return adapterError(state, action.adapter, action.error);
        case ERROR_OCCURED:
            return addError(state, action.error);
        default:
            return state;
    }
}
