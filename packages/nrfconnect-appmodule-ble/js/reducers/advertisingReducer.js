/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

 'use strict';

import { Record, List } from 'immutable';

import * as advertisingActions from '../actions/advertisingActions';
import * as AdapterAction from '../actions/adapterActions';
import { logger } from '../logging';

const defaultAdvData = [{
    type: 'Complete local name',
    typeKey: 0,
    typeApi: 'completeLocalName',
    value: 'nRF Connect',
    formattedValue: 'nRF Connect',
    id: 10000, // Random high id to avoid conflict with autoincremented ids
}];

const InitialState = Record({
    advDataEntries: List(defaultAdvData),
    scanResponseEntries: List(),
    tempAdvDataEntries: List(defaultAdvData),
    tempScanRespEntries: List(),
    show: false,
    setAdvdataStatus: '',
});

const initialState = new InitialState();

export default function advertising(state = initialState, action) {
    switch (action.type) {
        case advertisingActions.ADD_ADVDATA_ENTRY:
            return state.set('tempAdvDataEntries', state.tempAdvDataEntries.push(action.entry));
        case advertisingActions.ADD_SCANRSP_ENTRY:
            return state.set('tempScanRespEntries', state.tempScanRespEntries.push(action.entry));
        case advertisingActions.DELETE_ADVDATA_ENTRY:
            return state.set('tempAdvDataEntries', state.tempAdvDataEntries.filterNot(entry => entry.id === action.id));
        case advertisingActions.DELETE_SCANRSP_ENTRY:
            return state.set('tempScanRespEntries', state.tempScanRespEntries.filterNot(entry => entry.id === action.id));
        case advertisingActions.APPLY_CHANGES:
            state = state.set('advDataEntries', state.tempAdvDataEntries);
            state = state.set('scanResponseEntries', state.tempScanRespEntries);
            return state;
        case advertisingActions.SHOW_DIALOG:
            return state.set('show', true);
        case advertisingActions.HIDE_DIALOG:
            state = state.set('tempAdvDataEntries', state.advDataEntries);
            state = state.set('tempScanRespEntries', state.scanResponseEntries);
            state = state.set('show', false);
            return state;
        case advertisingActions.SET_ADVDATA_COMPLETED:
            return state.set('setAdvdataStatus', action.status);
        case advertisingActions.ADVERTISING_STARTED:
            logger.info('Advertising started');
            return state;
        case advertisingActions.ADVERTISING_STOPPED:
            logger.info('Advertising stopped');
            return state;
        case AdapterAction.ADAPTER_RESET_PERFORMED:
            return initialState;
        default:
            return state;
    }
}
