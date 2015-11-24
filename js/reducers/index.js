'use strict';

import { combineReducers } from 'redux';

import adapter from './adapterReducer';
import discovery from './discoveryReducer';
import log from './logReducer';
import app from './appReducer';
import deviceDetails from './deviceDetailsReducer';
import advertisingSetup from './advertisingSetupReducer';
import bleEvent from './bleEventReducer';

const rootReducer = combineReducers({
    adapter,
    discovery,
    log,
    app,
    advertisingSetup,
    bleEvent,
});

export default rootReducer;
