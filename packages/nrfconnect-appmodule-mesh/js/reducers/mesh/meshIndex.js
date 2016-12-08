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
import { reducer as formReducer } from 'redux-form';

import adapter from './meshAdapterReducer';
import logger from '../loggerReducer';
import log from '../logReducer';
import app from '../appReducer';
import errorDialog from '../errorDialogReducer';
import meshMain from './meshMain';
import multiProg from './multiProgReducer'
import dfu from './dfuReducer'
import meshPageSelector from './meshPageSelector'


const rootReducer = combineReducers({
    adapter,
    logger,
    app,
    log,
    errorDialog,
    meshMain,
    multiProg,
    dfu,
    form: formReducer,
    meshPageSelector,
});

export default rootReducer;
