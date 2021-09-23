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
