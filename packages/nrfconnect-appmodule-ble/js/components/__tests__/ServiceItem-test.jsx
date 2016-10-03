jest.mock('../../utils/colorDefinitions', () => {
    return {
        getColor: () => {
            return {r: 255, g: 255, b: 255}
        }
    };
});
jest.mock('../../utils/uuid_definitions', () => {});


import React from 'react';
import { mount } from 'enzyme';
import { getImmutableService } from '../../utils/api';
import ServiceItem from '../ServiceItem';

it('calls button action when button is clicked', () => {
    const button = {
        onClick: jest.fn()
    };
    const wrapper = mount(<ServiceItem item={getImmutableService({})} button={button} />);
    wrapper.find('button').simulate('click');

    expect(button.onClick).toBeCalled();
});
