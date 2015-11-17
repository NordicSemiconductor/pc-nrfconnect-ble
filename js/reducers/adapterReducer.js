'use strict';

// const NONE_TEXT = 'None';
const DEFAULT_ADAPTER_STATUS = 'Select com port';

import Immutable, { Record, List } from 'immutable';

import * as AdapterAction from '../actions/adapterActions';
import { logger } from '../logging';

function getSelectedAdapter(state) {
    return {
        adapter: state.adapters[state.selectedAdapter],
        index: state.selectedAdapter
    };
}

function findGraphNode(state, nodeId) {
    const { adapter } = getSelectedAdapter(state);

    return adapter.graph.find(function(node) {
        return node.id === nodeId;
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

// State records
const AdapterInitialState = Record({
    port: null,
    state: null,
    graph: List(),
    graphIdCounter: 0
});

function addAdapter(state, adapter) {
    let retval = Object.assign({}, state);

    retval.api.adapters.push(adapter);

    let newAdapter = new AdapterInitialState();
    let newGraph = Immutable.List.of({ id: 'central', ancestorOf: [] });

    newAdapter = newAdapter.merge({
        port: adapter.state.port,
        state: adapter.state,
        graph: newGraph,
        graphIdCounter: 0,
    });

    retval.adapters.push(newAdapter);

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
        logger.error(`You removed an adapter I did not know about: ${adapter.adapterStatus.port}.`);
    }

    return retval;
}

function openAdapter(state, adapter) {
    logger.info(`Opening adapter ${adapter.state.port}`);

    let retval = Object.assign({}, state);
    retval.adapterStatus = adapter.state.port;
    return retval;
}

function adapterOpened(state, adapter) {
    const retval = Object.assign({}, state);

    logger.info(`Adapter ${adapter.state.port} opened`);

    // Since we maintain retval.api.adapters and retval.adapters simultaniously
    // we use adapter index from retval.api.adapters to access the "same" adapter
    // in retval.adapters
    const adapterIndex = retval.api.adapters.indexOf(adapter);

    retval.api.selectedAdapter = adapter;

    retval.selectedAdapter = adapterIndex;
    retval.adapterStatus = adapter.state.port;
    retval.adapterIndicator = 'on';

    return retval;
}

function adapterStateChanged(state, adapter, adapterState) {
    const adapterIndex = state.api.adapters.indexOf(adapter);

    let _adapter = state.adapters[adapterIndex];
    state.adapters[adapterIndex] = _adapter.update('state', state => adapterState);
    return state;
}

function closeAdapter(state, adapter) {
    const retval = Object.assign({}, state);

    retval.adapterIndicator = 'off';
    retval.api.selectedAdapter = null;
    retval.selectedAdapter = null;
    retval.adapterStatus = DEFAULT_ADAPTER_STATUS;
    retval.graphIdCounter = 0;

    return retval;
}

function adapterError(state, adapter, error) {
    logger.error(`Error on adapter ${adapter.state.port}: ${error.message}`);
    logger.debug(error.description);

    const retval = Object.assign({}, state);
    retval.adapterStatus = 'Error connecting';
    retval.adapterIndicator = 'error';
    retval.api.selectedAdapter = null;
    retval.selectedAdapter = null;
    retval.errors.push(error.message);

    return retval;
}

function deviceConnect(state, device) {
    const retval = Object.assign({}, state);

    return retval;
}

function deviceConnected(state, device) {
    if (device.address === undefined) {
        return state;
    }

    // TODO: Shallow copy my friend; we need to look into how to make children immutable.
    const retval = Object.assign({}, state);
    const { adapter, index } = getSelectedAdapter(retval);

    const oldNode = adapter.graph.find(function(node) {
        if (node.device !== undefined) {
            return node.device.instanceId === device.instanceId;
        } else {
            return false;
        }
    });

    // Only add a new node if does not exist in the graph
    if (oldNode !== undefined) {
        oldNode.device.connected = true;
    } else {
        const graphIdCounter = adapter.get('graphIdCounter');
        const newNodeId = 'node' + graphIdCounter;

        retval.adapters[index] =
            retval.adapters[index]
                .update('graph', graph => graph.push({
                    id: newNodeId,
                    device: device }));

        retval.adapters[index] =
            retval.adapters[index]
                .update('graphIdCounter', graphIdCounter => ++graphIdCounter);

        const centralNode = findGraphNode(retval, 'central');

        if(centralNode === undefined) {
            logger.silly('Central node not found.');
            return retval;
        }

        centralNode.ancestorOf.push(newNodeId);
    }

    return retval;
}

function addError(state, error) {
    if(error.message === undefined) {
        console.log(`Error does not contain a message! Something is wrong!`);
        return;
    }

    logger.error(error.message);

    if(error.description) {
        logger.debug(error.description);
    }

    const retval = Object.assign({}, state);
    retval.errors.push(error.message);
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
        selectedAdapter: null, // index of selected adapter in .adapters (not api.adapters)
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
            return adapterStateChanged(state, action.adapter, action.state);
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
