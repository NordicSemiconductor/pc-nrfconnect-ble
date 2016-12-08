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

export const SPAWN_LOGGER = 'SPAWN_LOGGER'
export const KILL_LOGGER = 'KILL_LOGGER'
export const RECEIVE_LOG = 'RECEIVE_LOG'

import { logger } from '../logging'

import { getExecutablePath } from '../utils/platform'

import * as childProcess from 'child_process'
import kill from 'tree-kill';



function logSpawn(logger) {
    return {
        type: SPAWN_LOGGER,
        logger
    }
}

function logKill() {
    return {
        type: KILL_LOGGER,
    }
}

function log(data) {
    return {
        type: RECEIVE_LOG,
        data
    }
}

// data is to be a list of strings
export function receiveLog(data) {
    return dispatch => {
        dispatch(log(data))
    }
}

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
        // logger.info('starting rttlogger');

        rttLogger.stdout.on('data', data => {
            const datas = lines(data);
            receiveLog(datas)(dispatch);
        });
        rttLogger.stderr.on('data', data => {
            const datas = lines(data);
            receiveLog(datas)(dispatch);
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
        dispatch(logSpawn(rttLogger))
    }
}

export function killLogger(logger) {
    return dispatch => {
        if (logger !== undefined)
          kill(logger.pid);
        dispatch(logKill());
    }
}

export const LOG_CLEAR = 'LOG_CLEAR'
export const TOGGLE_AUTO_SCROLL = 'TOGGLE_AUTO_SCROLL'
export const FILTER_LOG_DEVICES = 'FILTER_LOG_DEVICES'

function toggleAutoScrollAction(autoScroll) {
    return {
        type: TOGGLE_AUTO_SCROLL,
        autoScroll
    }
}

function clearLogAction() {
    return {
        type: LOG_CLEAR
    }
}

function filterLogByDeviceAction(devices) {
    return {
        type: FILTER_LOG_DEVICES,
        devices,
    }
}

function clearErrorsAction() {
    return {
        type: ERROR_CLEAR,
    }
}

export function toggleAutoScrollLog() {
    return (dispatch, getState) => {
        const autoScroll = getState().logger.autoScroll;
        dispatch(toggleAutoScrollAction(!autoScroll))
    }
}

export function clearLog() {
    return dispatch => {
        dispatch(clearLogAction());
    }
}

export function filterLogByDevice(devices) {
    return dispatch => {
        dispatch(filterLogByDeviceAction(devices));
    }
}
