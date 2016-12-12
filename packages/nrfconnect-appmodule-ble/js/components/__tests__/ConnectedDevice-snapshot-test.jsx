// Have to mock react-dom due to bug: https://github.com/facebook/react/issues/7386
// Can be removed after upgrade to react 15.4.0.
jest.mock('react-dom');

import React from 'react';
import renderer from 'react-test-renderer';
import { getImmutableDevice } from '../../utils/api';
import ConnectedDevice from '../ConnectedDevice';

const device = getImmutableDevice({
    instanceId: 'device-1',
    connected: true,
    address: 'Device Address',
    name: 'Device Name',
});

it('renders correctly without DFU support', () => {
    const tree = renderer.create(
        <ConnectedDevice
            device={device}
            id='connected-device-id'
            sourceId='source-id'
            layout='vertical'
            onConnectionParamsUpdate={() => {}}
            onDisconnect={() => {}}
            onPair={() => {}}
        />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

it('renders correctly with DFU support', () => {
    const tree = renderer.create(
        <ConnectedDevice
            device={device}
            id='connected-device-id'
            sourceId='source-id'
            layout='vertical'
            isDfuSupported={true}
            onClickDfu={() => {}}
            onConnectionParamsUpdate={() => {}}
            onDisconnect={() => {}}
            onPair={() => {}}
        />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});