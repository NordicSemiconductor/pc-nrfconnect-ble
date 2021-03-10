/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* eslint-disable import/first */

// Have to mock these modules, because they depend on various resources
// (sqlite3, electron, native modules, etc.) that are not available during
// testing.
jest.mock('../../utils/fileUtil', () => {});
jest.mock('../../utils/uuid_definitions', () => {});
jest.mock('../../api/nrfjprog', () => {});

import Store, { mockSetFn } from 'electron-store';

import * as SecurityActions from '../../actions/securityActions';
import reducer from '../securityReducer';

const initialState = reducer(undefined, {});

describe('securityReducer', () => {
    describe('initial state', () => {
        const { securityParams } = initialState;
        it('Should get correct initial state', () => {
            expect(Store).toHaveBeenCalledTimes(1);
            expect(securityParams.bond).toEqual(false);
            expect(securityParams.io_caps).toEqual(1);
            expect(securityParams.lesc).toEqual(false);
        });
    });

    describe('setting security params', () => {
        const params = {
            io_caps: 2,
            lesc: true,
            oob: true,
            keypress: true,
            bond: true,
            io_caps_title: 'some string',
        };
        const { securityParams: updatedSecurityParams } = reducer(
            initialState,
            { type: SecurityActions.SECURITY_SET_PARAMS, params }
        );

        it('should have updated security params', () => {
            expect(mockSetFn).toHaveBeenCalledTimes(1);
            expect(updatedSecurityParams.lesc).toEqual(true);
            expect(updatedSecurityParams.bond).toEqual(true);
            expect(updatedSecurityParams.io_caps).toEqual(2);
        });
    });
});
