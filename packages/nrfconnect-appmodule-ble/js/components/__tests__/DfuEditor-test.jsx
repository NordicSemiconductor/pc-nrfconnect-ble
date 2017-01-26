/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import { mount } from 'enzyme';
import FileInput from '../input/FileInput';
import DfuButton from '../DfuButton';
import DfuEditor from '../DfuEditor';

describe('DfuEditor', () => {
    describe('when choose file button is clicked', () => {
        const onChooseFile = jest.fn();
        const wrapper = mountComponent({
            onChooseFile,
        });
        wrapper.find(FileInput).find('button').simulate('click');

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

function mountComponent(props) {
    return mount(<DfuEditor
        isStarted={false}
        onChooseFile={() => {}}
        onStartDfu={() => {}}
        onStopDfu={() => {}}
        {...props}
    />)
}
