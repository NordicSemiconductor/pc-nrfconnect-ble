/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import renderer from 'react-test-renderer';

import { getImmutableDevice } from '../../utils/api';
import ConnectedDevice from '../ConnectedDevice';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn().mockImplementation(() => ({
        app: {
            adapter: {
                bleDriver: {
                    adapter: { _bleDriver: { NRF_SD_BLE_API_VERSION: 5 } },
                },
            },
        },
    })),
}));

const device = getImmutableDevice({
    instanceId: 'device-1',
    connected: true,
    address: 'Device Address',
    name: 'Device Name',
});

describe('ConnectedDevice', () => {
    it('should render correctly without DFU support', () => {
        const tree = renderer
            .create(
                <ConnectedDevice
                    device={device}
                    id="connected-device-id"
                    sourceId="source-id"
                    layout="vertical"
                    isDfuSupported={false}
                    onClickDfu={() => {}}
                    onConnectionParamsUpdate={() => {}}
                    onDisconnect={() => {}}
                    onPair={() => {}}
                    connectedDevicesNumber={1}
                    onPhyUpdate={() => {}}
                    onMtuUpdate={() => {}}
                    onDataLengthUpdate={() => {}}
                />
            )
            .toJSON();

        expect(tree).toMatchSnapshot();
    });

    it('should render correctly with DFU support', () => {
        const tree = renderer
            .create(
                <ConnectedDevice
                    device={device}
                    id="connected-device-id"
                    sourceId="source-id"
                    layout="vertical"
                    isDfuSupported
                    onClickDfu={() => {}}
                    onConnectionParamsUpdate={() => {}}
                    onDisconnect={() => {}}
                    onPair={() => {}}
                    connectedDevicesNumber={1}
                    onPhyUpdate={() => {}}
                    onMtuUpdate={() => {}}
                    onDataLengthUpdate={() => {}}
                />
            )
            .toJSON();

        expect(tree).toMatchSnapshot();
    });
});
