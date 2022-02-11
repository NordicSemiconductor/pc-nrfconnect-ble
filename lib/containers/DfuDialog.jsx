/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint react/forbid-prop-types: off */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { connect } from 'react-redux';
import { dialog } from '@electron/remote';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import * as DfuActions from '../actions/dfuActions';
import ConfirmationDialog from '../components/ConfirmationDialog';
import DfuEditor from '../components/DfuEditor';

class DfuDialog extends React.PureComponent {
    constructor(props) {
        super(props);

        this.hide = this.hide.bind(this);
        this.showFileDialog = this.showFileDialog.bind(this);
        this.onFileSelected = this.onFileSelected.bind(this);
        this.onStartDfu = this.onStartDfu.bind(this);
        this.onStopDfu = this.onStopDfu.bind(this);
    }

    onFileSelected(filePath) {
        const { setDfuFilePath, loadDfuPackageInfo } = this.props;
        setDfuFilePath(filePath);
        loadDfuPackageInfo(filePath);
    }

    onStartDfu() {
        const { startDfu, filePath } = this.props;
        startDfu(filePath);
    }

    onStopDfu() {
        const { stopDfu } = this.props;
        stopDfu();
    }

    showFileDialog() {
        const filters = [
            {
                name: 'Zip Files',
                extensions: ['zip'],
            },
        ];

        dialog
            .showOpenDialog({
                title: 'Choose file',
                filters,
                properties: ['openFile'],
            })
            .then(({ canceled, filePaths }) => {
                if (!filePaths || canceled) {
                    return;
                }
                const [filePath] = filePaths;
                if (!filePath) {
                    return;
                }
                this.onFileSelected(filePath);
            });
    }

    hide() {
        const { isStarted, showConfirmCloseDialog, hideDfuDialog } = this.props;
        if (isStarted) {
            showConfirmCloseDialog();
        } else {
            hideDfuDialog();
        }
    }

    render() {
        const {
            isVisible,
            hideDfuDialog,
            hideConfirmCloseDialog,
            isConfirmCloseVisible,
            device,
        } = this.props;

        if (!isVisible) {
            return null;
        }

        return (
            <div>
                <Modal className="dfu-dialog" size="lg" show={isVisible}>
                    <Modal.Header>
                        <Modal.Title>
                            Device Firmware Upgrade (DFU) for device{' '}
                            {device.address}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <DfuEditor
                            onChooseFile={this.showFileDialog}
                            onStartDfu={this.onStartDfu}
                            onStopDfu={this.onStopDfu}
                            {...this.props}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            className="btn-primary btn-nordic"
                            onClick={this.hide}
                        >
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
                <ConfirmationDialog
                    show={isConfirmCloseVisible}
                    onOk={hideDfuDialog}
                    onCancel={hideConfirmCloseDialog}
                    text="Closing this window will stop DFU. Are you sure?"
                    okButtonText="Yes"
                    cancelButtonText="No"
                />
            </div>
        );
    }
}

DfuDialog.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    hideDfuDialog: PropTypes.func.isRequired,
    hideConfirmCloseDialog: PropTypes.func.isRequired,
    isConfirmCloseVisible: PropTypes.bool.isRequired,
    device: PropTypes.object,
    setDfuFilePath: PropTypes.func.isRequired,
    loadDfuPackageInfo: PropTypes.func.isRequired,
    startDfu: PropTypes.func.isRequired,
    filePath: PropTypes.string.isRequired,
    stopDfu: PropTypes.func.isRequired,
    isStarted: PropTypes.bool.isRequired,
    showConfirmCloseDialog: PropTypes.func.isRequired,
};

DfuDialog.defaultProps = {
    device: null,
};

function mapStateToProps(state) {
    const { dfu, adapter } = state.app;

    const { selectedAdapter } = adapter;

    return {
        adapter: selectedAdapter,
        isVisible: dfu.isDfuDialogVisible,
        isConfirmCloseVisible: dfu.isConfirmCloseVisible,
        device: dfu.device,
        filePath: dfu.filePath,
        packageInfo: dfu.packageInfo,
        isStarted: dfu.isStarted,
        isStopping: dfu.isStopping,
        isCompleted: dfu.isCompleted,
        percentCompleted: dfu.percentCompleted,
        status: dfu.status,
        fileNameBeingTransferred: dfu.fileNameBeingTransferred,
        throughput: dfu.throughput,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(DfuActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DfuDialog);
