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
    ERROR: 1,
    TIMED_OUT: 2,
    REJECTED: 3,
    CANCELED: 4,
    INDETERMINATE: 5,
    SUCCESS: 6,
};


export const BLEEventType = {
    USER_INITIATED_CONNECTION_UPDATE: 0,
    PERIPHERAL_INITIATED_CONNECTION_UPDATE: 1,
};
