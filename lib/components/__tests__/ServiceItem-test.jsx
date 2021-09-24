/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable import/first */

jest.mock('../../utils/colorDefinitions', () => ({
    getColor: () => ({ r: 255, g: 255, b: 255 }),
}));
jest.mock('../../utils/uuid_definitions', () => {});

import React from 'react';
import { mount } from 'enzyme';

import { getImmutableService } from '../../utils/api';
import ServiceItem from '../ServiceItem';

describe('ServiceItem', () => {
    it('should call button action when button is clicked', () => {
        const button = {
            onClick: jest.fn(),
        };
        const wrapper = mount(
            <ServiceItem item={getImmutableService({})} button={button} />
        );
        wrapper.find('button').simulate('click');

        expect(button.onClick).toBeCalled();
    });
});
