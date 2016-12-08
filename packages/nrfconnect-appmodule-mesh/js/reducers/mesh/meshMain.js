/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

'use strict';

import {List, Record, Map} from 'immutable';

import * as MeshAdapterAction from '../../actions/mesh/meshAdapterActions';
import {logger} from '../../logging';
import {toHexString} from '../../utils/stringUtil';

const ImmutableRoot = Record({
    expandSlot: List(),
    handleAndData: Map(),
    currentPort: '',
    isInitialized: false,
    initValues: {
        MESH_ACCESS_ADDR: '',
        MESH_INTERVAL_MIN_MS: 0,
        MESH_CHANNEL: 0,
    },
    firmwareVersion: 'unknown',
    isHandleTableVisible: false,
    isBroadcasting: true,
});

function getImmutableRoot() {
    return new ImmutableRoot();
}

function cleanOutHandleTable(state) {
    return state.set('handleAndData', new Map());
}

function setIsInitialized(state, value) {
    return state.set('isInitialized', value);
}

function setCurrentPort(state, port) {
    return state.set('currentPort', port);
}

function startBroadcast(state) {
    return state.set('isBroadcasting', true);
}

function stopBroadcast(state) {
    return state.set('isBroadcasting', false);
}

function expandslot(state, value) {
    const expandSlotValue = (state.getIn(['expandSlot', value]) !== undefined) ? state.getIn(['expandSlot', value]) : false;
    return state.setIn(['expandSlot', value], !expandSlotValue);
}

function toggleHandleTableVisible(state, visable) {
    let show = false;

    if (visable !== undefined) {
        show = visable
    } else {
        show = !state.get('isHandleTableVisible');
    }
    return state.set('isHandleTableVisible', show);
}

function closePort(state, port) {
    return state.set('currentPort', '');
}

//Maybe seperate this to 3 diff funcs?
function init(state, channel, min, adr) {
    let initValues = {
        MESH_CHANNEL: (channel !== '') ? channel : state.initValues.MESH_CHANNEL,
        MESH_INTERVAL_MIN_MS: (min !== '') ? min : state.initValues.MESH_INTERVAL_MIN_MS,
        MESH_ACCESS_ADDR: (adr !== '') ? adr : state.initValues.MESH_ACCESS_ADDR,
    };
    return state.set('initValues', initValues);
}

function meshFirmware(state, firmwareVersion) {
    let versionString = `v${firmwareVersion[0]}.${firmwareVersion[1]}.${firmwareVersion[2]}`;
    logger.info(`version: ${versionString}`)
    let newState = state.set('firmwareVersion', versionString);
    return newState;
}

function addHandleAndData(state, handle, data, isFlagSet, isTxSet) {
    if (state.getIn(['handleAndData', handle]) != undefined) {
        let isFlagSet = state.getIn(['handleAndData', handle]).isFlagSet || '';
        let isTxSet = state.getIn(['handleAndData', handle]).isTxSet || '';
        let timestamp = state.getIn(['handleAndData', handle]).timestamp || '';

        logger.info(`Updated handle: 0x${handle.toString(16).toUpperCase()} with data: 0x${toHexString(data).toUpperCase()} and isFlagSet: ${isFlagSet} and isTxSet: ${isTxSet}`);
        return state.setIn(['handleAndData', handle], { data: data, isFlagSet: isFlagSet, isTxSet: isTxSet, timestamp: '' });

    } else {

        logger.info(`Added handle: 0x${handle.toString(16).toUpperCase()} with data: 0x${toHexString(data).toUpperCase()} and isFlagSet: ${isFlagSet} and isTxSet: ${isTxSet}`);
        return state.setIn(['handleAndData', handle], { data: data, isFlagSet: isFlagSet, isTxSet: isTxSet, timestamp: '' });
    }
}

function removeHandleAndData(state, handle) {
    logger.info(`Removed handle: 0x${handle.toString(16).toUpperCase()} `);
    return state.deleteIn(['handleAndData', handle]).remove();
}

function setFlagOnHandle(state, handle, set) {
    logger.info(`Sat falg on handle: 0x${handle.toString(16).toUpperCase()} with value ${set} `);
    let data = state.getIn(['handleAndData', handle]).data || '';
    let timestamp = state.getIn(['handleAndData', handle]).timestamp || '';
    let isTxSet = state.getIn(['handleAndData', handle]).isTxSet || false;

    return state.setIn(['handleAndData', handle], { data: data, isFlagSet: set, isTxSet: isTxSet, timestamp: timestamp });
}

function setEventTxOnHandle(state, handle, set) {
    logger.info(`Sat event Tx on handle: 0x${handle.toString(16).toUpperCase()} with value ${set} `);
    let data = state.getIn(['handleAndData', handle]).data || '';
    let timestamp = state.getIn(['handleAndData', handle]).timestamp || '';
    let isFlagSet = false;
    isFlagSet = state.getIn(['handleAndData', handle]).isFlagSet || '';
    return state.setIn(['handleAndData', handle], { data: data, isFlagSet: isFlagSet, isTxSet: set, timestamp: timestamp });
}

function updateEventTxTimeOnHandle(state, handle, time) {
    if (state.getIn(['handleAndData', handle]) === undefined) {
        console.assert();
    }

    let data = state.getIn(['handleAndData', handle]).data || '';
    let isFlagSet = state.getIn(['handleAndData', handle]).isFlagSet || '';
    let isTxSet = state.getIn(['handleAndData', handle]).isTxSet || '';

    return state.setIn(['handleAndData', handle], {
        data: data,
        isFlagSet: isFlagSet,
        isTxSet: isTxSet,
        timestamp: time,
    });
}

function showHandleTable(state) {
    if (!state.get('isHandleTableVisible')) {
        return state.set('isHandleTableVisible', true);
    } else {
        return state;
    }
}

export default function mesh(state = getImmutableRoot(), action) {
    switch (action.type) {
        case MeshAdapterAction.MESH_SHOW_HANDLE_TABLE:
            return showHandleTable(state);
        case MeshAdapterAction.MESH_EXPANDSLOT:
            return expandslot(state, action.value);
        case MeshAdapterAction.MESH_INIT:
            return init(state, action.channel, action.min, action.adr);
        case MeshAdapterAction.MESH_FIRMWARE:
            return meshFirmware(state, action.meshFirmware);
        case MeshAdapterAction.MESH_CURRENT_PORT:
            return setCurrentPort(state, action.port);
        case MeshAdapterAction.MESH_TOGGLE_IS_ININITIALIZED:
            return setIsInitialized(state, action.value);
        case MeshAdapterAction.MESH_SAVE_HANDLES_WITH_DATA:
            return addHandleAndData(state, action.handle, action.data, action.isFlagSet, action.isTxSet);
        case MeshAdapterAction.MESH_REMOVE_HANDLE_WITH_DATA:
            return removeHandleAndData(state, action.handle);
        case MeshAdapterAction.MESH_TOGGLE_HANDLE_DATA_TABLE:
            return toggleHandleTableVisible(state, action.visable);
        case MeshAdapterAction.MESH_SET_FLAG_ON_HANDLE:
            return setFlagOnHandle(state, action.handle, action.set);
        case MeshAdapterAction.MESH_SET_EVENT_TX_ON_HANDLE:
            return setEventTxOnHandle(state, action.handle, action.set);
        case MeshAdapterAction.MESH_CLEAN_HANDLE_TABLE:
            return cleanOutHandleTable(state);
        case MeshAdapterAction.MESH_CLOSE_PORT:
            return closePort(state, action.port);
        case MeshAdapterAction.MESH_START_BROADCAST:
            return startBroadcast(state);
        case MeshAdapterAction.MESH_STOP_BROADCAST:
            return stopBroadcast(state);
        case MeshAdapterAction.MESH_TIMESTAMP_UPDATED_ON_HANDLE:
            return updateEventTxTimeOnHandle(state, action.handle, action.time);
        default:
            return state;
    }
}
