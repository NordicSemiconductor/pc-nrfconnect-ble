'use strict';

import * as BLEEventActions from '../actions/bleEventActions';
import Immutable, { Record, List } from 'immutable';

import { logger } from '../logging';

function showEventViewer(visible) {

}

export default function bleEvent(state, action)
{
    switch(action.type) {
        case BLEEventActions.BLE_EVENT_VIEWER_VISIBLE:
            return showEventViewer(action.visible);
        default:
            return state;
    }
}
