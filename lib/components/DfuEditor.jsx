/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint react/forbid-prop-types: off */

import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Row from 'react-bootstrap/Row';
import PropTypes from 'prop-types';

import DfuButton from './DfuButton';
import DfuThroughputGraph from './DfuThroughputGraph';

/*
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
        const valueString = Object.keys(packageInfo[type]).reduce(
            (prevValue, value) =>
                `${prevValue}\n  ${value}: ${JSON.stringify(
                    packageInfo[type][value]
                )}`,
            ''
        );
        return `${prevType}${type}:${valueString}\n`;
    }, '');
}

class DfuEditor extends React.PureComponent {
    getStatus() {
        const { isCompleted, isStopping, fileNameBeingTransferred } =
            this.props;
        let { status } = this.props;
        if (isCompleted) {
            return 'Completed';
        }
        if (isStopping) {
            return 'Stopping...';
        }
        if (fileNameBeingTransferred) {
            status += ` ${fileNameBeingTransferred}`;
        }
        return `${status}...`;
    }

    renderGraph() {
        const { throughput } = this.props;
        if (throughput && throughput.kbpsPoints.length > 0) {
            return (
                <Form.Group as={Row}>
                    <Form.Label column sm={2} className="text-right">
                        Throughput (kB/s)
                    </Form.Label>
                    <Col sm={10}>
                        <DfuThroughputGraph {...throughput} />
                    </Col>
                </Form.Group>
            );
        }
        return null;
    }

    render() {
        const {
            onChooseFile,
            filePath,
            packageInfo,
            percentCompleted,
            isStarted,
            isStopping,
            isCompleted,
            onStartDfu,
            onStopDfu,
        } = this.props;

        return (
            <Form className="form-horizontal native-key-bindings">
                <Form.Group as={Row}>
                    <Form.Label column sm={2} className="text-right">
                        Zip file
                    </Form.Label>
                    <InputGroup as={Col} sm={10}>
                        <Form.Control value={filePath} readOnly />
                        <InputGroup.Append>
                            <Button
                                id="choose-file"
                                variant="secondary"
                                disabled={isStarted || isCompleted}
                                onClick={onChooseFile}
                            >
                                Choose
                            </Button>
                        </InputGroup.Append>
                    </InputGroup>
                </Form.Group>
                {packageInfo && (
                    <Form.Group as={Row}>
                        <Form.Label column sm={2} className="text-right">
                            Package info
                        </Form.Label>
                        <InputGroup as={Col} sm={10}>
                            <pre>{createPackageInfoString(packageInfo)}</pre>
                        </InputGroup>
                    </Form.Group>
                )}
                {(isStarted || isCompleted) && (
                    <Form.Group as={Row}>
                        <Form.Label column sm={2} className="text-right">
                            Progress
                        </Form.Label>
                        <InputGroup as={Col} sm={10}>
                            {this.getStatus()}
                            <ProgressBar
                                label={`${percentCompleted}%`}
                                now={percentCompleted}
                            />
                        </InputGroup>
                    </Form.Group>
                )}
                {(isStarted || isCompleted) && this.renderGraph()}
                <ButtonToolbar className="row-of-buttons">
                    <div
                        style={
                            filePath && !isCompleted ? {} : { display: 'none' }
                        }
                    >
                        <DfuButton
                            dfuInProgress={isStarted}
                            disabled={isStopping}
                            onClick={isStarted ? onStopDfu : onStartDfu}
                        />
                    </div>
                </ButtonToolbar>
            </Form>
        );
    }
}

DfuEditor.propTypes = {
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

DfuEditor.defaultProps = {
    packageInfo: null,
    filePath: '',
    status: null,
    fileNameBeingTransferred: null,
    percentCompleted: 0,
    isCompleted: false,
    isStopping: false,
    isStarted: false,
    throughput: null,
};

export default DfuEditor;
