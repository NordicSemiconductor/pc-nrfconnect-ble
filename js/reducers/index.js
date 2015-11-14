'use strict';

import { combineReducers } from 'redux';

import adapter from './adapterReducer';
import discovery from './discoveryReducer';
import log from './logReducer';

const rootReducer = combineReducers({
    adapter,
    discovery,
    log
});

export default rootReducer;
