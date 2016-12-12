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

import { api } from 'pc-ble-driver-js';

import { logger } from '../logging';
import { disableDeviceEvents, enableDeviceEvents } from './adapterActions';
import { showErrorDialog } from './errorDialogActions';

export const SHOW_DIALOG = 'DFU_SHOW_DIALOG';
export const HIDE_DIALOG = 'DFU_HIDE_DIALOG';
export const SHOW_CONFIRM_CLOSE_DIALOG = 'DFU_SHOW_CONFIRM_CLOSE';
export const HIDE_CONFIRM_CLOSE_DIALOG = 'DFU_HIDE_CONFIRM_CLOSE';
export const SET_FILE_PATH = 'DFU_SET_FILE_PATH';
export const LOAD_PACKAGE_INFO = 'DFU_LOAD_PACKAGE_INFO';
export const LOAD_PACKAGE_INFO_SUCCESS = 'DFU_LOAD_PACKAGE_INFO_SUCCESS';
export const LOAD_PACKAGE_INFO_ERROR = 'DFU_LOAD_PACKAGE_INFO_ERROR';
export const PERFORM_SUCCESS = 'DFU_PERFORM_SUCCESS';
export const PERFORM_ERROR = 'DFU_PERFORM_ERROR';
export const PERFORM = 'DFU_PERFORM';
export const TRANSFER_FILE_STARTED = 'DFU_TRANSFER_FILE_STARTED';
export const TRANSFER_FILE_COMPLETED = 'DFU_TRANSFER_FILE_COMPLETED';
export const ABORT = 'DFU_ABORT';
export const ABORT_SUCCESS = 'DFU_ABORT_SUCCESS';
export const UPDATE_PROGRESS = 'DFU_UPDATE_PROGRESS';

export const DEVICE_DISABLE_EVENTS = 'DEVICE_DISABLE_EVENTS';
export const DEVICE_ENABLE_EVENTS = 'DEVICE_ENABLE_EVENTS';

// Log levels used by the DFU module in pc-ble-driver-js
const TRACE = 0;
const DEBUG = 1;
const INFO = 2;
const WARNING = 3;
const ERROR = 4;
const FATAL = 5;


function showDialogAction(device) {
    return {
        type: SHOW_DIALOG,
        device,
    };
}

function hideDialogAction() {
    return {
        type: HIDE_DIALOG,
    };
}

function showConfirmCloseAction() {
    return {
        type: SHOW_CONFIRM_CLOSE_DIALOG,
    };
}

function hideConfirmCloseAction() {
    return {
        type: HIDE_CONFIRM_CLOSE_DIALOG,
    };
}

function setFilePathAction(filePath) {
    return {
        type: SET_FILE_PATH,
        filePath,
    };
}

function loadPackageInfoAction(filePath) {
    return {
        type: LOAD_PACKAGE_INFO,
        filePath,
    };
}

function loadPackageInfoSuccessAction(packageInfo) {
    return {
        type: LOAD_PACKAGE_INFO_SUCCESS,
        packageInfo,
    };
}

function loadPackageInfoErrorAction(error) {
    return {
        type: LOAD_PACKAGE_INFO_ERROR,
        error,
    };
}

function performDfuAction() {
    return {
        type: PERFORM,
    };
}

function performDfuSuccessAction() {
    return {
        type: PERFORM_SUCCESS,
    };
}

function performDfuError(error) {
    return {
        type: PERFORM_ERROR,
        error,
    };
}

function transferFileStartedAction(fileName) {
    return {
        type: TRANSFER_FILE_STARTED,
        fileName,
    };
}

function transferFileCompletedAction(fileName) {
    return {
        type: TRANSFER_FILE_COMPLETED,
        fileName,
    };
}

function abortDfuAction() {
    return {
        type: ABORT,
    };
}

function abortSuccessAction() {
    return {
        type: ABORT_SUCCESS,
    };
}

function updateProgressAction(progressInfo) {
    return {
        type: UPDATE_PROGRESS,
        percentCompleted: progressInfo.percentCompleted,
        status: progressInfo.stage,
        bytesPerSecond: progressInfo.bytesPerSecond,
        averageBytesPerSecond: progressInfo.averageBytesPerSecond,
        completedBytes: progressInfo.completedBytes,
        totalBytes: progressInfo.totalBytes,
    };
}

function _disconnectFromDevice(adapter, deviceAddress) {
    const device = _getDeviceByAddress(adapter, deviceAddress);
    if (!device) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        adapter.disconnect(device.instanceId, error => {
            if (error) {
                reject(new Error(error.message));
            } else {
                resolve();
            }
        });
    });
}

function _getDeviceByAddress(adapter, address) {
    const devices = adapter.getDevices();
    const foundDeviceId = Object.keys(devices).find(deviceId => {
        return devices[deviceId].address === address;
    });
    return devices[foundDeviceId];
}

function _setupListeners(dispatch, dfu) {
    dfu.on('transferStart', fileName => {
        dispatch(transferFileStartedAction(fileName));
    });
    dfu.on('transferComplete', fileName => {
        dispatch(transferFileCompletedAction(fileName));
    });
    dfu.on('progressUpdate', progress => {
        dispatch(updateProgressAction(progress));
    });
    dfu.on('logMessage', _onLogMessage);
}

function _removeListeners(dfu) {
    dfu.removeAllListeners('transferStart');
    dfu.removeAllListeners('transferComplete');
    dfu.removeAllListeners('progressUpdate');
    dfu.removeAllListeners('logMessage');
}

function _onLogMessage(severity, message) {
    switch (severity) {
        case TRACE:
        case DEBUG:
            logger.debug(message);
            break;
        case INFO:
            logger.info(message);
            break;
        case WARNING:
            logger.warn(message);
            break;
        case ERROR:
        case FATAL:
            logger.error(message);
            break;
        default:
            logger.warn(`Log message of unknown severity ${severity} received: ${message}`);
    }
}

export function showDfuDialog(device) {
    return (dispatch, getState) => {
        const dfu = new api.Dfu('BLE', {
            adapter: getState().adapter.api.selectedAdapter,
            targetAddress: device.address,
            targetAddressType: device.addressType,
        });
        getState().dfu.api.dfu = dfu;
        _setupListeners(dispatch, dfu);
        dispatch(showDialogAction(device));
    };
}

export function hideDfuDialog() {
    return (dispatch, getState) => {
        const dfu = getState().dfu.api.dfu;
        const isStarted = getState().dfu.isStarted;
        if (dfu) {
            if (isStarted) {
                dispatch(abortDfuAction());
                dfu.abort();
            }
            _removeListeners(dfu);
        }
        dispatch(hideDialogAction());
    };
}

export function showConfirmCloseDialog() {
    return showConfirmCloseAction();
}

export function hideConfirmCloseDialog() {
    return hideConfirmCloseAction();
}

export function setDfuFilePath(filePath) {
    return setFilePathAction(filePath);
}

export function loadDfuPackageInfo(filePath) {
    return (dispatch, getState) => {
        dispatch(loadPackageInfoAction(filePath));
        const dfu = getState().dfu.api.dfu;
        dfu.getManifest(filePath, (error, manifest) => {
            if (error) {
                dispatch(loadPackageInfoErrorAction(error));
                dispatch(showErrorDialog({message: error.message}));
            } else {
                dispatch(loadPackageInfoSuccessAction(manifest));
            }
        });
    };
}

export function startDfu(filePath) {
    return (dispatch, getState) => {
        dispatch(performDfuAction());
        const adapter = getState().adapter.api.selectedAdapter;
        const device = getState().dfu.device;
        const dfuModule = getState().dfu.api.dfu;

        // The DFU procedure in pc-ble-driver-js will connect to the device
        // before performing DFU. We disconnect our connection to allow
        // pc-ble-driver-js to connect.
        _disconnectFromDevice(adapter, device.address).then(() => {

            // Ignore adapter events for the device while DFU is in progress.
            // We want to prevent nRF Connect from acting on events from the
            // device and potentially interfering with the DFU operation.
            dispatch(disableDeviceEvents(device.address));

            dfuModule.performDFU(filePath, (error, aborted) => {
                if (error) {
                    dispatch(performDfuError(error));
                    dispatch(showErrorDialog({message: error.message}));
                } else if (aborted) {
                    dispatch(abortSuccessAction());
                } else {
                    dispatch(performDfuSuccessAction());
                }

                // DFU done. The adapter might still be connected to the device,
                // if the DFU failed or was aborted. Make sure the adapter is
                // disconnected from the device before handing back control of
                // events to nRF Connect.
                _disconnectFromDevice(adapter, device.address).then(() => {
                    dispatch(enableDeviceEvents(device.address));
                });
            });
        });
    };
}

export function stopDfu() {
    return (dispatch, getState) => {
        dispatch(abortDfuAction());
        getState().dfu.api.dfu.abort();
    };
}
