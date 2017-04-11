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
// Have to mock react-dom due to bug: https://github.com/facebook/react/issues/7386
// Can be removed after upgrade to react 15.4.0.
jest.mock('react-dom');

import React from 'react';
import renderer from 'react-test-renderer';
import DfuEditor from '../DfuEditor';

describe('DfuEditor', () => {
    it('should render with default props', () => {
        expect(renderComponent({})).toMatchSnapshot();
    });

    it('should render with file path', () => {
        expect(renderComponent({
            filePath: '/path/to/file'
        })).toMatchSnapshot();
    });

    it('should render with file path and package info', () => {
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

    it('should render with file path, package info, and dfu in progress', () => {
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

    it('should render stopping', () => {
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

    it('should render with dfu completed', () => {
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
