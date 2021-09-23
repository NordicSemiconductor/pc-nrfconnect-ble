/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import { combineReducers } from 'redux';

import adapter from './adapterReducer';
import advertising from './advertisingReducer';
import bleEvent from './bleEventReducer';
import dfu from './dfuReducer';
import discovery from './discoveryReducer';

const rootReducer = combineReducers({
    adapter,
    discovery,
    advertising,
    bleEvent,
    dfu,
});

export default rootReducer;
