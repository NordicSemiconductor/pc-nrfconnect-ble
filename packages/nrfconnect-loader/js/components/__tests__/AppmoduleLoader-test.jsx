import React from 'react';
import renderer from 'react-test-renderer';
import { List } from 'immutable';
import { getImmutableAppmodule } from '../../utils/api';
import AppmoduleLoader from '../AppmoduleLoader';

// Have to mock react-dom due to bug: https://github.com/facebook/react/issues/7386
// Can be removed after upgrade to react 15.4.0.
jest.mock('react-dom');

const appmodules = List.of(
    getImmutableAppmodule({
        name: 'nrfconnect-appmodule-ble',
        title: 'ble',
        description: 'ble description',
        icon: 'resources/ble-icon.png'
    }),
    getImmutableAppmodule({
        name: 'nrfconnect-appmodule-mesh',
        title: 'mesh',
        description: 'mesh description',
        icon: 'resources/mesh-icon.png'
    })
);

it('renders correctly', () => {
    const tree = renderer.create(
        <AppmoduleLoader appmodules={appmodules} onAppmoduleSelected={() => {}} />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});
