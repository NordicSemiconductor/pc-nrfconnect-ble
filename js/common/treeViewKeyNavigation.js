'use strict';

export function findSelectedItem(deviceDetails, deviceInstanceId, selectedInstanceId) {
    for (let item of traverseItems(deviceDetails, deviceInstanceId, true)) {
        if (item.instanceId === selectedInstanceId) {
            return item;
        }
    }
}

export function* traverseItems(deviceDetails, deviceInstanceId, skipCollapsed, backward) {
    if (!deviceDetails || !deviceInstanceId) {
        return;
    }

    const services = deviceDetails.getIn(['devices', deviceInstanceId, 'children']);

    if (services !== undefined) {
        const [...servicesKeys] = backward ? services.reverse().keys() : services.keys();

        for (let i = 0; i < servicesKeys.length; i++) {
            const service = services.get(servicesKeys[i]);

            if (!backward) { yield service; }

            if (skipCollapsed && !service.expanded) {
                if (backward) { yield service; }
                continue;
            }

            const characteristics = services.get(servicesKeys[i]).children;

            if (characteristics !== undefined) {
                const [...characteristicsKeys] = backward ? characteristics.reverse().keys() : characteristics.keys();

                for (let j = 0; j < characteristicsKeys.length; j++) {
                    const characteristic = characteristics.get(characteristicsKeys[j]);

                    if (!backward) { yield characteristic; }

                    if (skipCollapsed && !characteristic.expanded) {
                        if (backward) { yield characteristic; }
                        continue;
                    }

                    const descriptors = characteristics.get(characteristicsKeys[j]).children;

                    if (descriptors !== undefined) {
                        const [...descriptorsKeys] = backward ? descriptors.reverse().keys() : descriptors.keys();

                        for (let k = 0; k < descriptorsKeys.length; k++) {
                            yield descriptors.get(descriptorsKeys[k]);
                        }
                    }

                    if (backward) { yield characteristic; }
                }
            }

            if (backward) { yield service; }
        }
    }
}
