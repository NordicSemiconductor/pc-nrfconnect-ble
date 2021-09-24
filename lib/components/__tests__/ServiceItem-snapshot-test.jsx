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
import renderer from 'react-test-renderer';

import { getImmutableService } from '../../utils/api';
import ServiceItem from '../ServiceItem';

const service = getImmutableService({
    instanceId: 'service-1',
    deviceInstanceId: 'service-deviceInstance-1',
    uuid: 'service-uuid-1',
    name: 'Service Name',
    children: [],
});

describe('ServiceItem', () => {
    it('should render correctly with no button', () => {
        const tree = renderer.create(<ServiceItem item={service} />).toJSON();

        expect(tree).toMatchSnapshot();
    });

    it('should render correctly with button', () => {
        const button = {
            onClick: () => {},
            icon: 'path/to/icon.png',
        };
        const tree = renderer
            .create(<ServiceItem item={service} button={button} />)
            .toJSON();

        expect(tree).toMatchSnapshot();
    });
});
