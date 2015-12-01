'use strict';

// Utility functions
export function getSelectedAdapter(state) {
    if (state !== null && state !== undefined) {
        const root = state.adapter;

        if (root !== null && root !== undefined) {
            const selectedAdapterIndex = root.selectedAdapter;

            if (selectedAdapterIndex !== null && selectedAdapterIndex !== undefined) {
                const adapter = state.adapter.adapters[selectedAdapterIndex];

                if (adapter !== null && adapter !== undefined) {
                    return adapter;
                }
            }
        }
    }
}

// TODO: get clarity regarding what these states actually means...
export const BLEEventState = {
    UNKNOWN: 0,
    ERROR: 1,         //
    REJECTED: 2,      //
    DISCONNECTED: 3,  // If device has disconnected, set to this state.
    INDETERMINATE: 4, // State is not determined yet, this is the start state for all events.
    SUCCESS: 5,
    IGNORED: 6,        // State used for events that the user has chosen to ignore
};

export const BLEEventType = {
    USER_INITIATED_CONNECTION_UPDATE: 0,
    PERIPHERAL_INITIATED_CONNECTION_UPDATE: 1,
};
