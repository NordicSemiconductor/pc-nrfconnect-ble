'use strict';

import { combineReducers } from 'redux';

import adapter from './adapter';
import discovery from './discovery';

const rootReducer = combineReducers({
    adapter,
    discovery
});

export default rootReducer;
