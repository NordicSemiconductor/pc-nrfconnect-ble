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
};
