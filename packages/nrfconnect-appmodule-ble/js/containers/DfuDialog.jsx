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
