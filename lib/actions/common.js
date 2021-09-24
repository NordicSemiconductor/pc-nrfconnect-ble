/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

// These states describe he current state of the bleevent dialog
// used for connection update and security.
export const BLEEventState = {
    UNKNOWN: 0,
    ERROR: 1, // State used when an error has occured
    REJECTED: 2, // State used for connection params request that has been rejected
    DISCONNECTED: 3, // If device has disconnected, set to this state.
    INDETERMINATE: 4, // State is not determined yet, this is the start state for all events.
    SUCCESS: 5, // Event has been processed and has succeeded
    IGNORED: 6, // State used for events that the user has chosen to ignore
    PENDING: 7, // Event has been processed and is waiting to be resolved
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
    USER_INITIATED_PHY_UPDATE: 10,
    PEER_INITIATED_PHY_UPDATE: 11,
    USER_INITIATED_MTU_UPDATE: 12,
    PEER_INITIATED_MTU_UPDATE: 13,
    USER_INITIATED_DATA_LENGTH_UPDATE: 14,
    PEER_INITIATED_DATA_LENGTH_UPDATE: 15,
};

export const BLEPHYType = {
    BLE_GAP_PHY_AUTO: 0,
    BLE_GAP_PHY_1MBPS: 1,
    BLE_GAP_PHY_2MBPS: 2,
    BLE_GAP_PHY_CODED: 4,
};
