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

/* eslint-disable import/first */

// Have to mock these modules, because they depend on various resources
// (sqlite3, electron, native modules, etc.) that are not available during
// testing.
jest.mock('../../utils/fileUtil', () => {});
jest.mock('../../utils/uuid_definitions', () => {});
jest.mock('../../api/nrfjprog', () => {});

import * as AdapterActions from '../../actions/adapterActions';
import * as DiscoveryActions from '../../actions/discoveryActions';
import reducer from '../discoveryReducer';

const initialState = reducer(undefined, {});

describe('discoveryReducer', () => {
    describe('when handling DEVICE_DISCOVERED', () => {
        const device = {
            instanceId: 'instanceId',
            connected: false,
            address: 'address',
            addressType: 'addressType',
            name: 'name',
            advType: 'advType',
            adData: {
                adDataProperty: 'adDataProperty',
            },
            services: [0x1800, 0x1801],
            rssi: 0,
        };

        const state = reducer(initialState, {
            type: AdapterActions.DEVICE_DISCOVERED,
            device,
        });

        it('should add device with address as key', () => {
            expect(state.devices.get(device.address)).toBeDefined();
        });

        it('should add basic device properties', () => {
            const addedDevice = state.devices.get(device.address);
            expect(addedDevice.instanceId).toEqual(device.instanceId);
            expect(addedDevice.connected).toEqual(device.connected);
            expect(addedDevice.address).toEqual(device.address);
            expect(addedDevice.addressType).toEqual(device.addressType);
            expect(addedDevice.name).toEqual(device.name);
            expect(addedDevice.advType).toEqual(device.advType);
        });
    });

    describe('when device is expanded and then re-discovered', () => {
        const address = 'some-device-address';
        const device = {
            address,
        };
        const discoveredState = reducer(initialState, {
            type: AdapterActions.DEVICE_DISCOVERED,
            device,
        });
        const expandedState = reducer(discoveredState, {
            type: DiscoveryActions.DISCOVERY_TOGGLE_EXPANDED,
            deviceAddress: address,
        });
        const reDiscoveredState = reducer(expandedState, {
            type: AdapterActions.DEVICE_DISCOVERED,
            device,
        });

        it('should keep the device expanded', () => {
            const updatedDevice = reDiscoveredState.devices.get(address);
            expect(updatedDevice.isExpanded).toEqual(true);
        });
    });

    describe('when existing device is discovered again with new properties', () => {
        const address = 'some-device-address';
        const existingDevice = {
            address,
            instanceId: 'instance-1',
            isExpanded: true,
            adData: {
                adDataProperty: 'adDataProperty',
            },
        };
        const newDevice = {
            address,
            instanceId: 'instance-2',
            isExpanded: false,
            adData: {
                adDataProperty: 'adDataProperty',
                property2: 'property2',
            },
        };
        const intermediateState = reducer(initialState, {
            type: AdapterActions.DEVICE_DISCOVERED,
            device: existingDevice,
        });
        const state = reducer(intermediateState, {
            type: AdapterActions.DEVICE_DISCOVERED,
            device: newDevice,
        });
        const updatedDevice = state.devices.get(address);

        it('should update instance id', () => {
            expect(updatedDevice.instanceId).toEqual(newDevice.instanceId);
        });

        it('should not update expanded state', () => {
            expect(updatedDevice.isExpanded).toEqual(newDevice.isExpanded);
        });
    });

    describe('when existing device is discovered again with empty name', () => {
        const address = 'some-device-address';
        const existingDevice = {
            name: 'name',
            address,
        };
        const newDevice = {
            name: '',
            address,
        };
        const intermediateState = reducer(initialState, {
            type: AdapterActions.DEVICE_DISCOVERED,
            device: existingDevice,
        });
        const state = reducer(intermediateState, {
            type: AdapterActions.DEVICE_DISCOVERED,
            device: newDevice,
        });

        it('should keep existing name', () => {
            const device = state.devices.get(address);
            expect(device.name).toEqual(existingDevice.name);
        });
    });

    describe('when existing device is discovered again with new name', () => {
        const address = 'some-device-address';
        const existingDevice = {
            name: 'name',
            address,
        };
        const newDevice = {
            name: 'newName',
            address,
        };
        const intermediateState = reducer(initialState, {
            type: AdapterActions.DEVICE_DISCOVERED,
            device: existingDevice,
        });
        const state = reducer(intermediateState, {
            type: AdapterActions.DEVICE_DISCOVERED,
            device: newDevice,
        });

        it('should update name', () => {
            const device = state.devices.get(address);
            expect(device.name).toEqual(newDevice.name);
        });
    });

    describe('when existing device is discovered again with empty service list', () => {
        const address = 'some-device-address';
        const existingDevice = {
            services: [0x1800, 0x1801],
            address,
        };
        const newDevice = {
            services: [],
            address,
        };
        const intermediateState = reducer(initialState, {
            type: AdapterActions.DEVICE_DISCOVERED,
            device: existingDevice,
        });
        const state = reducer(intermediateState, {
            type: AdapterActions.DEVICE_DISCOVERED,
            device: newDevice,
        });

        it('should keep existing service list', () => {
            const device = state.devices.get(address);
            expect(device.services.toJS()).toEqual(existingDevice.services);
        });
    });

    describe('when existing device is discovered again with new service list', () => {
        const address = 'some-device-address';
        const existingDevice = {
            services: [0x1800, 0x1801],
            address,
        };
        const newDevice = {
            services: [0x1800, 0x1801, 0x1802],
            address,
        };
        const intermediateState = reducer(initialState, {
            type: AdapterActions.DEVICE_DISCOVERED,
            device: existingDevice,
        });
        const state = reducer(intermediateState, {
            type: AdapterActions.DEVICE_DISCOVERED,
            device: newDevice,
        });

        it('should update service list', () => {
            const device = state.devices.get(address);
            expect(device.services.toJS()).toEqual(newDevice.services);
        });
    });

    describe('when device is discovered and then connecting to it', () => {
        const address = 'some-device-address';
        const device = {
            address,
        };
        const discoveredState = reducer(initialState, {
            type: AdapterActions.DEVICE_DISCOVERED,
            device,
        });
        const connectingState = reducer(discoveredState, {
            type: AdapterActions.DEVICE_CONNECT,
            device,
        });

        it('should set isConnecting to true', () => {
            const updatedDevice = connectingState.devices.get(address);
            expect(updatedDevice.isConnecting).toEqual(true);
        });

        describe('when connect has completed', () => {
            const connectedState = reducer(connectingState, {
                type: AdapterActions.DEVICE_CONNECTED,
                device,
            });

            it('should set isConnecting to false', () => {
                const updatedDevice = connectedState.devices.get(address);
                expect(updatedDevice.isConnecting).toEqual(false);
            });

            it('should set connected to true', () => {
                const updatedDevice = connectedState.devices.get(address);
                expect(updatedDevice.connected).toEqual(true);
            });

            describe('when device has been disconnected', () => {
                const disconnectedState = reducer(connectedState, {
                    type: AdapterActions.DEVICE_DISCONNECTED,
                    device,
                });

                it('should set connected to false', () => {
                    const updatedDevice = disconnectedState.devices.get(
                        address
                    );
                    expect(updatedDevice.connected).toEqual(false);
                });
            });
        });
    });

    describe('when an undiscovered device is being connected to', () => {
        const address = 'some-device-address';
        const device = {
            address,
        };
        const state = reducer(initialState, {
            type: AdapterActions.DEVICE_CONNECT,
            device,
        });

        it('should not modify discovered devices', () => {
            expect(state.devices).toEqual(initialState.devices);
        });
    });

    describe('when an undiscovered device has been connected to', () => {
        const address = 'some-device-address';
        const device = {
            address,
        };
        const state = reducer(initialState, {
            type: AdapterActions.DEVICE_CONNECTED,
            device,
        });

        it('should not modify discovered devices', () => {
            expect(state.devices).toEqual(initialState.devices);
        });
    });

    describe('when an undiscovered device has been disconnected', () => {
        const address = 'some-device-address';
        const device = {
            address,
        };
        const state = reducer(initialState, {
            type: AdapterActions.DEVICE_DISCONNECTED,
            device,
        });

        it('should not modify discovered devices', () => {
            expect(state.devices).toEqual(initialState.devices);
        });
    });
});
