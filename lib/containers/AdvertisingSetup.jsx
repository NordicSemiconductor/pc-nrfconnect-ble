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

'use strict';

import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { connect } from 'react-redux';
import electron from 'electron';
import { List } from 'immutable';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import * as AdvertisingActions from '../actions/advertisingActions';
import { persistentStore } from '../common/Persistentstore';
import AdvertisingData from '../components/AdvertisingData';
import AdvertisingList from '../components/AdvertisingList';

const filters = [
    { name: 'nRF Connect Advertising setup', extensions: ['nca', 'json'] },
    { name: 'All Files', extensions: ['*'] },
];

class AdvertisingSetup extends React.PureComponent {
    constructor(props) {
        super(props);
        this.addToAdvData = this.addToAdvData.bind(this);
        this.addToScanResponse = this.addToScanResponse.bind(this);
        this.handleApply = this.handleApply.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleLoad = this.handleLoad.bind(this);
    }

    componentDidMount() {
        this.findCurrentMaxId();
    }

    findCurrentMaxId() {
        const { advSetup, scanResponse } = persistentStore;
        const advSetupList = advSetup();
        const scanResponseList = scanResponse();
        const advId =
            advSetupList.length > 0 ? advSetupList.slice(-1)[0].id : 0;
        const scanId =
            scanResponseList.length > 0 ? scanResponseList.slice(-1)[0].id : 0;
        this.id = Math.max(advId, scanId);
    }

    prepareValue() {
        if (!this.typeValue) {
            return undefined;
        }

        this.id += 1;
        this.typeValue.id = this.id;
        return { ...this.typeValue };
    }

    addToAdvData() {
        const { addAdvEntry } = this.props;
        const newValue = this.prepareValue();

        if (!newValue || newValue.value === '') {
            return;
        }

        addAdvEntry(newValue);
    }

    addToScanResponse() {
        const { addScanRsp } = this.props;
        const newValue = this.prepareValue();

        if (!newValue || newValue.value === '') {
            return;
        }

        addScanRsp(newValue);
    }

    handleValueChange(typeValue) {
        this.typeValue = typeValue;
    }

    handleApply() {
        const { applyChanges, setAdvertisingData } = this.props;

        applyChanges();
        setAdvertisingData();
    }

    handleSave() {
        const { saveAdvSetup } = this.props;
        const { dialog } = electron.remote;
        dialog.showSaveDialog({ filters }).then(({ canceled, filePath }) => {
            if (!filePath || canceled) {
                return;
            }
            saveAdvSetup(filePath);
        });
    }

    handleLoad() {
        const { loadAdvSetup } = this.props;
        const { dialog } = electron.remote;
        dialog
            .showOpenDialog({ filters, properties: ['openFile'] })
            .then(({ canceled, filePaths }) => {
                if (!filePaths || canceled) {
                    return;
                }
                const [filePath] = filePaths;
                if (!filePath) {
                    return;
                }
                loadAdvSetup(filePath);
            });
    }

    render() {
        const {
            tempAdvDataEntries,
            tempScanRespEntries,
            show,
            deleteAdvData,
            setAdvdataStatus,
            deleteScanRsp,
            hideSetupDialog,
        } = this.props;

        return (
            <Modal
                className="adv-setup"
                show={show}
                onHide={() => {}}
                size="lg"
            >
                <Modal.Header>
                    <Modal.Title>Advertising setup</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AdvertisingData onValueChange={this.handleValueChange} />
                    <div className="adv-row">
                        <div className="adv-col adv-pkt">
                            <Button
                                className="btn-add btn-primary btn-nordic mdi mdi-plus"
                                onClick={this.addToAdvData}
                            >
                                {' Add to advertising data'}
                            </Button>
                            <AdvertisingList
                                title="Advertising data"
                                onDelete={deleteAdvData}
                                advEntries={tempAdvDataEntries}
                            />
                        </div>
                        <div className="adv-col scan-rsp-pkt">
                            <Button
                                className="btn-add btn-primary btn-nordic mdi mdi-plus"
                                onClick={this.addToScanResponse}
                            >
                                {' Add to scan response'}
                            </Button>
                            <AdvertisingList
                                title="Scan response data"
                                onDelete={deleteScanRsp}
                                advEntries={tempScanRespEntries}
                            />
                        </div>
                    </div>
                    <div className="adv-row">
                        <Form.Label className="error-label" variant="danger">
                            {setAdvdataStatus}
                        </Form.Label>
                    </div>
                </Modal.Body>
                <Modal.Footer className="advertising-setup-footer">
                    <div>
                        <Button
                            variant="outline-secondary"
                            onClick={this.handleLoad}
                        >
                            Load setup
                        </Button>
                        <Button
                            variant="outline-secondary"
                            onClick={this.handleSave}
                        >
                            Save setup
                        </Button>
                    </div>
                    <div>
                        <Button
                            className="btn-primary btn-nordic"
                            onClick={this.handleApply}
                        >
                            Apply
                        </Button>
                        <Button
                            variant="outline-secondary"
                            onClick={hideSetupDialog}
                        >
                            Close
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        );
    }
}

function mapStateToProps(state) {
    const { advertising } = state.app;

    return {
        tempAdvDataEntries: advertising.tempAdvDataEntries,
        tempScanRespEntries: advertising.tempScanRespEntries,
        show: advertising.show,
        setAdvdataStatus: advertising.setAdvdataStatus,
    };
}

function mapDispatchToProps(dispatch) {
    const retval = {
        ...bindActionCreators(AdvertisingActions, dispatch),
    };

    return retval;
}

export default connect(mapStateToProps, mapDispatchToProps)(AdvertisingSetup);

AdvertisingSetup.propTypes = {
    tempAdvDataEntries: PropTypes.instanceOf(List).isRequired,
    tempScanRespEntries: PropTypes.instanceOf(List).isRequired,
    show: PropTypes.bool.isRequired,
    addAdvEntry: PropTypes.func.isRequired,
    applyChanges: PropTypes.func.isRequired,
    setAdvertisingData: PropTypes.func.isRequired,
    setAdvdataStatus: PropTypes.string.isRequired,
    deleteAdvData: PropTypes.func.isRequired,
    addScanRsp: PropTypes.func.isRequired,
    deleteScanRsp: PropTypes.func.isRequired,
    hideSetupDialog: PropTypes.func.isRequired,
    saveAdvSetup: PropTypes.func.isRequired,
    loadAdvSetup: PropTypes.func.isRequired,
};
