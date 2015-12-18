'use strict';

import { combineReducers } from 'redux';

import adapter from './adapterReducer';
import discovery from './discoveryReducer';
import log from './logReducer';
import app from './appReducer';
import advertisingSetup from './advertisingSetupReducer';
import bleEvent from './bleEventReducer';
import errorDialog from './errorDialogReducer';

const rootReducer = combineReducers({
    adapter,
    discovery,
    log,
    app,
    advertisingSetup,
    bleEvent,
    errorDialog
});

export default rootReducer;
