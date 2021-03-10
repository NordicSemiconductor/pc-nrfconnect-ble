/* Copyright (c) 2015 - 2020, Nordic Semiconductor ASA
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

import Store from 'electron-store';

import * as AdvertisingActions from '../../actions/advertisingActions';
import reducer from '../advertisingReducer';

const initialState = reducer(undefined, {});
let modifiedState;
const entry = {
    id: 123,
    type: 'testType',
    typeKey: 0,
    typeApi: 'testApi',
    value: 'testValue',
    formattedValue: 'testValue',
};

describe('advertisingReducer', () => {
    describe('initial state', () => {
        it('Should get correct initial state', () => {
            expect(Store).toHaveBeenCalled();
            expect(initialState.advDataEntries.size).toEqual(1);
            expect(initialState.scanResponseEntries.size).toEqual(0);
        });
    });

    describe('Adding advertising data entry', () => {
        const tmpState = reducer(initialState, {
            type: AdvertisingActions.ADD_ADVDATA_ENTRY,
            entry,
        });

        it('Should update temporary state', () => {
            expect(tmpState.tempAdvDataEntries.size).toEqual(2);
            expect(tmpState.tempScanRespEntries.size).toEqual(0);
            expect(tmpState.advDataEntries.size).toEqual(1);
            expect(tmpState.scanResponseEntries.size).toEqual(0);
        });

        describe('Applying changes', () => {
            const state = reducer(tmpState, {
                type: AdvertisingActions.APPLY_CHANGES,
            });
            it('Should add changes to store and update the state', () => {
                expect(state.advDataEntries.size).toEqual(2);
                expect(state.scanResponseEntries.size).toEqual(0);
            });

            describe('Deleting entry', () => {
                const deleted = reducer(state, {
                    type: AdvertisingActions.DELETE_ADVDATA_ENTRY,
                    id: entry.id,
                });

                it('Should update temporary state', () => {
                    expect(deleted.tempAdvDataEntries.size).toEqual(1);
                });

                describe('Applying changes', () => {
                    const newState = reducer(deleted, {
                        type: AdvertisingActions.APPLY_CHANGES,
                    });

                    it('Should delete scan response entries', () => {
                        expect(newState.advDataEntries.size).toEqual(1);
                    });
                });
            });
        });
    });

    describe('Adding scan response entry', () => {
        const tmpState = reducer(initialState, {
            type: AdvertisingActions.ADD_SCANRSP_ENTRY,
            entry,
        });

        it('Should update temporary state', () => {
            expect(tmpState.tempScanRespEntries.size).toEqual(1);
            expect(tmpState.tempAdvDataEntries.size).toEqual(1);
            expect(tmpState.advDataEntries.size).toEqual(1);
            expect(tmpState.scanResponseEntries.size).toEqual(0);
        });

        describe('Applying changes', () => {
            const state = reducer(tmpState, {
                type: AdvertisingActions.APPLY_CHANGES,
            });
            it('Should add changes to store and update the state', () => {
                expect(state.advDataEntries.size).toEqual(1);
                expect(state.scanResponseEntries.size).toEqual(1);
            });

            describe('Deleting entry', () => {
                const deleted = reducer(state, {
                    type: AdvertisingActions.DELETE_SCANRSP_ENTRY,
                    id: entry.id,
                });

                it('Should update temporary state', () => {
                    expect(deleted.tempScanRespEntries.size).toEqual(0);
                });

                describe('Applying changes', () => {
                    const newState = reducer(deleted, {
                        type: AdvertisingActions.APPLY_CHANGES,
                    });

                    it('Should delete scan response entries', () => {
                        expect(newState.scanResponseEntries.size).toEqual(0);
                    });
                });
            });
        });
    });

    describe('Hiding dialog should clear temporary state', () => {
        beforeEach(() => {
            modifiedState = reducer(initialState, {
                type: AdvertisingActions.ADD_ADVDATA_ENTRY,
                entry,
            });
            modifiedState = reducer(modifiedState, {
                type: AdvertisingActions.ADD_SCANRSP_ENTRY,
                entry,
            });
        });

        const clearedState = reducer(modifiedState, {
            type: AdvertisingActions.HIDE_DIALOG,
        });

        it('Should clear temporary state', () => {
            expect(modifiedState.tempAdvDataEntries.size).toEqual(2);
            expect(modifiedState.tempScanRespEntries.size).toEqual(1);
            expect(clearedState.tempAdvDataEntries.size).toEqual(1);
            expect(clearedState.tempScanRespEntries.size).toEqual(0);
        });
    });
});
