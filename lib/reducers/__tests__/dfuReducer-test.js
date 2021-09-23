/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable import/first */

// Have to mock these modules, because they depend on various resources
// (sqlite3, electron, native modules, etc.) that are not available during
// testing. These modules are not imported by dfuReducer.js directly, but
// they are imported by adapterActions.js, which dfuReducer.js depends on.
jest.mock('../../utils/fileUtil', () => {});
jest.mock('../../utils/uuid_definitions', () => {});
jest.mock('../../api/jlink', () => {});

import * as DfuActions from '../../actions/dfuActions';
import reducer from '../dfuReducer';

const initialState = reducer(undefined, {});
const adapter = {};
const device = {};

describe('dfuReducer', () => {
    describe('when showing DFU dialog with a given adapter and device', () => {
        const state = reducer(initialState, {
            type: DfuActions.SHOW_DIALOG,
            adapter,
            device,
        });

        it('should set dialog visible state to true', () => {
            expect(state.isDfuDialogVisible).toBe(true);
        });

        it('should create dfu instance', () => {
            expect(state.api.dfu).toBeDefined();
        });

        it('should set device', () => {
            expect(state.device).toBe(device);
        });
    });

    describe('when setting DFU file path', () => {
        const filePath = '/path/to/file';
        const state = reducer(
            initialState,
            DfuActions.setDfuFilePath(filePath)
        );

        it('should set file path in state', () => {
            expect(state.filePath).toBe(filePath);
        });
    });

    describe('when loading package info succeeded', () => {
        const packageInfo = {};
        const state = reducer(initialState, {
            type: DfuActions.LOAD_PACKAGE_INFO_SUCCESS,
            packageInfo,
        });

        it('should set package info in state', () => {
            expect(state.packageInfo).toBe(packageInfo);
        });
    });

    describe('when DFU started', () => {
        const state = reducer(initialState, {
            type: DfuActions.PERFORM,
        });

        it('should set isStarted to true', () => {
            expect(state.isStarted).toBe(true);
        });
    });

    describe('when showing confirm-close dialog', () => {
        const state = reducer(
            initialState,
            DfuActions.showConfirmCloseDialog()
        );

        it('should set confirm-close visible state to true', () => {
            expect(state.isConfirmCloseVisible).toBe(true);
        });
    });

    describe('when hiding confirm-close dialog', () => {
        const stateBefore = initialState.set('isConfirmCloseVisible', true);
        const state = reducer(stateBefore, DfuActions.hideConfirmCloseDialog());

        it('should set confirm-close visible state to false', () => {
            expect(state.isConfirmCloseVisible).toBe(false);
        });
    });

    describe('when DFU progress update has been received', () => {
        describe('and DFU is not running', () => {
            const stateBefore = initialState.set('isStarted', false);
            const state = reducer(stateBefore, {
                type: DfuActions.UPDATE_PROGRESS,
            });

            // Progress updates are throttled, so a trailing progress update can be
            // received after DFU has completed. In that case, we ignore it.

            it('should not change state', () => {
                expect(state).toBe(stateBefore);
            });
        });

        describe('and there is no file being transferred', () => {
            const stateBefore = initialState.set(
                'fileNameBeingTransferred',
                initialState.fileNameBeingTransferred
            );
            const state = reducer(stateBefore, {
                type: DfuActions.UPDATE_PROGRESS,
            });

            // Progress updates are throttled, so a trailing progress update can be
            // received after a file has completed. In that case, we ignore it.

            it('should not change state', () => {
                expect(state).toBe(stateBefore);
            });
        });

        describe('and DFU is running with a file transfer in progress', () => {
            const stateIsStartedWithFile = initialState
                .set('isStarted', true)
                .set('fileNameBeingTransferred', 'myFile.bin');
            const stateWithProgress = reducer(stateIsStartedWithFile, {
                type: DfuActions.UPDATE_PROGRESS,
            });

            it('should set status to Transferring', () => {
                expect(stateWithProgress.status).toEqual('Transferring');
            });

            describe('and percent completed is not provided', () => {
                const state = reducer(stateIsStartedWithFile, {
                    type: DfuActions.UPDATE_PROGRESS,
                });

                it('should not change percent completed', () => {
                    expect(state.percentCompleted).toBe(
                        initialState.percentCompleted
                    );
                });

                it('should not change throughput', () => {
                    expect(state.throughput).toBe(initialState.throughput);
                });
            });

            describe('and percent completed is provided', () => {
                const percentCompleted = 0.1;
                const state = reducer(stateIsStartedWithFile, {
                    type: DfuActions.UPDATE_PROGRESS,
                    percentCompleted,
                });

                it('should set percent completed', () => {
                    expect(state.percentCompleted).toEqual(percentCompleted);
                });
            });

            describe('and completed bytes is provided', () => {
                const bytesPerSecond = 100;
                const averageBytesPerSecond = 50;
                const totalBytes = 2000;
                const completedBytes = 500;
                const state = reducer(stateIsStartedWithFile, {
                    type: DfuActions.UPDATE_PROGRESS,
                    bytesPerSecond,
                    averageBytesPerSecond,
                    totalBytes,
                    completedBytes,
                });

                it('should set total kB size', () => {
                    const expectedTotalSizeKb = totalBytes / 1024;
                    expect(state.throughput.totalSizeKb).toEqual(
                        expectedTotalSizeKb
                    );
                });

                it('should add point to kB/s array', () => {
                    const expectedPoint = {
                        x: completedBytes / 1024,
                        y: bytesPerSecond / 1024,
                    };
                    expect(state.throughput.kbpsPoints[0]).toEqual(
                        expectedPoint
                    );
                });

                it('should add point to average kB/s array', () => {
                    const expectedPoint = {
                        x: completedBytes / 1024,
                        y: averageBytesPerSecond / 1024,
                    };
                    expect(state.throughput.averageKbpsPoints[0]).toEqual(
                        expectedPoint
                    );
                });
            });
        });
    });

    describe('when file transfer has started', () => {
        const fileName = 'myfile.dat';
        const stateBefore = initialState
            .set('throughput', {})
            .set('percentCompleted', 1);
        const state = reducer(stateBefore, {
            type: DfuActions.TRANSFER_FILE_STARTED,
            fileName,
        });

        it('should set name of file being transferred', () => {
            expect(state.fileNameBeingTransferred).toEqual(fileName);
        });

        it('should clear percent completed', () => {
            expect(state.percentCompleted).toEqual(
                initialState.percentCompleted
            );
        });

        it('should clear throughput data', () => {
            expect(state.throughput).toEqual(initialState.throughput);
        });

        it('should set status to Initializing', () => {
            expect(state.status).toEqual('Initializing');
        });
    });

    describe('when file transfer has completed', () => {
        const stateBefore = initialState
            .set('fileNameBeingTransferred', 'myfile.dat')
            .set('throughput', {});
        const state = reducer(stateBefore, {
            type: DfuActions.TRANSFER_FILE_COMPLETED,
        });

        it('should clear name of file being transferred', () => {
            expect(state.fileNameBeingTransferred).toEqual(
                initialState.fileNameBeingTransferred
            );
        });

        it('should clear throughput data', () => {
            expect(state.throughput).toEqual(initialState.throughput);
        });

        // When a firmware file is completed, the device is disconnected, and
        // the DFU module waits for a few seconds before continuing. Updating
        // status to inform the user that we are waiting.

        it("should set status to 'File completed, waiting for device'", () => {
            expect(state.status).toEqual('File completed, waiting for device');
        });
    });

    describe('when DFU has been completed successfully', () => {
        const state = reducer(initialState, {
            type: DfuActions.PERFORM_SUCCESS,
        });

        it('should set completed to true', () => {
            expect(state.isCompleted).toEqual(true);
        });

        it('should set started to false', () => {
            expect(state.isStarted).toEqual(false);
        });
    });

    describe('when DFU has been aborted', () => {
        const stateBefore = initialState.set('isStopping', false);
        const state = reducer(stateBefore, {
            type: DfuActions.ABORT,
        });

        it('should set stopping to true', () => {
            expect(state.isStopping).toBe(true);
        });
    });

    describe('when DFU has been aborted', () => {
        const stateBefore = initialState
            .set('isStopping', true)
            .set('isStarted', true)
            .set('fileNameBeingTransferred', 'myfile.dat');
        const state = reducer(stateBefore, {
            type: DfuActions.ABORT_SUCCESS,
        });

        it('should set stopping to false', () => {
            expect(state.isStopping).toBe(false);
        });

        it('should set started to false', () => {
            expect(state.isStarted).toBe(false);
        });

        it('should set the file name being transferred to empty', () => {
            expect(state.fileNameBeingTransferred).toBe('');
        });
    });

    describe('when hiding DFU dialog', () => {
        const stateBefore = initialState
            .set('isDfuDialogVisible', true)
            .set('device', {});
        const state = reducer(stateBefore, { type: DfuActions.HIDE_DIALOG });

        it('should clear state', () => {
            expect(state).toBe(initialState);
        });
    });
});
