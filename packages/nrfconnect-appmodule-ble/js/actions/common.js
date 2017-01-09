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

// Utility functions
export function getSelectedAdapter(state) {
    const selectedAdapter = state.adapter.selectedAdapter;

    if (selectedAdapter !== undefined && selectedAdapter !== null) {
        return state.adapter.getIn(['adapters', selectedAdapter]);
    }
}

// TODO: get clarity regarding what these states actually means...
export const BLEEventState = {
    UNKNOWN: 0,
    ERROR: 1,         // State used when an error has occured
    REJECTED: 2,      // State used for connection params request that has been rejected
    DISCONNECTED: 3,  // If device has disconnected, set to this state.
    INDETERMINATE: 4, // State is not determined yet, this is the start state for all events.
    SUCCESS: 5,       // Event has been processed and has succeeded
    IGNORED: 6,       // State used for events that the user has chosen to ignore
    PENDING: 7,       // Event has been processed and is waiting to be resolved
};

export const BLEEventType = {
    USER_INITIATED_CONNECTION_UPDATE: 0,
    PEER_CENTRAL_INITIATED_CONNECTION_UPDATE: 1,
    PEER_PERIPHERAL_INITIATED_CONNECTION_UPDATE: 2,
    USER_INITIATED_PAIRING: 3,
    PEER_INITIATED_PAIRING: 4,
    PASSKEY_DISPLAY: 5,
    PASSKEY_REQUEST: 6,
    NUMERICAL_COMPARISON: 7,
    LEGACY_OOB_REQUEST: 8,
    LESC_OOB_REQUEST: 9,
};
