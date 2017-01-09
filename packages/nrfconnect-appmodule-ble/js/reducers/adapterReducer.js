/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

const DEFAULT_ADAPTER_STATUS = 'Select serial port';

import { List, Set, Record } from 'immutable';
import { combineReducers } from 'redux';

import * as apiHelper from '../utils/api';

import deviceDetails from './deviceDetailsReducer';
import serverSetup from './serverSetupReducer';
import security from './securityReducer';

import * as AdapterAction from '../actions/adapterActions';
import * as DeviceDetailsActions from '../actions/deviceDetailsActions';
import * as ServerSetupActions from '../actions/serverSetupActions';
import * as SecurityActions from '../actions/securityActions';

import { logger } from '../logging';

const ImmutableRoot = Record({
    api: { adapters: [], selectedAdapter: null },
    adapters: List(),
    adapterStatus: DEFAULT_ADAPTER_STATUS,
    adapterIndicator: 'off',
    selectedAdapter: null, // Index of selected adapter in .adapters (not api.adapters)
    autoConnUpdate: true,
    ignoredDeviceAddresses: Set(),
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
    return state.set('adapters', state.adapters.push(apiHelper.getImmutableAdapter(adapter)));
}

function removeAdapter(state, adapter) {
    const adapterIndex = state.api.adapters.indexOf(adapter);

    if (adapterIndex === -1) {
        logger.error(`You removed an adapter I did not know about: ${adapter.adapterStatus.port}.`);
        return state;
    }

    state.api.adapters.splice(adapterIndex, 1);

    if (adapterIndex === state.selectedAdapter) {
        state = state.set('adapterIndicator', 'off');
        state = state.set('selectedAdapter', null);
        state = state.set('adapterStatus', DEFAULT_ADAPTER_STATUS);
    } else if (adapterIndex < state.selectedAdapter) {
        state = state.set('selectedAdapter', state.selectedAdapter - 1);
    }

    state = state.deleteIn(['adapters', adapterIndex]);

    return state;
}

function openAdapter(state, adapter) {
    logger.info(`Opening adapter connected to ${adapter.state.port}`);
    state = state.set('adapterStatus', adapter.state.port);
    return state;
}

function adapterOpened(state, adapter) {
    logger.info(`Adapter connected to ${adapter.state.port} opened`);

    // Since we maintain state.api.adapters and state.adapters simultaneously
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

    const index = state.api.adapters.indexOf(adapter);
    state = state.setIn(['adapters', index, 'isServerSetupApplied'], false);
    state = state.updateIn(['adapters', index, 'connectedDevices'], connectedDevices => connectedDevices.clear());

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
    state = state.set('errors', state.errors.push(error.message));

    return state;
}

function adapterResetPerformed(state, adapter) {
    logger.info(`Reset performed on adapter ${adapter.state.port}`);

    const { index } = getSelectedAdapter(state);
    if (index !== undefined && index !== null)
    {
        state = state.setIn(['adapters', index, 'isServerSetupApplied'], false);
        state = state.updateIn(['adapters', index, 'connectedDevices'], connectedDevices => connectedDevices.clear());
    }

    return state;
}

function adapterScanTimeout(state, adapter) {
    logger.info(`Scanning timed out on adapter ${adapter.state.port}`);
    return state;
}

function adapterAdvertisementTimeout(state, adapter) {
    logger.info(`Advertisement timed out on adapter ${adapter.state.port}`);
    return state;
}

function deviceConnect(state, device) {
    logger.info('Connecting to device');
    return state;
}

function deviceConnected(state, device) {
    if (device.address === undefined) {
        return state;
    }

    logger.info(`Connected to device ${device.address}`);

    const _device = apiHelper.getImmutableDevice(device);
    const { index } = getSelectedAdapter(state);

    state = state.updateIn(['adapters', index, 'connectedDevices'],
        connectedDevices => connectedDevices.set(_device.instanceId, _device));

    const bonded = state.getIn(['adapters', index, 'security', 'bondStore', device.address]);
    if (bonded) {
        state = state.setIn(['adapters', index, 'connectedDevices', _device.instanceId, 'bonded'], true);
    }

    return state;
}

function deviceConnectCanceled(state) {
    logger.info('Connect canceled');
    return state;
}

function connectedDeviceUpdated(state, device) {
    if (device.address === undefined) {
        return state;
    }

    logger.info(`Connection parameters updated for device ${device.address}: interval ${device.minConnectionInterval}ms, timeout ${device.connectionSupervisionTimeout}ms, latency: ${device.slaveLatency}`);

    const { index } = getSelectedAdapter(state);

    const nodePath = ['adapters', index, 'connectedDevices', device.instanceId];
    state = state.setIn(nodePath.concat('minConnectionInterval'), device.minConnectionInterval);
    state = state.setIn(nodePath.concat('maxConnectionInterval'), device.maxConnectionInterval);
    state = state.setIn(nodePath.concat('slaveLatency'), device.slaveLatency);
    state = state.setIn(nodePath.concat('connectionSupervisionTimeout'), device.connectionSupervisionTimeout);
    return state;
}

function deviceDisconnected(state, device, reason) {
    logger.info(`Disconnected from device ${device.address}, reason: ${reason}`);
    const { index } = getSelectedAdapter(state);
    return state.deleteIn(['adapters', index, 'connectedDevices', device.instanceId]);
}

function deviceInitiatePairing(state, device) {
    logger.info(`Pairing initiated`);
    return state;
}

function deviceSecurityChanged(state, device, parameters) {
    if (device.address === undefined) {
        return state;
    }

    const { index } = getSelectedAdapter(state);

    logger.info(`Security updated, mode:${parameters.securityMode}, level:${parameters.securityLevel} `);

    state = state.setIn(['adapters', index, 'connectedDevices', device.instanceId, 'securityMode'], parameters.securityMode);
    state = state.setIn(['adapters', index, 'connectedDevices', device.instanceId, 'securityLevel'], parameters.securityLevel);

    return state;
}

function disableDeviceEvents(state, deviceAddress) {
    return state.set('ignoredDeviceAddresses', state.ignoredDeviceAddresses.add(deviceAddress));
}

function enableDeviceEvents(state, deviceAddress) {
    return state.set('ignoredDeviceAddresses', state.ignoredDeviceAddresses.remove(deviceAddress));
}

function bondStoreUpdated(state) {
    const { index } = getSelectedAdapter(state);

    const devices = state.getIn(['adapters', index, 'connectedDevices']);

    devices.map(device => {
        const bonded = state.getIn(['adapters', index, 'security', 'bondStore', device.address]) ? true : false;
        state = state.setIn(['adapters', index, 'connectedDevices', device.instanceId, 'bonded'], bonded);
    });

    return state;
}

function discoveredDeviceName(state, device, value) {
    if (!value) {
        return state;
    }

    if (device.address === undefined) {
        return state;
    }

    const nameBuffer = new Buffer(value);
    const name = nameBuffer.toString('utf8');

    const { index } = getSelectedAdapter(state);

    state = state.setIn(['adapters', index, 'connectedDevices', device.instanceId, 'name'], name);
    return state;
}

function addError(state, error) {
    if (error.message === undefined) {
        console.log(`Error does not contain a message! Something is wrong!`);
        return state;
    }

    logger.error(error.message);

    if (error.description) {
        logger.debug(error.description);
    }

    state = state.update('errors', errors => errors.push(error.message));
    return state;
}

function toggleAutoConnUpdate(state) {
    return state.set('autoConnUpdate', !state.autoConnUpdate);
}

function addBondInfo(state, device, params) {
    const { index } = getSelectedAdapter(state);
    state = state.setIn(['adapters', index, 'connectedDevices', device.instanceId, 'bonded'], true);
    return state;
}

function deleteBondInfo(state) {
    const { index } = getSelectedAdapter(state);

    const devices = state.getIn(['adapters', index, 'connectedDevices']);

    devices.map(device => {
        state = state.setIn(['adapters', index, 'connectedDevices', device.instanceId, 'bonded'], false);
    });

    return state;
}

function serverSetupApplied(state) {
    const { adapter, index } = getSelectedAdapter(state);

    return state.setIn(['adapters', index, 'isServerSetupApplied'], true);
}

export default function adapter(state = getImmutableRoot(), action) {
    const adapterSubReducers = combineReducers({
        deviceDetails,
        serverSetup,
        security,
    });

    if (state.selectedAdapter !== undefined && state.selectedAdapter !== null) {
        const selectedAdapter = state.getIn(['adapters', state.selectedAdapter]);

        if (selectedAdapter) {
            const newSubReducerStates = adapterSubReducers(
                {
                    deviceDetails: selectedAdapter.deviceDetails,
                    serverSetup: selectedAdapter.serverSetup,
                    security: selectedAdapter.security,
                }, action);

            state = state.mergeIn(['adapters', state.selectedAdapter], newSubReducerStates);
        }
    }

    switch (action.type) {
        case AdapterAction.ADAPTER_OPEN:
            return openAdapter(state, action.adapter);
        case AdapterAction.ADAPTER_OPENED:
            return adapterOpened(state, action.adapter);
        case AdapterAction.ADAPTER_CLOSED:
            return closeAdapter(state, action.adapter);
        case AdapterAction.ADAPTER_ADDED:
            return addAdapter(state, action.adapter);
        case AdapterAction.ADAPTER_REMOVED:
            return removeAdapter(state, action.adapter);
        case AdapterAction.ADAPTER_ERROR:
            return adapterError(state, action.adapter, action.error);
        case AdapterAction.ADAPTER_STATE_CHANGED:
            return adapterStateChanged(state, action.adapter, action.state);
        case AdapterAction.ADAPTER_RESET_PERFORMED:
            return adapterResetPerformed(state, action.adapter);
        case AdapterAction.ADAPTER_SCAN_TIMEOUT:
            return adapterScanTimeout(state, action.adapter);
        case AdapterAction.ADAPTER_ADVERTISEMENT_TIMEOUT:
            return adapterAdvertisementTimeout(state, action.adapter);
        case AdapterAction.ERROR_OCCURED:
            return addError(state, action.error);
        case AdapterAction.DEVICE_CONNECT:
            return deviceConnect(state, action.device);
        case AdapterAction.DEVICE_CONNECTED:
            return deviceConnected(state, action.device);
        case AdapterAction.DEVICE_CONNECT_CANCELED:
            return deviceConnectCanceled(state);
        case AdapterAction.DEVICE_DISCONNECTED:
            return deviceDisconnected(state, action.device, action.reason);
        case AdapterAction.DEVICE_INITIATE_PAIRING:
            return deviceInitiatePairing(state, action.device);
        case AdapterAction.DEVICE_CONNECTION_PARAMS_UPDATED:
            return connectedDeviceUpdated(state, action.device);
        case AdapterAction.DEVICE_SECURITY_CHANGED:
            return deviceSecurityChanged(state, action.device, action.parameters);
        case AdapterAction.DEVICE_TOGGLE_AUTO_CONN_UPDATE:
            return toggleAutoConnUpdate(state);
        case AdapterAction.DEVICE_ADD_BOND_INFO:
            return addBondInfo(state, action.device, action.parameters);
        case AdapterAction.DEVICE_DISABLE_EVENTS:
            return disableDeviceEvents(state, action.deviceAddress);
        case AdapterAction.DEVICE_ENABLE_EVENTS:
            return enableDeviceEvents(state, action.deviceAddress);
        case SecurityActions.SECURITY_DELETE_BOND_INFO:
            return deleteBondInfo(state);
        case DeviceDetailsActions.DISCOVERED_DEVICE_NAME:
            return discoveredDeviceName(state, action.device, action.value);
        case ServerSetupActions.APPLIED_SERVER:
            return serverSetupApplied(state, action.adapter);
        default:
            return state;
    }
}
