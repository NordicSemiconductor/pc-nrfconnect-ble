import React from 'react';
import { mount } from 'enzyme';
import FileInput from '../input/FileInput';
import DfuButton from '../DfuButton';
import DfuEditor from '../DfuEditor';

describe('when choose file button is clicked', () => {
    const onChooseFile = jest.fn();
    const wrapper = mountComponent({
        onChooseFile,
    });
    wrapper.find(FileInput).find('button').simulate('click');

    it('calls onChooseFile', () => {
        expect(onChooseFile).toHaveBeenCalled();
    });
});

describe('when DFU not in progress', () => {
    const onStartDfu = jest.fn();
    const wrapper = mountComponent({
        onStartDfu,
    });

    describe('when DFU button clicked', () => {
        wrapper.find(DfuButton).find('button').simulate('click');

        it('calls onStartDfu', () => {
            expect(onStartDfu).toHaveBeenCalled();
        });
    });
});

describe('when DFU in progress', () => {
    const onStopDfu = jest.fn();
    const wrapper = mountComponent({
        isStarted: true,
        onStopDfu,
    });

    describe('when DFU button clicked', () => {
        wrapper.find(DfuButton).find('button').simulate('click');

        it('calls onStopDfu', () => {
            expect(onStopDfu).toHaveBeenCalled();
        });
    });
});

function mountComponent(props) {
    return mount(<DfuEditor
        isStarted={false}
        onChooseFile={() => {}}
        onStartDfu={() => {}}
        onStopDfu={() => {}}
        {...props}
    />)
}
