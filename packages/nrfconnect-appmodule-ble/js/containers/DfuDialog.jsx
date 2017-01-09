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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Modal } from 'react-bootstrap';
import { Button } from 'react-bootstrap';

import * as DfuActions from '../actions/dfuActions';
import DfuEditor from '../components/DfuEditor';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { ipcRenderer, shell } from 'electron';

class DfuDialog extends React.PureComponent {
    static propTypes = {
        isVisible: PropTypes.bool.isRequired,
        hideDfuDialog: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.hide = this.hide.bind(this);
        this.showFileDialog = this.showFileDialog.bind(this);
        this.onFileSelected = this.onFileSelected.bind(this);
        this.onStartDfu = this.onStartDfu.bind(this);
        this.onStopDfu = this.onStopDfu.bind(this);
    }

    hide() {
        if (this.props.isStarted) {
            this.props.showConfirmCloseDialog();
        } else {
            this.props.hideDfuDialog();
        }
    }

    onFileSelected(filePath) {
        this.props.setDfuFilePath(filePath);
        this.props.loadDfuPackageInfo(filePath);
    }

    showFileDialog() {
        ipcRenderer.once('choose-file-dialog-reply', (event, fileArray) => {
            if (fileArray && fileArray.length === 1) {
                this.onFileSelected(fileArray[0]);
            }
        });
        const filters = [{
            name: 'Zip Files',
            extensions: ['zip']
        }];
        ipcRenderer.send('choose-file-dialog', filters);
    }

    onStartDfu() {
        this.props.startDfu(this.props.filePath);
    }

    onStopDfu() {
        this.props.stopDfu();
    }

    render() {
        const {
            isVisible,
            hideDfuDialog,
            hideConfirmCloseDialog,
            isConfirmCloseVisible,
            device,
            ...props,
        } = this.props;

        if (!isVisible) {
            return null;
        }

        return (
            <div>
                <Modal className="dfu-setup" bsSize="large" show={isVisible}>
                    <Modal.Header>
                        <Modal.Title>Device Firmware Upgrade (DFU) for device {device.address}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <DfuEditor
                            onChooseFile={this.showFileDialog}
                            onStartDfu={this.onStartDfu}
                            onStopDfu={this.onStopDfu}
                            device={device}
                            {...props}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button className="btn-primary btn-nordic" onClick={this.hide}>Close</Button>
                    </Modal.Footer>
                </Modal>
                <ConfirmationDialog
                    show={isConfirmCloseVisible}
                    onOk={hideDfuDialog}
                    onCancel={hideConfirmCloseDialog}
                    text='Closing this window will stop DFU. Are you sure?'
                />
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { dfu, adapter } = state;

    const selectedAdapter = adapter.getIn(['adapters', adapter.selectedAdapter]);

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
    return Object.assign({},
        bindActionCreators(DfuActions, dispatch)
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DfuDialog);
