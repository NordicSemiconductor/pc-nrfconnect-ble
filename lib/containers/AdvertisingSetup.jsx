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

import { List } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as AdvertisingActions from '../actions/advertisingActions';
import AdvertisingData from '../components/AdvertisingData';
import AdvertisingList from '../components/AdvertisingList';

class AdvertisingSetup extends React.PureComponent {
    constructor(props) {
        super(props);
        this.id = 0;

        this.addToAdvData = this.addToAdvData.bind(this);
        this.addToScanResponse = this.addToScanResponse.bind(this);
        this.handleApply = this.handleApply.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
    }

    prepareValue() {
        if (!this.typeValue) {
            return undefined;
        }

        this.id += 1;
        this.typeValue.id = this.id;
        return Object.assign({}, this.typeValue);
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
        const {
            applyChanges,
            setAdvertisingData,
        } = this.props;

        applyChanges();
        setAdvertisingData();
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
            <Modal className="adv-setup" show={show} onHide={() => {}} size="lg">
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
                </Modal.Body>
                <Modal.Footer>
                    <Form.Label className="error-label" variant="danger">{setAdvdataStatus}</Form.Label>
                    <Button
                        className="btn-primary btn-nordic"
                        onClick={this.handleApply}
                    >
                        Apply
                    </Button>
                    <Button className="btn-primary btn-nordic" onClick={hideSetupDialog}>
                        Close
                    </Button>
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
    const retval = Object.assign(
        {},
        bindActionCreators(AdvertisingActions, dispatch),
    );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(AdvertisingSetup);

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
};
