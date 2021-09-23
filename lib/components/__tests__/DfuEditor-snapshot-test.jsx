/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import renderer from 'react-test-renderer';

import DfuEditor from '../DfuEditor';

function renderComponent(props) {
    return renderer
        .create(
            <DfuEditor
                isStarted={false}
                onChooseFile={() => {}}
                onStartDfu={() => {}}
                onStopDfu={() => {}}
                {...props}
            />
        )
        .toJSON();
}

describe('DfuEditor', () => {
    it('should render with default props', () => {
        expect(renderComponent({})).toMatchSnapshot();
    });

    it('should render with file path', () => {
        expect(
            renderComponent({
                filePath: '/path/to/file',
            })
        ).toMatchSnapshot();
    });

    it('should render with file path and package info', () => {
        expect(
            renderComponent({
                filePath: '/path/to/file',
                packageInfo: {
                    application: {
                        bin_file: 'dfu.bin',
                        dat_file: 'dfu.dat',
                    },
                },
            })
        ).toMatchSnapshot();
    });

    it('should render with file path, package info, and dfu in progress', () => {
        expect(
            renderComponent({
                filePath: '/path/to/file',
                packageInfo: {
                    application: {
                        bin_file: 'dfu.bin',
                        dat_file: 'dfu.dat',
                    },
                },
                isStarted: true,
                percentCompleted: 10,
                status: 'In progress',
            })
        ).toMatchSnapshot();
    });

    it('should render stopping', () => {
        expect(
            renderComponent({
                filePath: '/path/to/file',
                packageInfo: {
                    application: {
                        bin_file: 'dfu.bin',
                        dat_file: 'dfu.dat',
                    },
                },
                isStarted: true,
                isStopping: true,
                percentCompleted: 10,
            })
        ).toMatchSnapshot();
    });

    it('should render with dfu completed', () => {
        expect(
            renderComponent({
                filePath: '/path/to/file',
                packageInfo: {
                    application: {
                        bin_file: 'dfu.bin',
                        dat_file: 'dfu.dat',
                    },
                },
                isStarted: false,
                isCompleted: true,
            })
        ).toMatchSnapshot();
    });
});
