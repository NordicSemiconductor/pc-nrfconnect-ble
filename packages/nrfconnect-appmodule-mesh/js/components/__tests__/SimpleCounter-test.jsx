import React from 'react';
import { mount } from 'enzyme';
import SimpleCounter from '../SimpleCounter';
import { Button } from 'react-bootstrap';

it('calls onIncrement when button is clicked', () => {
    const onIncrementMock = jest.fn();
    const counterValue = 0;
    const wrapper = mount(<SimpleCounter value={counterValue} onIncrement={onIncrementMock} />);

    wrapper.find(Button).simulate('click');

    expect(onIncrementMock).toBeCalled();
});
