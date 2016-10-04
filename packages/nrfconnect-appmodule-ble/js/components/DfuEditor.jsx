/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
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
