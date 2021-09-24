/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { mount } from 'enzyme';

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

function mountComponent(props) {
    return mount(
        <ConnectedDevice
            id="connected-device-id"
            device={getImmutableDevice({})}
            sourceId="source-id"
            layout="vertical"
            onDisconnect={() => {}}
            onPair={() => {}}
            onConnectionParamsUpdate={() => {}}
            onClickDfu={() => {}}
            isDfuSupported={false}
            connectedDevicesNumber={1}
            onPhyUpdate={() => {}}
            onMtuUpdate={() => {}}
            onDataLengthUpdate={() => {}}
            {...props}
        />
    );
}

describe('ConnectedDevice', () => {
    describe('when DFU button is clicked', () => {
        const onClickDfu = jest.fn();
        const device = getImmutableDevice({});
        const wrapper = mountComponent({
            isDfuSupported: true,
            device,
            onClickDfu,
        });
        wrapper.find('button#dfuButton').simulate('click');

        it('should call onClickDfu', () => {
            expect(onClickDfu).toHaveBeenCalled();
        });
    });

    describe.skip('when update connection is clicked', () => {
        const onConnectionParamsUpdate = jest.fn();
        const device = getImmutableDevice({});
        const wrapper = mountComponent({
            device,
            onConnectionParamsUpdate,
        });
        wrapper.find('[id="updateConnectionMenuItem"]').simulate('click');

        it('should call onConnectionParamsUpdate', () => {
            expect(onConnectionParamsUpdate).toHaveBeenCalledWith(device);
        });
    });

    describe.skip('when disconnect is clicked', () => {
        const onDisconnect = jest.fn();
        const wrapper = mountComponent({
            onDisconnect,
        });
        wrapper.find('[id="disconnectMenuItem"]').simulate('click');

        it('should call onDisconnect', () => {
            expect(onDisconnect).toHaveBeenCalled();
        });
    });

    describe.skip('when pair is clicked', () => {
        const onPair = jest.fn();
        const wrapper = mountComponent({
            onPair,
        });
        wrapper.find('[id="pairMenuItem"]').simulate('click');

        it('should call onPair', () => {
            expect(onPair).toHaveBeenCalled();
        });
    });
});
