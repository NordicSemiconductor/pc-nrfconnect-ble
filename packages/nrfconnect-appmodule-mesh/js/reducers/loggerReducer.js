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

import {
    SPAWN_LOGGER, KILL_LOGGER, RECEIVE_LOG,
    TOGGLE_AUTO_SCROLL, LOG_CLEAR, FILTER_LOG_DEVICES,
    ERROR_INCREMENT, ERROR_CLEAR, TOGGLE_RTTLOG
} from '../actions/loggerActions'

import { Record, List } from 'immutable';
import moment from 'moment';

const initialState = (Record({
    running: false,
    logs: List(),
    allLogs: List(),
    autoScroll: true,
    logger: undefined,
    errorCount: 0,

}))()

const isNaN = n => n !== n;

const DATE_FORMAT = 'HH:mm:ss.SSSS';

function logLineToObj(line) {
    // The delimiter ('\t') is defined
    // in rtt_logger-stdout.py.
    const DELIMITER = '\t',
        i = line.indexOf(DELIMITER);

    let device,
        data;
    if (i === -1) {
        device = 'unknown'
        data = line
    } else {
        device = line.slice(0, i),
            data = line.slice(i + 1);
    }
    // NOTE: this is time on register, not the time the message
    // was created.
    const timestamp = new Date().toISOString();
    return {
        device,
        timestamp: moment(timestamp).format(DATE_FORMAT),
        data,
    };
}


export default function logger(state = initialState, action) {
    switch (action.type) {
        case SPAWN_LOGGER:
            if (!state.running)
                return state.merge({
                    running: true,
                    logger: action.logger,
                })
            break;

        case KILL_LOGGER:
            if (state.running)
              return state.set('running', false)
                          .set('logger', undefined);
            break;

        case RECEIVE_LOG: {
            // NOTE: we assume the data is of a specific format
            // (used in the `provisioner` and `provisionee` examples)
            // If we want to support any logging format (we might want to),
            // we will have to either require all formats to be specified in
            // here some place, or make a form for the user to input
            // the data format, and parse the incomming text based on that.
            let newLogs = []
            for (let line of action.data) {
                const obj = logLineToObj(line);
                newLogs.push(obj);
            }
            const allLogs = state.get('allLogs').push(...(newLogs))
            const logs = state.get('logs').push(...(newLogs))

            const cmp = (a, b) => a.timestamp - b.timestamp
            // TODO: replace with some kind of `insertSorted`?
            return state.merge({
                logs: logs.sort(cmp),
                allLogs: allLogs.sort(cmp),
            });
        }

        case TOGGLE_AUTO_SCROLL:
            return state.set('autoScroll', action.autoScroll)

        case LOG_CLEAR:
          return state.set('logs', List())
                      .set('allLogs', List());

        case FILTER_LOG_DEVICES:
            const { devices } = action;
            const devicesAsNumbers = devices.map(Number);
            // if (devices.length === 0)
            //     return state.set('logs', state.get('allLogs'))
            const logs = state.get('allLogs').filter(log => {
              // Keep logs which `.device` are not a valid number,
              // or when the number is in `devicesAsNumbers`
                const n = Number(log.device);
                return n == 0 || isNaN(n) ||
                  devicesAsNumbers.indexOf(n) !== -1;
            });
            return state.set('logs', logs);
    }
    return state;
}
