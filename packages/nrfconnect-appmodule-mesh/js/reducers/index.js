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

import { combineReducers } from 'redux';

import adapter from './adapterReducer';
import discovery from './discoveryReducer';
import app from './appReducer';
import log from './logReducer';
import advertising from './advertisingReducer';
import bleEvent from './bleEventReducer';
import errorDialog from './errorDialogReducer';
import firmwareUpdate from './firmwareUpdateReducer';
import meshMain from './mesh/meshMain';
import logger from './loggerReducer';

const rootReducer = combineReducers({
    adapter,
    discovery,
    log,
    logger,
    app,
    advertising,
    bleEvent,
    errorDialog,
    firmwareUpdate,
    meshMain,
});

export default rootReducer;
