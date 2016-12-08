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

export const ADAPTER_OPENED = 'ADAPTER_OPENED';
export const ADAPTER_OPEN = 'ADAPTER_OPEN';
export const ADAPTER_SEND = 'ADAPTER_SEND';
export const ADAPTER_ADDED = 'ADAPTER_ADDED';
export const ADAPTER_REMOVED = 'ADAPTER_REMOVED';
export const ADAPTER_CLOSED = 'ADAPTER_CLOSED';
export const MESH_CURRENT_PORT = 'MESH_CURRENT_PORT';

export const MESH_TIMESTAMP_UPDATED_ON_HANDLE = 'MESH_TIMESTAMP_UPDATED_ON_HANDLE';
export const MESH_INIT = 'MESH_INIT';
export const MESH_FIRMWARE = 'MESH_FIRMWARE';
export const MESH_LED = 'MESH_LED';
export const MESH_EXPANDSLOT = 'MESH_EXPANDSLOT';
export const MESH_TOGGLE_IS_ININITIALIZED = 'MESH_TOGGLE_IS_ININITIALIZED';
export const MESH_SAVE_HANDLES_WITH_DATA = 'MESH_SAVE_HANDLES_WITH_DATA';
export const MESH_REMOVE_HANDLE_WITH_DATA = 'MESH_REMOVE_HANDLE_WITH_DATA';
export const MESH_TOGGLE_HANDLE_DATA_TABLE = 'MESH_TOGGLE_HANDLE_DATA_TABLE';
export const MESH_SET_FLAG_ON_HANDLE = 'MESH_SET_FLAG_ON_HANDLE';
export const MESH_CLEAN_HANDLE_TABLE = 'MESH_CLEAN_HANDLE_TABLE';
export const MESH_CLOSE_PORT = 'MESH_CLOSE_PORT';
export const MESH_SET_EVENT_TX_ON_HANDLE = 'MESH_SET_EVENT_TX_ON_HANDLE';
export const MESH_START_BROADCAST = 'MESH_START_BROADCAST';
export const MESH_STOP_BROADCAST = 'MESH_STOP_BROADCAST';
export const MESH_SHOW_HANDLE_TABLE = 'MESH_SHOW_HANDLE_TABLE';


import { api } from 'pc-ble-driver-js';
import { logger } from '../../logging';
import { showErrorDialog } from '../errorDialogActions';
import { toHexString } from '../../utils/stringUtil';
import { promiseWhile, hexStringToArray } from './meshHelpFunctions';

const _adapterFactory = api.AdapterFactory.getInstance();
const BLEMeshSerialInterface = require('ble-mesh-serial-interface-js/BLEMeshSerialInterface');

const bleMeshSerialInterfaceAPI = new BLEMeshSerialInterface();

//internal functions
function getFlagAndTxValueFromDevice(handle, callback) {
    bleMeshSerialInterfaceAPI.flagGet(handle, (err, flagRes) => {
        checkError(err)
        bleMeshSerialInterfaceAPI.txEventGet(handle, (err, txRes) => {
            checkError(err)
            callback(flagRes, txRes);
        })
    })
}

function checkError(err) {
    if (err) {
        logger.error(`error occured in meshAdapterActions.js: ${err}.`);
        throw err;
    }
}

function _getAdapters(dispatch) {
    return new Promise((resolve, reject) => {
        // Register listeners for adapters added/removed
        _adapterFactory.removeAllListeners();
        _adapterFactory.on('added', adapter => {
            dispatch(adapterAddedAction(adapter));
        });
        _adapterFactory.on('removed', adapter => {
            dispatch(adapterRemovedAction(adapter));
        });
        _adapterFactory.on('error', error => {
            dispatch(showErrorDialog(new Error(error.message)));
        });

        _adapterFactory.getAdapters((error, adapters) => {
            if (error) {
                reject(new Error(error.message));
            } else {
                resolve();
            }
        });
    }).catch(error => {
        dispatch(showErrorDialog(error));
    });
}

//Closes the connection to the device, and cleans up the UI so the old data is not presented.
function _closeAdapter(dispatch, adapter, getState) {
    if (getState().adapter.api.selectedAdapter !== null) {
        bleMeshSerialInterfaceAPI.closeSerialPort(err => {
            checkError(err);
            dispatch(toggleVisibilityOfHandleTable(false));

            logger.info('Serial port closed.');
            dispatch(setInititialized(false));
            dispatch(cleanHandleTable());
            if (getState().meshMain.isHandleTableVisable) {
                dispatch(toggleVisibilityOfHandleTable());
            }
            dispatch(closePortReducer());
            dispatch(closeAdapterRed(adapter));
        });
    }
}

//runs when you connect to a device. TODO: check if device is initialized.
function _openAdapter(dispatch, getState, adapter) {
    return new Promise((resolve, reject) => {
        //checks if we are already connected to a device
        if (getState().adapter.api.selectedAdapter !== null) {
            dispatch(toggleVisibilityOfHandleTable(false));

            bleMeshSerialInterfaceAPI.closeSerialPort(() => {
                //This is to re-enable the buttons in the GUI
                dispatch(setInititialized(false));
                dispatch(cleanHandleTable());
                if (getState().meshMain.isHandleTableVisable) {
                    dispatch(toggleVisibilityOfHandleTable());
                }
                dispatch(closeAdapterRed(adapter));
                resolve();
            });
        } else {
            resolve();
        }
    }).then((resolve, reject) => {
        return new Promise((resolve, reject) => {
            const adapterToUse = getState().adapter.api.adapters.find(x => { return x.state.port === adapter; });
            let success = false;

            if (adapterToUse === null) {
                reject(new Error(`Not able to find ${adapter}.`));
            }

            getState().adapter.api.selectedAdapter = adapterToUse;

            bleMeshSerialInterfaceAPI.removeAllListeners();

            bleMeshSerialInterfaceAPI.openSerialPort(adapter, err => {
                checkError(err);
                logger.info(`Opened connection with ${adapter}.`);

                bleMeshSerialInterfaceAPI.buildVersionGet((err, res) => { /* This will fail if we are in DFU mode. */
                    if (!err) {
                        dispatch(setFirmwareVersion(res));
                    } else {
                        console.error("FAILED IN FIRMWARE VERSION");
                    }

                    bleMeshSerialInterfaceAPI.channelGet(err => {
                        if (err) {
                            console.error("FAILED IN channelGet");
                            dispatch(setInititialized(false));
                        } else {
                            dispatch(setInititialized(true));
                            success = true;
                            resolve(adapterToUse);
                        }

                    });
                });

                //With default init we do not nee this step
                // setTimeout(() => {
                //     if (!success) {
                //         // logger.error(`Waring, buildVersionGet() and/or channelGet() timed-out. Assuming the device is not intiliazed...`);
                //         // dispatch(setFirmwareVersion('IDK'));
                //         // dispatch(setInititialized(false));
                //         // resolve(adapterToUse);
                //     }
                // }, 500);

                bleMeshSerialInterfaceAPI.on('deviceStarted', res => {
                    logger.info(`[STARTED] operating mode: ${res.operatingMode}.`);

                    if (res.operatingMode === 2) {
                        bleMeshSerialInterfaceAPI.buildVersionGet((err, res) => { /* This will fail if we are in DFU mode. */
                            if (!err) {
                                dispatch(setFirmwareVersion(res));
                            } else {
                                console.error("FAILED IN FIRMWARE VERSION");
                            }

                            bleMeshSerialInterfaceAPI.channelGet(err => {
                                if (err) {
                                    console.error("FAILED IN channelGet");
                                    dispatch(setInititialized(false));
                                } else {
                                    dispatch(setInititialized(true));
                                    success = true;
                                    resolve(adapterToUse);
                                }

                            });
                        });

                        // bleMeshSerialInterfaceAPI.buildVersionGet((err, res) => { /* This will fail if we are in DFU mode. */
                        //     checkError(err);
                        //     dispatch(setInititialized(true));
                        //     dispatch(setFirmwareVersion(res));
                        // });
                    }
                });

                bleMeshSerialInterfaceAPI.on('eventNew', res => {
                    logger.info(`[NEW] handle: ${res.handle.toString(16).toUpperCase()} with data: ${toHexString(res.data)}.`);
                    dispatch(addHandleAndData(res.handle, res.data, false, false));
                });

                bleMeshSerialInterfaceAPI.on('eventUpdate', res => {
                    logger.info(`[UPDATED] handle ${res.handle.toString(16).toUpperCase()} with data: ${toHexString(res.data)}.`);
                    if (res.data.length === 0) {
                        let oldHandleTable = getState().meshMain.get('handleAndData').toJS();
                        if (res.handle in oldHandleTable) {
                            dispatch(removeHandleAndData(res.handle));
                        }
                    } else {
                        //TODO ? 
                        // getFlagAndTxValueFromDevice(res.handle, (flagRes, txRes) => {
                        //     let flagSet = (flagRes.flagValue === 1) ? true : false;
                        //     let txSet = (txRes.flagValue === 1) ? true : false;
                        //     dispatch(addHandleAndData(res.handle, res.data, flagSet, txSet));
                        // })
                        dispatch(addHandleAndData(res.handle, res.data, false, false));

                    }
                });

                bleMeshSerialInterfaceAPI.on('eventConflicting', res => {
                    logger.info(`[CONFLICTING] handle: ${res.handle.toString(16)} with data: ${toHexString(res.data)}.`);
                });

                bleMeshSerialInterfaceAPI.on('eventTX', res => {
                    var d = new Date();
                    dispatch(updateTimestapOnHandleReduser(adapter, res.handle, d.getTime()));
                });

                bleMeshSerialInterfaceAPI.on('eventDFU', res => {
                    logger.info(`[DFU]: ${res}.`);
                });
            });
        }).then(adapter => {
            dispatch(adapterOpenedAction(adapter));
            dispatch(setCurrentPort(adapter));
        });
    }).catch(error => {
        dispatch(showErrorDialog(error));
        getState().adapter.api.selectedAdapter = null;
        dispatch(setCurrentPort(''));
    });
}

//Resetting device
function _radioReset(dispatch) {
    bleMeshSerialInterfaceAPI.once('deviceStarted', () => {
        logger.info('Device reset.');
        dispatch(setInititialized(false));
    });
    bleMeshSerialInterfaceAPI.radioReset(err => {
        checkError(err);
    });
}

//writing data to the chosen handle
function _setValue(dispatch, handle, message, getState) {
    let messageHex = checkInMessage(message);
    bleMeshSerialInterfaceAPI.valueSet(handle, messageHex, err => {
        checkError(err);

        getFlagAndTxValueFromDevice(handle, (flagRes, txRes) => {
            let flagSet = (flagRes.flagValue === 1) ? true : false;
            let txSet = (txRes.flagValue === 1) ? true : false;
            dispatch(addHandleAndData(handle, messageHex, flagSet, txSet));
            logger.info(`Function called: valueSet(0x${handle.toString(16).toUpperCase()}, 0x${toHexString(messageHex).toUpperCase()}); `);
            _refreshHandleTable(dispatch);
            dispatch(showHandleTableReduser());

        })
    });
}

//checks the hex-message we get in from user.
function checkInMessage(message) {
    let firstTwoLetters = message.slice(0, 2);
    if (firstTwoLetters === '0x' || firstTwoLetters === '0X') {
        message = message.slice(2);
    }

    //Removing all 0 in from start of the string. So 00000AF, becomes AF.
    while (message[0] === '0') {
        message = message.slice(1);
    }

    if (message.length === 0) { // TEMP.
        message = [0];
    }

    return hexStringToArray(message);
}

// Gets the value at a given handle and prints it out in the logger.info
function _getHandleValue(dispatch, handle) {
    bleMeshSerialInterfaceAPI.valueGet(handle, (err, res) => {
        checkError(err);
        logger.info(`Function called: valueGet(0x${res.handle.toString(16).toUpperCase()}); `);
        logger.info(`Value returned: 0x${toHexString(res.data).toUpperCase()}. `);
    });
}

//This enables or disables a handle so it will stop broadcasting its value
function _enableHandle(dispatch, getState, handle, enable) {
    if (enable) {
        bleMeshSerialInterfaceAPI.valueEnable(handle, err => {
            checkError(err);
            logger.info(`Function called: valueEnable(0x${handle.toString(16).toUpperCase()}) `);
            logger.info(`Enabled handle: 0x${handle.toString(16).toUpperCase()}.`);

        });
    } else {
        bleMeshSerialInterfaceAPI.valueDisable(handle, err => {
            checkError(err);
            logger.info(`Function called: valueDisable(0x${handle.toString(16).toUpperCase()}) `);
            logger.info(`Disabled handle: 0x${handle.toString(16).toUpperCase()}.`);
        });
    }
}

//This expands the panel in the GUI
function _expandSlot(dispatch, getState, value) {
    dispatch(lastExpandSlot(value));
}

//This sets the state defining if device is initialized or not.
function _setInititialized(dispatch, getState, value) {
    dispatch(setInititialized(value));
}

// Value ? start : stop
function _startBroadcast(dispatch, getState, value) {
    if (value) {
        bleMeshSerialInterfaceAPI.start(err => {
            checkError(err);
            logger.info(`Function called: start() `);
            logger.info('Broadcasting started.');
            dispatch(startBroadcastAction());
        });
    } else {
        bleMeshSerialInterfaceAPI.stop(err => {
            checkError(err);
            logger.info(`Function called: stop() `);
            logger.info('Broadcasting stopped.');
            dispatch(stopBroadcastAction());
        });
    }
}

//Setting init values 
function _initDevice(dispatch, getState, channel, min, adr) {
    bleMeshSerialInterfaceAPI.init(adr, min, channel, err => {
        checkError(err);
        logger.info(`Function called: init(0x${adr.toString(16).toUpperCase()}, 0x${min.toString(16).toUpperCase()}, 0x${channel.toString(16).toUpperCase()}) `);
        logger.info(`Device initialized. BLE channel: ${channel}, minimum rebroadcast interval: ${min} [ms], advertising access address: 0x${adr.toString(16).toUpperCase()}.`);
        dispatch(initMesh(channel, min, adr));
        dispatch(setInititialized(true));
    });
}

//Going thru all selected devices and opening connection, radioResets then close connection.
function _resetMultipleDevices(dispatch, selectedDevices) {
    for (let device of selectedDevices) {
        let success = false;
        let deviceMeshSerialInterface = new BLEMeshSerialInterface();

        deviceMeshSerialInterface.once('deviceStarted', () => { // TODO: We need to make sure these ports are closed. Probably use timeout.
            deviceMeshSerialInterface.closeSerialPort(err => {
                checkError(err);
                logger.info(`Device with ID: ${device.instanceId} on port ${device.port} was reset.`);
                success = true;
            });
        });

        deviceMeshSerialInterface.openSerialPort(device.port, err => {
            checkError(err);
            deviceMeshSerialInterface.radioReset(err => {
                checkError(err);
            });
        });

        setTimeout(() => {
            if (success !== true) {
                logger.info(`Device with ID: ${device.instanceId} on port ${device.port} timed-out... Trying to close the serial port...`);
                deviceMeshSerialInterface.closeSerialPort(err => {
                    checkError(err);
                    logger.info(`Port ${device.port} succesfully closed after time-out.`);
                });
            }
        }, 1000);
    }
}

//going thru all selected devices and opening connection, init then close connection.
function _initMultipleDevices(dispatch, selectedDevices, adr, min, channel) {
    for (let device of selectedDevices) {
        let success = false;
        let deviceMeshSerialInterface = new BLEMeshSerialInterface();
        deviceMeshSerialInterface.openSerialPort(device.port, err => {
            checkError(err);
            deviceMeshSerialInterface.init(adr, min, channel, err => {
                checkError(err);
                deviceMeshSerialInterface.closeSerialPort(err => {
                    checkError(err);
                    logger.info(`Device with ID: ${device.instanceId} on port ${device.port} initialized`);
                    success = true;
                });
            });
        });

        setTimeout(() => {
            if (success !== true) {
                logger.info(`Device with ID: ${device.instanceId} on port ${device.port} timed-out... Trying to close the serial port...`);
                deviceMeshSerialInterface.closeSerialPort(err => {
                    checkError(err);
                    logger.info(`Port ${device.port} succesfully closed after time-out.`);
                });
            }
        }, 1000);
    }
}

function _onAfterSaveCell(dispatch, handle, data, getState) {
    let handleInteger = parseInt(handle, 16);
    _setValue(dispatch, handleInteger, data, getState);
}

//Uses a promiseWhile loop to go thru all the rows in listOfSelectedRows and sets their data to '';
function _resetDataOnHandles(dispatch, listOfSelectedRows, getState) {
    let messageHex = checkInMessage('0');
    let index = -1;
    promiseWhile(() => {
        return index < listOfSelectedRows.length - 1;
    }, () => {
        index++;
        return new Promise((resolve, reject) => {
            let handle = parseInt(listOfSelectedRows[index].handleId, 16);
            bleMeshSerialInterfaceAPI.valueSet(handle, messageHex, (error) => {
                if (error) {
                    dispatch(showErrorDialog(error));
                } else {
                    dispatch(removeHandleAndData(handle));
                    logger.info(`Function called: valueSet(0x${handle.toString(16).toUpperCase()}, 0x${toHexString(messageHex).toUpperCase()}); `);
                }
                resolve();
            });
        });
    }).then(() => {

    }).done();
}

//Uses a promiseWhile loop to go thru all the rows in listOfSelectedRows to set their flags.
function _setFlagOn(dispatch, listOfSelectedRows, getState, set) {
    let index = -1;
    promiseWhile(() => {
        return index < listOfSelectedRows.length - 1;
    }, () => {
        index++;
        return new Promise((resolve, reject) => {
            let value = set ? 1 : 0;
            let handle = parseInt(listOfSelectedRows[index].handleId, 16);
            bleMeshSerialInterfaceAPI.flagSet(handle, value, err => {
                checkError(err);
                logger.info(`Function called: flagSet(0x${handle.toString(16).toUpperCase()},${value}) `);

                if (set) {
                    dispatch(setFlagOnHandle(handle, true));
                } else {
                    dispatch(setFlagOnHandle(handle, false));
                }
                resolve();
            });
        });
    }).then(() => {
        _refreshHandleTable(dispatch);
    }).done();
}

//Uses a promiseWhile loop to go thru all the rows in listOfSelectedRows to set their Tx.
function _setTx(dispatch, listOfSelectedRows, getState, set) {
    let index = -1;
    promiseWhile(() => {
        return index < listOfSelectedRows.length - 1;
    }, () => {
        index++;
        return new Promise((resolve, reject) => {
            let value = set ? 1 : 0;
            let handle = parseInt(listOfSelectedRows[index].handleId, 16);
            bleMeshSerialInterfaceAPI.txEventSet(handle, true, err => {
                checkError(err);
                logger.info(`Function called: txEventSet(0x${handle.toString(16).toUpperCase()},${value}) `);

                if (set) {
                    dispatch(setEventTx(handle, true));
                } else {
                    dispatch(setEventTx(handle, false));
                }
                resolve();
            });
        });
    }).then(() => {
        _refreshHandleTable(dispatch);
    }).done();
}

//dirtyfix toggling to reset the table in the handleTable, also to remove the selected rows.
function _refreshHandleTable(dispatch) {
    dispatch(toggleVisibilityOfHandleTable());
    dispatch(toggleVisibilityOfHandleTable());
}

//----------------Reduser calls----------------
function toggleVisibilityOfHandleTable(visable) {
    return {
        type: MESH_TOGGLE_HANDLE_DATA_TABLE,
        visable,
    };
}
function addHandleAndData(handle, data, isFlagSet, isTxSet) {
    return {
        type: MESH_SAVE_HANDLES_WITH_DATA,
        handle,
        data,
        isFlagSet,
        isTxSet
    };
}

function removeHandleAndData(handle) {
    return {
        type: MESH_REMOVE_HANDLE_WITH_DATA,
        handle
    };
}

function setFlagOnHandle(handle, set) {
    return {
        type: MESH_SET_FLAG_ON_HANDLE,
        handle,
        set,
    };
}

function setEventTx(handle, set) {
    return {
        type: MESH_SET_EVENT_TX_ON_HANDLE,
        handle,
        set,
    };
}

function setInititialized(value) {
    return {
        type: MESH_TOGGLE_IS_ININITIALIZED,
        value,
    };
}

function closePortReducer(port) {
    return {
        type: MESH_CLOSE_PORT,
        port,
    };
}

function setCurrentPort(port) {
    return {
        type: MESH_CURRENT_PORT,
        port,
    };
}

function setFirmwareVersion(meshFirmware) {
    return {
        type: MESH_FIRMWARE,
        meshFirmware,
    };
}

function adapterOpenedAction(adapter) {
    return {
        type: ADAPTER_OPENED,
        adapter,
    };
}

function initMesh(channel, min, adr) {
    return {
        type: MESH_INIT,
        channel,
        min,
        adr,
    };
}

function adapterAddedAction(adapter) {
    return {
        type: ADAPTER_ADDED,
        adapter,
    };
}

function startBroadcastAction() {
    return {
        type: MESH_START_BROADCAST
    }
}

function stopBroadcastAction() {
    return {
        type: MESH_STOP_BROADCAST
    }
}

function adapterRemovedAction(adapter) {
    return {
        type: ADAPTER_REMOVED,
        adapter,
    };
}

function lastExpandSlot(value) {
    return {
        type: MESH_EXPANDSLOT,
        value,
    };
}

function cleanHandleTable() {
    return {
        type: MESH_CLEAN_HANDLE_TABLE,
    };
}

function closeAdapterRed(adapter) {
    return {
        type: ADAPTER_CLOSED,
        adapter,
    };
}

function updateTimestapOnHandleReduser(adapter, handle, time) {
    return {
        type: MESH_TIMESTAMP_UPDATED_ON_HANDLE,
        handle,
        time,
    };
}

function showHandleTableReduser() {
    return {
        type: MESH_SHOW_HANDLE_TABLE
    };
}

//----------------Export functions----------------
export function connectToAdapter(adapter) {
    return (dispatch, getState) => {
        return _openAdapter(dispatch, getState, adapter);
    };
}

export function setInititializedExpo(value) {
    return (dispatch) => {
        return _setInititialized(dispatch, value);
    };
}

export function findAdapters() {
    return dispatch => {
        return _getAdapters(dispatch);
    };
}

export function expandSlot(value) {
    return (dispatch, getState) => {
        return _expandSlot(dispatch, getState, value);
    };
}

export function generalMesh(handle, message) {
    return (dispatch, getState) => {
        return _setValue(dispatch, handle, message, getState);
    };
}

export function getHandleValue(handle) {
    return (dispatch) => {
        return _getHandleValue(dispatch, handle);
    };
}

export function enableHandle(handle, enable) {
    return (dispatch, getState) => {
        return _enableHandle(dispatch, getState, handle, enable);
    };
}

export function startBroadcast(value) {
    return (dispatch, getState) => {
        return _startBroadcast(dispatch, getState, value);
    };
}

export function radioReset() {
    return (dispatch) => {
        return _radioReset(dispatch);
    };
}

export function initDevice(channel, min, adr) {
    return (dispatch, getState) => {
        return _initDevice(dispatch, getState, channel, min, adr);
    };
}

export function resetMultipleDevices(selectedDevices) {
    return (dispatch, getState) => {
        return _resetMultipleDevices(dispatch, selectedDevices);
    };
}

export function initMultipleDevices(selectedDevices, adr, min, channel) {
    return (dispatch, getState) => {
        return _initMultipleDevices(dispatch, selectedDevices, adr, min, channel);
    };
}

export function toggleVisibilityHandleTable() {
    return (dispatch) => {
        return dispatch(toggleVisibilityOfHandleTable());
    };
}

export function onAfterSaveCell(row, cellName, cellValue) {
    return (dispatch, getState) => {
        return _onAfterSaveCell(dispatch, row.handleId, row.data, getState);
    };
}

export function resetDataOnHandles(listOfSelectedRows) {
    return (dispatch, getState) => {
        return _resetDataOnHandles(dispatch, listOfSelectedRows, getState);
    };
}

export function setFlagOn(listOfSelectedRows, set) {
    return (dispatch, getState) => {
        return _setFlagOn(dispatch, listOfSelectedRows, getState, set);
    };
}

export function setTx(listOfSelectedRows, set) {
    return (dispatch, getState) => {
        return _setTx(dispatch, listOfSelectedRows, getState, set);
    };
}

export function closeAdapter(adapter) {
    return (dispatch, getState) => {
        return _closeAdapter(dispatch, adapter, getState);
    };
}

