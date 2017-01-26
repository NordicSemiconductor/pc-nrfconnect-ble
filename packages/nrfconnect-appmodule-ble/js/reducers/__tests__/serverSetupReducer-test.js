// Have to mock this module, because it uses electron and sqlite3, which
// are not available when running tests
jest.mock('../../logging/index', () => {});

// Have to mock these modules, because they depend on various resources
// (sqlite3, electron, native modules, etc.) that are not available during
// testing.
jest.mock('../../utils/fileUtil', () => {});
jest.mock('../../utils/uuid_definitions', () => {});
jest.mock('../../actions/firmwareUpdateActions', () => {});
jest.mock('pc-nrfjprog-js', () => {});
jest.mock('pc-ble-driver-js', () => {
    return { api: { AdapterFactory: { getInstance: () => {} } } };
});
jest.mock('serialport', () => {});


import reducer from '../serverSetupReducer';
import * as ServerSetupActions from '../../actions/serverSetupActions';

const initialState = reducer(undefined, {});

describe('serverSetupReducer', () => {
    describe('initial state', () => {
        const services = initialState.children;

        it('should have mandatory services: Generic Access and Generic Attribute', () => {
            expect(services.first().name).toEqual('Generic Access');
            expect(services.last().name).toEqual('Generic Attribute');
        });

        it('should have mandatory GAP characteristics: Device Name, Appearance, and PPCP', () => {
            const gapService = services.first();
            const characteristics = gapService.children.toList();

            expect(characteristics.size).toEqual(3);
            expect(characteristics.get(0).name).toEqual('Device Name');
            expect(characteristics.get(1).name).toEqual('Appearance');
            expect(characteristics.get(2).name).toEqual('Peripheral Preferred Connection Parameters');
        });
    });

    describe('when adding a new service', () => {
        const stateWithService = reducer(initialState, {
            type: ServerSetupActions.ADD_NEW_SERVICE,
        });
        const services = stateWithService.children;

        it('should have one extra service in addition to the initial ones', () => {
            const initialServiceCount = initialState.children.size;

            expect(services.size).toEqual(initialServiceCount + 1);
        });

        describe('when selecting the new service', () => {
            const stateWithSelectedService = reducer(stateWithService, {
                type: ServerSetupActions.SELECT_COMPONENT,
                component: services.last().instanceId,
            });

            it('should have selected the new service', () => {
                expect(stateWithSelectedService.selectedComponent).toEqual(services.last().instanceId);
            });

            describe('when deleting the selected service', () => {
                const stateWithDeletedService = reducer(stateWithSelectedService, {
                    type: ServerSetupActions.REMOVE_ATTRIBUTE,
                });

                it('should have initial services only', () => {
                    const initialServices = initialState.children;
                    const services = stateWithDeletedService.children;

                    expect(services.size).toEqual(initialServices.size);
                    expect(services.first().instanceId).toEqual(initialServices.first().instanceId);
                    expect(services.last().instanceId).toEqual(initialServices.last().instanceId);
                });
            });
        });

        describe('when adding a new characteristic to the service', () => {
            const service = services.last();
            const stateWithCharacteristic = reducer(stateWithService, {
                type: ServerSetupActions.ADD_NEW_CHARACTERISTIC,
                parent: service,
            });
            const characteristics = stateWithCharacteristic.children.last().children;

            it('should have one characteristic', () => {
                expect(characteristics.size).toEqual(1);
            });

            describe('when adding a descriptor to the characteristic', () => {
                const characteristic = characteristics.first();
                const stateWithDescriptor = reducer(stateWithCharacteristic, {
                    type: ServerSetupActions.ADD_NEW_DESCRIPTOR,
                    parent: characteristic,
                });
                const descriptors = stateWithDescriptor.children.last().children.first().children;

                it('should have one descriptor', () => {
                    expect(descriptors.size).toEqual(1);
                });
            });
        });
    });

    describe('when changing the value of the device name characteristic', () => {
        const initialServices = initialState.children;
        const initialGapService = initialServices.first();
        const initialGapCharacteristics = initialGapService.children;
        const initialDeviceNameCharacteristic = initialGapCharacteristics.first();
        const state = reducer(initialState, {
            type: ServerSetupActions.CHANGED_ATTRIBUTE,
            attribute: initialDeviceNameCharacteristic.set('value', [0x01, 0x02, 0x03]).toJS(),
        });

        it('should have new value', () => {
            const gapService = state.children.first();
            const deviceNameCharacteristic = gapService.children.first();

            expect(deviceNameCharacteristic.value.toJS()).toEqual([0x01, 0x02, 0x03]);
        });
    });

    describe('when loading one service with three characteristics and one descriptor', () => {
        const state = reducer(initialState, {
            type: ServerSetupActions.LOAD,
            setup: getOneServiceWithThreeCharacteristicsAndOneDescriptor(),
        });
        const services = state.children;

        it('should have one service', () => {
            expect(services.size).toEqual(1);
        });

        it('should have three characteristics for the first service', () => {
            const characteristics = services.first().children;
            expect(characteristics.size).toEqual(3);
        });

        it('should have one descriptor for the first characteristic', () => {
            const descriptors = services.first().children.first().children;
            expect(descriptors.size).toEqual(1);
        });
    });
});

function getOneServiceWithThreeCharacteristicsAndOneDescriptor() {
    return {
        "children": {
            "local.server.3": {
                "instanceId": "local.server.3",
                "uuid": "1800",
                "name": "Generic Access",
                "children": {
                    "local.server.3.5": {
                        "instanceId": "local.server.3.5",
                        "uuid": "2A00",
                        "name": "Device Name",
                        "children": {
                            "local.server.3.5.7": {
                                "instanceId": "local.server.3.5.7",
                                "uuid": "2902",
                                "name": 'Client Characteristic Configuration',
                            },
                        },
                    },
                    "local.server.3.6": {
                        "instanceId": "local.server.3.6",
                        "uuid": "2A01",
                        "name": "Appearance",
                        "children": {},
                    },
                    "local.server.3.8": {
                        "instanceId": "local.server.3.8",
                        "uuid": "2A04",
                        "name": "Peripheral Preferred Connection Parameters",
                        "children": {},
                    }
                }
            }
        }
    };
}
