/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable import/first */

// Have to mock these modules, because they depend on various resources
// (sqlite3, electron, native modules, etc.) that are not available during
// testing.
jest.mock('../../utils/fileUtil', () => {});
jest.mock('../../utils/uuid_definitions', () => {});
jest.mock('../../api/jlink', () => {});

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
