'use strict';

import { combineReducers } from 'redux';

import adapter from './adapterReducer';
import discovery from './discoveryReducer';
import log from './logReducer';
import app from './appReducer';
import deviceDetails from './deviceDetailsReducer';

const rootReducer = combineReducers({
    adapter,
    discovery,
    log,
    app,
    deviceDetails,
});

export default rootReducer;
