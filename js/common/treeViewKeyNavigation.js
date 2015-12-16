'use strict';

export function findSelectedItem(deviceDetails, selectedInstanceId) {
    for (let item of traverseItems(deviceDetails, true)) {
        if (item.instanceId === selectedInstanceId) {
            return item;
        }
    }
}

export function* traverseItems(deviceDetails, skipCollapsed, backward) {
    if (!deviceDetails) {
        return;
    }

    const devices = deviceDetails.get('devices');

    if (devices !== undefined) {
        const [...deviceKeys] = backward ? devices.reverse().keys() : devices.keys();

        for (let i = 0; i < deviceKeys.length; i++) {
            const services = devices.getIn([deviceKeys[i], 'children']);

            if (services !== undefined) {
                const [...servicesKeys] = backward ? services.reverse().keys() : services.keys();

                for (let j = 0; j < servicesKeys.length; j++) {
                    const service = services.get(servicesKeys[j]);

                    if (!backward) { yield service; }

                    if (skipCollapsed && !service.expanded) {
                        if (backward) { yield service; }
                        continue;
                    }

                    const characteristics = services.get(servicesKeys[j]).children;

                    if (characteristics !== undefined) {
                        const [...characteristicsKeys] = backward ? characteristics.reverse().keys() : characteristics.keys();

                        for (let k = 0; k < characteristicsKeys.length; k++) {
                            const characteristic = characteristics.get(characteristicsKeys[k]);

                            if (!backward) { yield characteristic; }

                            if (skipCollapsed && !characteristic.expanded) {
                                if (backward) { yield characteristic; }
                                continue;
                            }

                            const descriptors = characteristics.get(characteristicsKeys[k]).children;

                            if (descriptors !== undefined) {
                                const [...descriptorsKeys] = backward ? descriptors.reverse().keys() : descriptors.keys();

                                for (let l = 0; l < descriptorsKeys.length; l++) {
                                    yield descriptors.get(descriptorsKeys[l]);
                                }
                            }

                            if (backward) { yield characteristic; }
                        }
                    }

                    if (backward) { yield service; }
                }
            }
        }
    }
}
