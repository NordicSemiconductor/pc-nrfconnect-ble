'use strict';

// Utility functions
export function getSelectedAdapter(state) {
    if(state !== null && state !== undefined) {
        const root = state.adapter;

        if(root !== null && root !== undefined) {
            const selectedAdapterIndex = root.selectedAdapter;

            if(selectedAdapterIndex !== null && selectedAdapterIndex !== undefined) {
                const adapter = state.adapter.adapters[selectedAdapterIndex];

                if(adapter !== null && adapter !== undefined) {
                    return adapter;
                }
            }
        }
    }
}
