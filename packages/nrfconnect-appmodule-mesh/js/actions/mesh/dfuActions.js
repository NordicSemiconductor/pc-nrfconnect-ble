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

const exec = require('child_process').exec;
const ChildProcess = require('child_process');
const BLEMeshSerialInterface = require('ble-mesh-serial-interface-js/BLEMeshSerialInterface');

import { getExecutablePath } from '../../utils/platform'
import { getHexPath } from '../../utils/platform'
import { logger } from '../../logging';
import path from 'path';

const genpkgArgs = ({application, companyId, applicationId, applicationVersion, softdevice, file}) => {
    for (let field of [application, companyId, applicationId, applicationVersion, softdevice]) {
        if (field === undefined) {
            console.log('[ERR]\tSome field in genpkgCmd was undefined:')
            console.log({ application, companyId, applicationId, applicationVersion, softdevice });
        }
    }
    let filePath = '';
    if (file === 'NRF51Dongle') {
        const NRF51 = 'nrf51422_xxac_PCA10031_S110_Blinky'
        const NRF51Path = getHexPath(NRF51);
        filePath = NRF51Path
        // console.log(filePath);


    } else if (file === 'NRF52') {
        const NRF52 = 'nrf52832_xxaa_PCA10040_S132_Blinky'
        const NRF52Path = getHexPath(NRF52);
        filePath = NRF52Path
        // console.log(filePath);

    } else {
        filePath = application.path;
        // console.log(filePath);
    }
    let returnValue = [
        'dfu',
        'genpkg',
        '--application', filePath,
        `--company-id`, companyId,
        `--application-id`, applicationId,
        `--application-version`, applicationVersion,
        `--sd-req`, softdevice,
        '--mesh',
        'dfu_test.zip',

    ]
    console.log(returnValue);
    return returnValue
    
}

// Get the command for executing the dfu.
const dfuArgs = ({device}) => {
    if (device === undefined) {
        console.log('[ERR]\t`comPort` was undefined in dfuCmd')
    }
    // Dirtyfix to get SNR together with COM
    let com = device.split("@")[0]
    let returnValue = [
        'dfu',
        'serial',
        '-pkg',
        'dfu_test.zip',
        '-p', com,
        '-b', '115200',
        '-fc',
        '--mesh'
    ]
    console.log(returnValue);
    return returnValue;
}

// Dirtyfix to get SNR together with COM
const jProg = ({device}) => {
    let snr = device.split("@")[1]
    return ['--reset', '--snr', snr]
}

// Dirtyfix to get SNR together with COM
const jProg52 = ({device}) => {
    let snr = device.split("@")[1]

    return ['--reset', '--snr', snr, '--family', 'NRF52']
}

export const START_DFU = 'START_DFU'
export const STOP_DFU = 'STOP_DFU'
export const SHOW_CUSTOM_FILE = 'SHOW_CUSTOM_FILE'
export const HIDE_CUSTOM_FILE = 'HIDE_CUSTOM_FILE'

// NOTE: values are from Redux-form (DfuForm.jsx)
export function runDFU(values) {
    /**
     * We need to perform a radioReset before executing pc-nrfutil.exe because the device needs to restart in DFU mode.
     * TODO: Add logging so the user knows what is going on.
     * TODO: We need to log a progress bar.
     */
    return dispatch => {
        const bleMeshSerialInterfaceAPI = new BLEMeshSerialInterface();
        //Start off with a radio reset
        bleMeshSerialInterfaceAPI.openSerialPort(values.device.split('@')[0], err => {
            bleMeshSerialInterfaceAPI.once('deviceStarted', () => {

                logger.info('Device reset.');

                bleMeshSerialInterfaceAPI.closeSerialPort(err => {
                    console.log("Closed ");

                    const nrfutil = getExecutablePath('pc-nrfutil');
                    const spawn = ChildProcess.spawn;
                    // console.log(values);
                    const genpkg = spawn(nrfutil, genpkgArgs(values));
                    startDFU()(dispatch);

                    const nrfjProgReset52 = spawn('nrfjprog.exe', jProg52(values));

                    nrfjProgReset52.on('close', code => {
                        // TOOD: this could probaby get cleaned up :)
                        // code 18 = wrong family.  so if nrf52 is incorrect then rund nrf51
                        if (code == 18) {
                            //Not 52, so run 51
                            const nrfjProgReset = spawn('nrfjprog.exe', jProg(values));
                            nrfjProgReset.on('close', code => {

                                if (code !== 0) {
                                    logger.error(` nrfjprog with error code ${code}`)
                                    stopDFU()(dispatch);
                                    return;
                                }
                                logger.info('DFU process started, this will take around 30 seconds!');

                                genpkg.on('close', code => {
                                    if (code !== 0) {
                                        logger.error(`genpkg failed with error code ${code}`)
                                        stopDFU()(dispatch);
                                        return;
                                    }
                                    const bleMeshSerialInterfaceAPI = new BLEMeshSerialInterface();

                                    const dfu = spawn(nrfutil, dfuArgs(values));
                                    dfu.on('close', code => {
                                        if (code !== 0) {
                                            logger.error(`DFU failed with error code ${code}`)
                                            stopDFU()(dispatch);
                                            return;
                                        }
                                        logger.info('DFU success');
                                        stopDFU()(dispatch);
                                    });
                                    dfu.stdout.on('data', data => {
                                        logger.info('dfu data:\t', data.toString('utf8'));
                                    });
                                    dfu.stderr.on('data', data => {
                                        logger.error('dfu err:\t', data.toString('utf8'));
                                        // TODO: should not really be here, but nrfjprog seems to not exit after fail.
                                        stopDFU()(dispatch);
                                    });
                                });


                            })
                        } else {
                            if (code !== 0) {
                                logger.error(` nrfjprog with error code ${code}`)
                                stopDFU()(dispatch);
                                return;
                            }
                            logger.info('DFU process started, this will take around 30 seconds!');

                            genpkg.on('close', code => {
                                if (code !== 0) {
                                    logger.error(`genpkg failed with error code ${code}`)
                                    stopDFU()(dispatch);
                                    return;
                                }
                                const bleMeshSerialInterfaceAPI = new BLEMeshSerialInterface();

                                const dfu = spawn(nrfutil, dfuArgs(values));
                                dfu.on('close', code => {
                                    if (code !== 0) {
                                        logger.error(`DFU failed with error code ${code}`)
                                        stopDFU()(dispatch);
                                        return;
                                    }
                                    logger.info('DFU success');
                                    stopDFU()(dispatch);
                                });
                                dfu.stdout.on('data', data => {
                                    logger.info('dfu data:\t', data.toString('utf8'));
                                });
                                dfu.stderr.on('data', data => {
                                    logger.error('dfu err:\t', data.toString('utf8'));
                                    // TODO: should not really be here, but nrfjprog seems to not exit after fail.
                                    stopDFU()(dispatch);
                                });
                            });

                        }
                    })

                    genpkg.stdout.on('data', data => {
                        logger.info('genpkg data:\t', data.toString('utf8'));
                    });
                    genpkg.stderr.on('data', err => {
                        logger.error('genpkg err:\t', err.toString('utf8'));
                    });
                });
            });
            bleMeshSerialInterfaceAPI.radioReset(err => {
                if (err) {
                    logger.error(`error occured in meshAdapterActions.js: ${err}.`);
                    throw err;
                }
            });
        })
    }
}


export const startDFU = () =>
    dispatch => dispatch({
        type: START_DFU
    })

export const stopDFU = () =>
    dispatch => dispatch({
        type: STOP_DFU
    })

export const showCustomFile = () =>
    dispatch => dispatch({
        type: SHOW_CUSTOM_FILE
    })

export const hideCustomFile = () =>
    dispatch => dispatch({
        type: HIDE_CUSTOM_FILE
    })

