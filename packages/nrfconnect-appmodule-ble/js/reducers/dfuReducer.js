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

import { Record, List } from 'immutable';

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
    state = state.set('device', device);
    return state.set('isDfuDialogVisible', true);
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
    state = state.set('status', 'Initializing');
    return state.set('isStarted', true);
}

function setStopping(state) {
    return state.set('isStopping', true);
}

function setStopped(state) {
    state = state.set('isStopping', false);
    state = state.set('fileNameBeingTransferred', initialState.fileNameBeingTransferred);
    state = state.set('throughput', initialState.throughput);
    state = state.set('percentCompleted', initialState.percentCompleted);
    return state.set('isStarted', false);
}

function setTransferFileStarted(state, fileName) {
    state = state.set('fileNameBeingTransferred', fileName);
    state = state.set('percentCompleted', initialState.percentCompleted);
    state = state.set('throughput', initialState.throughput);
    state = state.set('status', 'Initializing');
    return state;
}

function setTransferFileCompleted(state) {
    state = state.set('fileNameBeingTransferred', initialState.fileNameBeingTransferred);
    state = state.set('throughput', initialState.throughput);
    state = state.set('status', 'File completed, waiting for device');
    return state;
}

function setCompleted(state) {
    state = state.set('isCompleted', true);
    return state.set('isStarted', false);
}

function updateProgress(state, action) {
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

function createThroughput(state, action) {
    const kbpsPoint = createKbpsPoint(action.bytesPerSecond, action.completedBytes);
    const averageKbpsPoint = createKbpsPoint(action.averageBytesPerSecond, action.completedBytes);
    return {
        totalSizeKb: action.totalBytes/1024,
        kbpsPoints: [...state.throughput.kbpsPoints, kbpsPoint],
        averageKbpsPoints: [...state.throughput.averageKbpsPoints, averageKbpsPoint],
    };
}

function createKbpsPoint(bytesPerSecond, completedBytes) {
    const kbPerSecond = bytesPerSecond / 1024;
    const completedKb = completedBytes / 1024;
    return {
        x: completedKb,
        y: kbPerSecond,
    };
}

export default function app(state = initialState, action) {
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
