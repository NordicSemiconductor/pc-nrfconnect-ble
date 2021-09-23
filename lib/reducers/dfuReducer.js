/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { List, Record } from 'immutable';

import * as DfuActions from '../actions/dfuActions';

const InitialState = Record({
    api: { dfu: null },
    isDfuDialogVisible: false,
    isConfirmCloseVisible: false,
    isStarted: false,
    isCompleted: false,
    isStopping: false,
    device: null,
    filePath: '',
    packageInfo: null,
    status: '',
    fileNameBeingTransferred: '',
    percentCompleted: 0,
    throughput: {
        totalSizeKb: 0,
        kbpsPoints: List(),
        averageKbpsPoints: List(),
    },
});

const initialState = new InitialState();

function showDialog(state, device) {
    return state.set('device', device).set('isDfuDialogVisible', true);
}

function clearAndHideDialog() {
    return initialState;
}

function showConfirmCloseDialog(state, show) {
    return state.set('isConfirmCloseVisible', show);
}

function setFilePath(state, filePath) {
    return state.set('filePath', filePath);
}

function setPackageInfo(state, packageInfo) {
    return state.set('packageInfo', packageInfo);
}

function start(state) {
    return state.set('status', 'Initializing').set('isStarted', true);
}

function setStopping(state) {
    return state.set('isStopping', true);
}

function setStopped(state) {
    return state
        .set('isStopping', false)
        .set('fileNameBeingTransferred', initialState.fileNameBeingTransferred)
        .set('throughput', initialState.throughput)
        .set('percentCompleted', initialState.percentCompleted)
        .set('isStarted', false);
}

function setTransferFileStarted(state, fileName) {
    return state
        .set('fileNameBeingTransferred', fileName)
        .set('percentCompleted', initialState.percentCompleted)
        .set('throughput', initialState.throughput)
        .set('status', 'Initializing');
}

function setTransferFileCompleted(state) {
    return state
        .set('fileNameBeingTransferred', initialState.fileNameBeingTransferred)
        .set('throughput', initialState.throughput)
        .set('status', 'File completed, waiting for device');
}

function setCompleted(state) {
    return state
        .set('isCompleted', true)
        .set('isStarted', false)
        .set('percentCompleted', 100);
}

function createKbpsPoint(bytesPerSecond, completedBytes) {
    const kbPerSecond = bytesPerSecond / 1024;
    const completedKb = completedBytes / 1024;
    return {
        x: completedKb,
        y: kbPerSecond,
    };
}

function createThroughput(state, action) {
    const kbpsPoint = createKbpsPoint(
        action.bytesPerSecond,
        action.completedBytes
    );
    const averageKbpsPoint = createKbpsPoint(
        action.averageBytesPerSecond,
        action.completedBytes
    );
    return {
        totalSizeKb: action.totalBytes / 1024,
        kbpsPoints: [...state.throughput.kbpsPoints, kbpsPoint],
        averageKbpsPoints: [
            ...state.throughput.averageKbpsPoints,
            averageKbpsPoint,
        ],
    };
}

function updateProgress(oldState, action) {
    let state = oldState;
    if (!state.isStarted || !state.fileNameBeingTransferred) {
        return state;
    }
    if (action.completedBytes) {
        state = state.set('throughput', createThroughput(state, action));
    }
    if (action.percentCompleted) {
        state = state.set('percentCompleted', action.percentCompleted);
    }
    return state.set('status', 'Transferring');
}

export default function dfu(state = initialState, action) {
    switch (action.type) {
        case DfuActions.SHOW_DIALOG:
            return showDialog(state, action.device);
        case DfuActions.HIDE_DIALOG:
            return clearAndHideDialog();
        case DfuActions.SHOW_CONFIRM_CLOSE_DIALOG:
            return showConfirmCloseDialog(state, true);
        case DfuActions.HIDE_CONFIRM_CLOSE_DIALOG:
            return showConfirmCloseDialog(state, false);
        case DfuActions.SET_FILE_PATH:
            return setFilePath(state, action.filePath);
        case DfuActions.LOAD_PACKAGE_INFO_SUCCESS:
            return setPackageInfo(state, action.packageInfo);
        case DfuActions.UPDATE_PROGRESS:
            return updateProgress(state, action);
        case DfuActions.PERFORM:
            return start(state);
        case DfuActions.PERFORM_ERROR:
            return setStopped(state);
        case DfuActions.PERFORM_SUCCESS:
            return setCompleted(state);
        case DfuActions.TRANSFER_FILE_STARTED:
            return setTransferFileStarted(state, action.fileName);
        case DfuActions.TRANSFER_FILE_COMPLETED:
            return setTransferFileCompleted(state);
        case DfuActions.ABORT:
            return setStopping(state);
        case DfuActions.ABORT_SUCCESS:
            return setStopped(state);
        default:
            return state;
    }
}
