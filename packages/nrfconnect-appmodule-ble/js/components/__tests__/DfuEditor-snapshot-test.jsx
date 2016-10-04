// Have to mock react-dom due to bug: https://github.com/facebook/react/issues/7386
// Can be removed after upgrade to react 15.4.0.
jest.mock('react-dom');

import React from 'react';
import renderer from 'react-test-renderer';
import DfuEditor from '../DfuEditor';

it('renders with default props', () => {
    expect(renderComponent({})).toMatchSnapshot();
});

it('renders with file path', () => {
    expect(renderComponent({
        filePath: '/path/to/file'
    })).toMatchSnapshot();
});

it('renders with file path and package info', () => {
    expect(renderComponent({
        filePath: '/path/to/file',
        packageInfo: {
            application: {
                'bin_file': 'dfu.bin',
                'dat_file': 'dfu.dat',
            }
        }
    })).toMatchSnapshot();
});

it('renders with file path, package info, and dfu in progress', () => {
    expect(renderComponent({
        filePath: '/path/to/file',
        packageInfo: {
            application: {
                'bin_file': 'dfu.bin',
                'dat_file': 'dfu.dat',
            }
        },
        isStarted: true,
        percentCompleted: 10,
        status: 'In progress'
    })).toMatchSnapshot();
});

it('renders stopping', () => {
    expect(renderComponent({
        filePath: '/path/to/file',
        packageInfo: {
            application: {
                'bin_file': 'dfu.bin',
                'dat_file': 'dfu.dat',
            }
        },
        isStarted: true,
        isStopping: true,
        percentCompleted: 10
    })).toMatchSnapshot();
});

it('renders with dfu completed', () => {
    expect(renderComponent({
        filePath: '/path/to/file',
        packageInfo: {
            application: {
                'bin_file': 'dfu.bin',
                'dat_file': 'dfu.dat',
            }
        },
        isStarted: false,
        isCompleted: true
    })).toMatchSnapshot();
});

function renderComponent(props) {
    return renderer.create(
        <DfuEditor
            isStarted={false}
            onChooseFile={() => {}}
            onStartDfu={() => {}}
            onStopDfu={() => {}}
            {...props}
        />
    ).toJSON();
}
