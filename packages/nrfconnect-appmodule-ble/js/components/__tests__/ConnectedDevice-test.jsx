jest.mock('pc-ble-driver-js', () => {});

import React from 'react';
import { mount } from 'enzyme';
import { getImmutableDevice } from '../../utils/api';
import ConnectedDevice from '../ConnectedDevice';

describe('when DFU button is clicked', () => {
    const onClickDfu = jest.fn();
    const device = getImmutableDevice({});
    const wrapper = mountComponent({
        isDfuSupported: true,
        device,
        onClickDfu,
    });
    wrapper.find('[id="dfuButton"]').simulate('click');

    it('calls onClickDfu', () => {
        expect(onClickDfu).toHaveBeenCalled();
    });
});

describe('when update connection is clicked', () => {
    const onConnectionParamsUpdate = jest.fn();
    const device = getImmutableDevice({});
    const wrapper = mountComponent({
        device,
        onConnectionParamsUpdate,
    });
    wrapper.find('[id="updateConnectionMenuItem"]').simulate('click');

    it('calls onConnectionParamsUpdate', () => {
        expect(onConnectionParamsUpdate).toHaveBeenCalledWith(device);
    });
});

describe('when disconnect is clicked', () => {
    const onDisconnect = jest.fn();
    const wrapper = mountComponent({
        onDisconnect,
    });
    wrapper.find('[id="disconnectMenuItem"]').simulate('click');

    it('calls onDisconnect', () => {
        expect(onDisconnect).toHaveBeenCalled();
    });
});

describe('when pair is clicked', () => {
    const onPair = jest.fn();
    const wrapper = mountComponent({
        onPair,
    });
    wrapper.find('[id="pairMenuItem"]').simulate('click');

    it('calls onPair', () => {
        expect(onPair).toHaveBeenCalled();
    });
});

function mountComponent(props) {
    return mount(<ConnectedDevice
        id="connected-device-id"
        device={getImmutableDevice({})}
        sourceId="source-id"
        layout="vertical"
        onDisconnect={() => {}}
        onPair={() => {}}
        onConnectionParamsUpdate={() => {}}
        {...props}
    />)
}
