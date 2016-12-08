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

import {List, Record, Map} from 'immutable';

import * as DfuActions from '../../actions/mesh/dfuActions';

const ImmutableRoot = Record({
  isRunning: false,
  showCustomFile: false,
})

const getImmutableRoot = () => new ImmutableRoot();

export default function dfu(state = getImmutableRoot(), action) {
  switch (action.type) {
    case DfuActions.START_DFU:
      return state.set('isRunning', true);
    case DfuActions.STOP_DFU:
      return state.set('isRunning', false);
    case DfuActions.SHOW_CUSTOM_FILE:
      return state.set('showCustomFile', true);
    case DfuActions.HIDE_CUSTOM_FILE:
      return state.set('showCustomFile', false);
  }
  return state;
}
