/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

import { Record, OrderedMap, List } from 'immutable';
import { logger } from 'nrfconnect/core';

import { persistentStore } from '../common/Persistentstore';
import * as DiscoveryAction from '../actions/discoveryActions';
import * as AdapterAction from '../actions/adapterActions';
import * as apiHelper from '../utils/api';

export const DiscoveryOptions = params =>
    new Record({
        // bare record?
        expanded: false,
        sortByRssi: false,
        filterString: '',
        scanInterval: 100,
        scanWindow: 20,
        scanTimeout: persistentStore.scanTimeout(), // gjøre disse til new recod ?
        activeScan: persistentStore.activeScan(), // må fikse feilmelding
        filterRegexp: '',
    })(params);

const getInitialState = () =>
    new Record({
        devices: OrderedMap(),
        errors: List(),
        options: DiscoveryOptions(),
    })();

function scanStarted(state) {
    logger.info('Scan started');
    return state;
}

function scanStopped(state) {
    logger.info('Scan stopped');
    return state;
}

function applyFilters(oldState) {
    let state = oldState;

    if (state.options.sortByRssi) {
        const orderedDevices = state.devices.sort((dev1, dev2) => {
            if (dev1.rssi < dev2.rssi) return 1;
            if (dev1.rssi > dev2.rssi) return -1;
            return 0;
        });
        state = state.set('devices', orderedDevices);
    }

    return state;
}

function deviceDiscovered(oldState, device) {
    let state = oldState;
    let newDevice = apiHelper.getImmutableDevice(device);
    const existingDevice = state.devices.get(device.address);

    if (existingDevice) {
        // Keep exising name if new name is empty
        if (existingDevice.name !== '' && !device.name) {
            newDevice = newDevice.setIn(['name'], existingDevice.name);
        }

        // Keep existing list of services if new list is empty
        if (existingDevice.services.size > 0 && device.services.length === 0) {
            newDevice = newDevice.setIn(['services'], existingDevice.services);
        }
        newDevice = newDevice.setIn(['isExpanded'], existingDevice.isExpanded);

        // Merge existing adData with new to keep everything that is not updated
        const adData = existingDevice.adData.merge(newDevice.adData);
        newDevice = newDevice.mergeIn(['adData'], adData);
    }
    if (newDevice.name === null) {
        newDevice = newDevice.setIn(['name'], '');
    }

    state = state.setIn(['devices', device.address], newDevice);

    state = applyFilters(state);

    return state;
}

function addError(state, error) {
    return state.set('errors', state.errors.push(error));
}

function clearList(state) {
    return state.set('devices', state.devices.clear());
}

function deviceConnect(state, device) {
    if (state.devices.get(device.address)) {
        return state.setIn(['devices', device.address, 'isConnecting'], true);
    }
    return state;
}

function deviceConnected(state, device) {
    if (state.devices.get(device.address)) {
        return state
            .setIn(['devices', device.address, 'isConnecting'], false)
            .setIn(['devices', device.address, 'connected'], true);
    }
    return state;
}

function deviceDisconnected(state, device) {
    if (state.devices.get(device.address)) {
        return state.setIn(['devices', device.address, 'connected'], false);
    }
    return state;
}

function deviceConnectTimeout(state, deviceAddress) {
    logger.info('Connection to device timed out');
    return state.setIn(
        ['devices', deviceAddress.address, 'isConnecting'],
        false
    );
}

function deviceCancelConnect(state) {
    const newDevices = state.devices.map(device =>
        device.set('isConnecting', false)
    );
    return state.set('devices', newDevices);
}

function toggleExpanded(state, deviceAddress) {
    return state.updateIn(
        ['devices', deviceAddress, 'isExpanded'],
        value => !value
    );
}

function toggleOptionsExpanded(state) {
    return state.updateIn(['options', 'expanded'], value => !value);
}

function discoverySetOptions(state, options) {
    const newOptions = {
        ...options,
        filterRegexp: new RegExp(options.filterString, 'i'),
    };
    return applyFilters(state.set('options', DiscoveryOptions(newOptions))); // isåfall endres tilbake
}

function setTimeout(state, value) {
    persistentStore.setScanTimeout(+value);
    return state.setIn(['options', 'scanTimeout'], +value);
}

function toggleActiveScan(state) {
    persistentStore.setActiveScan(!state.options.activeScan);
    return state.updateIn(['options', 'activeScan'], value => !value);
}

export default function discovery(state = getInitialState(), action) {
    switch (action.type) {
        case DiscoveryAction.DISCOVERY_CLEAR_LIST:
            return clearList(state);
        case DiscoveryAction.ERROR_OCCURED:
            return addError(state, action.error);
        case DiscoveryAction.DISCOVERY_SCAN_STARTED:
            return scanStarted(state);
        case DiscoveryAction.DISCOVERY_SCAN_STOPPED:
            return scanStopped(state);
        case DiscoveryAction.DISCOVERY_TOGGLE_EXPANDED:
            return toggleExpanded(state, action.deviceAddress);
        case DiscoveryAction.DISCOVERY_TOGGLE_OPTIONS_EXPANDED:
            return toggleOptionsExpanded(state);
        case DiscoveryAction.DISCOVERY_SET_OPTIONS:
            return discoverySetOptions(state, action.options);
        case DiscoveryAction.DISCOVERY_SET_TIMEOUT:
            return setTimeout(state, action.value);
        case DiscoveryAction.DISCOVERY_ACTIVE_SCAN:
            return toggleActiveScan(state);
        case AdapterAction.DEVICE_DISCOVERED:
            return deviceDiscovered(state, action.device);
        case AdapterAction.DEVICE_CONNECT:
            return deviceConnect(state, action.device);
        case AdapterAction.DEVICE_CONNECTED:
            return deviceConnected(state, action.device);
        case AdapterAction.DEVICE_DISCONNECTED:
            return deviceDisconnected(state, action.device);
        case AdapterAction.DEVICE_CONNECT_TIMEOUT:
            return deviceConnectTimeout(state, action.deviceAddress);
        case AdapterAction.DEVICE_CANCEL_CONNECT:
            return deviceCancelConnect(state);
        case AdapterAction.ADAPTER_RESET_PERFORMED:
            return getInitialState();
        case AdapterAction.ADAPTER_CLOSED:
            return getInitialState();
        default:
            return state;
    }
}
