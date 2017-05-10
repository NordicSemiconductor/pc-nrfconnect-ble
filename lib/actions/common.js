/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

// Utility functions
export function getSelectedAdapter(state) {
    const selectedAdapterIndex = state.app.adapter.selectedAdapterIndex;

    if (selectedAdapterIndex !== null) {
        return state.app.adapter.getIn(['adapters', selectedAdapterIndex]);
    }
    return undefined;
}

// These states describe he current state of the bleevent dialog
// used for connection update and security.
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
