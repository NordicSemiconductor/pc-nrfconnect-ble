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

export const ADD_ENTRY = 'LOG_ADD_ENTRY';
export const ADD_ENTRIES = 'LOG_ADD_ENTRIES';
export const CLEAR_ENTRIES = 'LOG_CLEAR_ENTRIES';
export const TOGGLE_AUTOSCROLL = 'LOG_TOGGLE_AUTOSCROLL';
export const TOGGLE_RTTLOG = 'TOGGLE_RTTLOG';
export const REMOVE_START_OF_LOG = 'REMOVE_START_OF_LOG';

import { LogReader } from '../logging';
import { logger } from '../logging'
import { getExecutablePath } from '../utils/platform'

import * as childProcess from 'child_process'
import kill from 'tree-kill';



let logReader;
let entryCallback;

function _startLogReader(dispatch, getState) {
    entryCallback = function (entries) {

        // if (getState().log.entries.size>100){
        //     dispatch(removePartOfLogFunc());
        // }
        dispatch(logAddEntriesAction(entries));
    };

    if (logReader === undefined) {
        logReader = new LogReader();
        logReader.on('entry', entryCallback);
    }

    logReader.start();
}

function _stopLogReader(dispatch) {
    if (entryCallback !== undefined && logReader !== undefined) {
        logReader.removeListener(entryCallback);
        logReader.stop();
    }
}

function logAddEntryAction(entry) {
    return {
        type: ADD_ENTRY,
        entry,
    };
}

function logAddEntriesAction(entries) {
    return {
        type: ADD_ENTRIES,
        entries,
    };
}

function clearEntriesAction() {
    return {
        type: CLEAR_ENTRIES,
    };
}

function toggleAutoScrollAction() {
    return {
        type: TOGGLE_AUTOSCROLL,
    };
}

function toggleRTT() {
    return {
        type: TOGGLE_RTTLOG,
    };
}

function removePartOfLogFunc() {
    return {
        type: REMOVE_START_OF_LOG,
    };
}

export function toggleAutoScroll() {
    return toggleAutoScrollAction();
}

export function clear() {
    return clearEntriesAction();
}

export function startReading() {
    return (dispatch, getState) => {
        return _startLogReader(dispatch, getState);
    };
}

export function stopReading() {
    return dispatch => {
        return _stopLogReader(dispatch);
    };
}
export function toggleRTTLog() {
    return (dispatch) => {
        dispatch(toggleRTT());
    }
}

export function removePartOfLog() {
    return (dispatch) => {
        dispatch(removePartOfLogFunc());
    }
}


//------------ RTT -------------

// function logKill() {
//     return {
//         type: KILL_LOGGER,
//     }
// }
// export function killLogger(logger) {
//     return dispatch => {
//         if (logger !== undefined)
//           kill(logger.pid);
//         dispatch(logKill());
//     }
// }


// Data stream -> [line1, line2, ...]
const lines = data => String(data)
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

export function spawnLogger() {
    return dispatch => {
        // Actually spawn the logger
        const filename = getExecutablePath('rtt-logger')
        const rttLogger = childProcess.spawn(filename, ['--reset'])
        logger.info('Starting rttlogger');

        rttLogger.stdout.on('data', data => {
            const input = new TextDecoder("utf-8").decode(data).replace(/\t/g, ' ').replace(/\[0m/g, ' ');
            logger.info((input))
        });
        rttLogger.stderr.on('data', data => {
            logger.info(String(data))
        });
        rttLogger.on('close', code => {
            if (code === 0) {
                const msg = 'rttlogger closed successfully';
                receiveLog([`\t\t\t${msg}`])(dispatch);
                logger.info(msg)
            } else {
                const msg = `rttlogger closed with error code ${code}`;
                receiveLog([`\t\t\t${msg}`])(dispatch);
                logger.info(msg)
            }
            dispatch(logKill());
        })
        //dispatch(logSpawn(rttLogger))
    }
}
