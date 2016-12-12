// Have to mock react-dom due to bug: https://github.com/facebook/react/issues/7386
// Can be removed after upgrade to react 15.4.0.
jest.mock('react-dom');
jest.mock('../../utils/colorDefinitions', () => {
    return {
        getColor: () => {
            return {r: 255, g: 255, b: 255}
        }
    };
});
jest.mock('../../utils/uuid_definitions', () => {});
jest.mock('pc-ble-driver-js', () => {});

import React from 'react';
import renderer from 'react-test-renderer';
import { getImmutableService } from '../../utils/api';
import ServiceItem from '../ServiceItem';

const service = getImmutableService({
    instanceId: 'service-1',
    deviceInstanceId: 'service-deviceInstance-1',
    uuid: 'service-uuid-1',
    name: 'Service Name',
    children: []
});

it('renders correctly with no button', () => {
    const tree = renderer.create(
        <ServiceItem item={service} />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

it('renders correctly with button', () => {
    const button = {
        onClick: () => {},
        icon: 'path/to/icon.png'
    };
    const tree = renderer.create(
        <ServiceItem item={service} button={button} />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});
