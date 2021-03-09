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

/* eslint react/forbid-prop-types: off */

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { connect } from 'react-redux';
import electron from 'electron';
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
        const { dialog } = electron.remote;
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
