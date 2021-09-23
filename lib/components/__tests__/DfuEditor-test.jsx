/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { mount } from 'enzyme';

import DfuButton from '../DfuButton';
import DfuEditor from '../DfuEditor';

function mountComponent(props) {
    return mount(
        <DfuEditor
            isStarted={false}
            onChooseFile={() => {}}
            onStartDfu={() => {}}
            onStopDfu={() => {}}
            {...props}
        />
    );
}

describe('DfuEditor', () => {
    describe('when choose file button is clicked', () => {
        const onChooseFile = jest.fn();
        const wrapper = mountComponent({
            onChooseFile,
        });
        wrapper.find('button#choose-file').simulate('click');

        it('should call onChooseFile', () => {
            expect(onChooseFile).toHaveBeenCalled();
        });
    });

    describe('when DFU is not in progress', () => {
        const onStartDfu = jest.fn();
        const wrapper = mountComponent({
            onStartDfu,
        });

        describe('and DFU button is clicked', () => {
            wrapper.find(DfuButton).find('button').simulate('click');

            it('should call onStartDfu', () => {
                expect(onStartDfu).toHaveBeenCalled();
            });
        });
    });

    describe('when DFU is in progress', () => {
        const onStopDfu = jest.fn();
        const wrapper = mountComponent({
            isStarted: true,
            onStopDfu,
        });

        describe('and DFU button is clicked', () => {
            wrapper.find(DfuButton).find('button').simulate('click');

            it('should call onStopDfu', () => {
                expect(onStopDfu).toHaveBeenCalled();
            });
        });
    });
});
