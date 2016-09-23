import React from 'react';
import { mount } from 'enzyme';
import { List } from 'immutable';
import { getImmutableAppmodule } from '../../utils/api';
import AppmoduleList from '../AppmoduleList';
import AppmoduleListItem from '../AppmoduleListItem';

const appmodules = List.of(getImmutableAppmodule({
    name: 'nrfconnect-appmodule-ble',
    title: 'ble',
    description: 'ble description',
    icon: 'resources/ble-icon.png'
}));

it('calls onAppmoduleSelected when appmodule is clicked', () => {
    const onAppmoduleSelectedMock = jest.fn();
    const wrapper = mount(<AppmoduleList appmodules={appmodules} onAppmoduleSelected={onAppmoduleSelectedMock} />);

    wrapper.find(AppmoduleListItem).simulate('click');

    expect(onAppmoduleSelectedMock).toBeCalled();
});
