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

import React, { PropTypes } from 'react';
import { FormGroup, ControlLabel, ButtonToolbar } from 'react-bootstrap';

import FileInput from './input/FileInput';
import ProgressBarInput from './input/ProgressBarInput';
import ReadOnlyField from './input/ReadOnlyField';
import DfuButton from './DfuButton';
import DfuThroughputGraph from './DfuThroughputGraph';

export default class DfuEditor extends React.PureComponent {

    static propTypes = {
        packageInfo: PropTypes.object,
        filePath: PropTypes.string,
        status: PropTypes.string,
        fileNameBeingTransferred: PropTypes.string,
        percentCompleted: PropTypes.number,
        isCompleted: PropTypes.bool,
        isStopping: PropTypes.bool,
        isStarted: PropTypes.bool,
        onChooseFile: PropTypes.func.isRequired,
        onStartDfu: PropTypes.func.isRequired,
        onStopDfu: PropTypes.func.isRequired,
        throughput: PropTypes.object,
    };

    renderPackageInfo() {
        return (
            <ReadOnlyField
                label='Package info'
                value={createPackageInfoString(this.props.packageInfo)}
            />
        );
    }

    renderProgress() {
        const percentCompleted = this.getPercentCompleted();
        return (
            <ProgressBarInput
                label='Progress'
                status={this.getStatus()}
                now={percentCompleted}
                progressLabel={`${percentCompleted}%`}
            />
        );
    }

    renderGraph() {
        const throughput = this.props.throughput;
        if (throughput && throughput.kbpsPoints.length > 0) {
            return (
                <FormGroup>
                    <ControlLabel className="col-md-3 text-right">Throughput (kB/s)</ControlLabel>
                    <div className="col-md-9">
                        <DfuThroughputGraph {...throughput} />
                    </div>
                </FormGroup>
            );
        }
        return null;
    }

    getStatus() {
        if (this.props.isCompleted) {
            return 'Completed';
        } else if (this.props.isStopping) {
            return 'Stopping...';
        }
        let status = this.props.status;
        const fileNameBeingTransferred = this.props.fileNameBeingTransferred;
        if (fileNameBeingTransferred) {
            status += ' ' + fileNameBeingTransferred;
        }
        return status + '...';
    }

    getPercentCompleted() {
        return this.props.isCompleted ? 100 : this.props.percentCompleted;
    }

    render() {
        const {
            onChooseFile,
            filePath,
            packageInfo,
            isStarted,
            isStopping,
            isCompleted,
            onStartDfu,
            onStopDfu,
        } = this.props;

        return (
            <form className='form-horizontal native-key-bindings'>
                <div className="col-md-12">
                    <FileInput
                        readOnly
                        buttonDisabled={isStarted || isCompleted}
                        label='Zip file'
                        value={filePath}
                        onChooseClicked={onChooseFile}
                    />
                    { packageInfo ? this.renderPackageInfo() : null }
                    { isStarted || isCompleted ? this.renderProgress() : null }
                    { isStarted || isCompleted ? this.renderGraph() : null }
                </div>
                <ButtonToolbar>
                    <div style={filePath && !isCompleted ? {} : {display: 'none'}}>
                        <DfuButton
                            dfuInProgress={isStarted}
                            disabled={isStopping}
                            onClick={isStarted ? onStopDfu : onStartDfu}/>
                    </div>
                </ButtonToolbar>
            </form>
        );
    }
}

/**
 * Converts an object like:
 *
 * { "application": { "dat_file": "file.dat", "bin_file": "file.bin" }, ... }
 *
 * to:
 *
 * application:
 *   dat_file: file.dat
 *   bin_file: file.bin
 * ...
 */
function createPackageInfoString(packageInfo) {
    return Object.keys(packageInfo).reduce((prevType, type) => {
        const valueString = Object.keys(packageInfo[type]).reduce((prevValue, value) => {
            return prevValue + '\n  ' + value + ': ' + packageInfo[type][value];
        }, '');
        return prevType + type + ':' + valueString + '\n';
    }, '');
}
