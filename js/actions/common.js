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
};

export const BLEEventType = {
    USER_INITIATED_CONNECTION_UPDATE: 0,
    PERIPHERAL_INITIATED_CONNECTION_UPDATE: 1,
    USER_INITIATED_PAIRING: 2,
    PEER_INITIATED_PAIRING: 3,
    PEER_REQUESTED_PASSKEY: 4,
    PEER_REQUESTED_OOB: 5,
};
