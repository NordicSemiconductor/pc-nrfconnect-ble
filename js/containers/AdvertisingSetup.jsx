/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
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
'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Modal } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { Label } from 'react-bootstrap';

import AdvertisingList from '../components/AdvertisingList';
import AdvertisingData from '../components/AdvertisingData';

import * as AdvertisingSetupActions from '../actions/advertisingSetupActions';

class AdvertisingSetup extends Component {
    constructor(props) {
        super(props);
        this.id = 0;
    }

    _prepareValue() {
        if (!this.typeValue) return;

        this.id++;
        this.typeValue.id = this.id;
        return Object.assign({}, this.typeValue);
    }

    addToAdvData() {
        const newValue = this._prepareValue();

        if (!newValue || newValue.value === '') {
            return;
        }

        this.props.addAdvEntry(newValue);
    }

    addToScanResponse() {
        const newValue = this._prepareValue();

        if (!newValue || newValue.value === '') {
            return;
        }

        this.props.addScanRsp(newValue);
    }

    handleValueChange(typeValue) {
        this.typeValue = typeValue;
    }

    handleApply() {
        const {
            setAdvertisingData,
            advertisingSetup,
        } = this.props;

        setAdvertisingData(advertisingSetup);
    }

    render() {
        const {
            advDataEntries,
            scanResponseEntries,
            show,
            addAdvEntry,
            deleteAdvData,
            addScanRsp,
            setAdvdataStatus,
            deleteScanRsp,
            showSetupDialog,
            hideSetupDialog,
        } = this.props;

        return (
            <div>
                <Modal className="adv-setup" show={show} onHide={() => {}} bsSize="large">
                    <Modal.Header>
                        <Modal.Title>Advertising setup</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <AdvertisingData onValueChange={value => this.handleValueChange(value)}/>
                        <div className="adv-row">
                            <div className="adv-col adv-pkt">
                                <Button
                                    className="btn-add btn-primary btn-nordic"
                                    onClick={() => this.addToAdvData()}>Add to advertising data</Button>
                                <AdvertisingList
                                    title="Advertising data"
                                    onDelete={deleteAdvData}
                                    advEntries={advDataEntries}/>
                            </div>
                            <div className="adv-col scan-rsp-pkt">
                                <Button
                                    className="btn-add btn-primary btn-nordic"
                                    onClick={() => this.addToScanResponse()}>Add to scan response</Button>
                                <AdvertisingList
                                    title="Scan response data"
                                    onDelete={deleteScanRsp}
                                    advEntries={scanResponseEntries}/>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Label className="error-label" bsStyle="danger">{setAdvdataStatus}</Label>
                        <Button className="btn-primary btn-nordic" onClick={() => this.handleApply()}>Apply</Button>
                        <Button className="btn-primary btn-nordic" onClick={hideSetupDialog}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const {advertisingSetup} = state;

    return {
        advertisingSetup: advertisingSetup,
        advDataEntries: advertisingSetup.advDataEntries,
        scanResponseEntries: advertisingSetup.scanResponseEntries,
        show: advertisingSetup.show,
        setAdvdataStatus: advertisingSetup.setAdvdataStatus,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
        {},
        bindActionCreators(AdvertisingSetupActions, dispatch),
    );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AdvertisingSetup);

AdvertisingSetup.propTypes = {
    advDataEntries: PropTypes.object.isRequired,
    scanResponseEntries: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    addAdvEntry: PropTypes.func.isRequired,
    setAdvertisingData: PropTypes.func.isRequired,
    advertisingSetup: PropTypes.object.isRequired,
    setAdvdataStatus: PropTypes.string.isRequired,
    deleteAdvData: PropTypes.func.isRequired,
    addScanRsp: PropTypes.func.isRequired,
    deleteScanRsp: PropTypes.func.isRequired,
    showSetupDialog: PropTypes.func.isRequired,
    hideSetupDialog: PropTypes.func.isRequired,
};
