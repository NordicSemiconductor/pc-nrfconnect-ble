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

import { logger } from '../../logging';
import { getExecutablePath } from '../../utils/platform'

import { spawnLogger, killLogger } from '../loggerActions';

const exec = require('child_process').exec;

const NRF5_MULTI_PROG_FILENAME = 'nRF5-multi-prog'
const NRF5_MULTI_PROG_PATH = getExecutablePath(NRF5_MULTI_PROG_FILENAME);

export const START_MULTI_PROG = 'START_MULTI_PROG'
export const STOP_MULTI_PROG = 'STOP_MULTI_PROG'
export const SHOW_CUSTOM_FILE = 'SHOW_CUSTOM_FILE'
export const HIDE_CUSTOM_FILE = 'HIDE_CUSTOM_FILE'
export const SELECTED_SNRS = 'SELECTED_SNRS'

export function nRF5MultiProg(commandString, rttLogger) {
  return dispatch => {
    const execString = `${NRF5_MULTI_PROG_PATH} ${commandString}`;

    let rttWasKilled = false;
    if (rttLogger) {
      killLogger(rttLogger)(dispatch)
      rttWasKilled = true;
    }

    logger.info(`Running ${execString}`);
    const nrf5MultiProg = exec(execString);
    startMultiProg()(dispatch);

    nrf5MultiProg.stdout.on('data', (data) => {
      logger.info(`${NRF5_MULTI_PROG_FILENAME} stdout: ${data}`);
    });

    nrf5MultiProg.stderr.on('data', (data) => {
      logger.error(`${NRF5_MULTI_PROG_FILENAME} stderr: ${data}`);
    });

    nrf5MultiProg.on('close', (code) => {
      if (code == 0) {
        logger.info(`${NRF5_MULTI_PROG_FILENAME}: programming completed successfully`)
      } else {
        logger.error(`${NRF5_MULTI_PROG_FILENAME}: exited with code ${code}`);
      }
      stopMultiProg()(dispatch);
      if (rttWasKilled)
        spawnLogger()(dispatch);
    });

    process.on('SIGINT', () => {
      logger.error(`exiting ${NRF5_MULTI_PROG_FILENAME}`);
      nrf5MultiProg.kill();
      stopMultiProg()(dispatch);
      if (rttWasKilled)
        spawnLogger()(dispatch);
    });
  }
}

export function showCustomFileInForm(show) {
  return dispatch => {
    if (show) {
      dispatch(showCustomFile())
    } else {
      hideCustomFile()(dispatch);
    }
  }
}

export function addSelectedSNRS(snrs) {
  // console.log(snrs);
  return dispatch => {
      dispatch(addSelectedSnr(snrs))
  }
}


export const startMultiProg = () =>
  dispatch => dispatch({
    type: START_MULTI_PROG
  })

export const stopMultiProg = () =>
  dispatch => dispatch({
    type: STOP_MULTI_PROG
  })

export const showCustomFile = () =>
  dispatch => dispatch({
    type: SHOW_CUSTOM_FILE
  })

export const hideCustomFile = () =>
  dispatch => dispatch({
    type: HIDE_CUSTOM_FILE
  })

export const addSelectedSnr = (snrs) =>
  dispatch => dispatch({
    type: SELECTED_SNRS, 
    snrs
    
  })
