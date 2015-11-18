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

import {Modal} from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import {DropdownButton} from 'react-bootstrap';
import {MenuItem} from 'react-bootstrap';

export default class AdvertisingSetup extends Component {
    constructor(props) {
        super(props);
    }

    delete() {
        console.log('DELETE');
    }

    addToAdvData() {
        console.log('ADD TO ADV DATA');
    }

    addToScanResponse() {
        console.log('ADD TO SCAN RESPONSE');
    }

    render() {
        const {
            show,
            onCancel,
            } = this.props;

        console.log('Rendering AdvertisingSetup');
        return (
            <div>
                <Modal show={show} onHide={onCancel} bsSize="large">
                    <Modal.Header>
                        <Modal.Title>Advertising setup</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="adv-setup">
                        <div>
                            <div className="adv-drop-container">
                                <DropdownButton title="Advertising data type" id="dropdown-ad">
                                    <MenuItem eventKey="1">Complete local name</MenuItem>
                                    <MenuItem eventKey="2">Shortened local name</MenuItem>
                                    <MenuItem eventKey="3">UUID 16 bit complete list</MenuItem>
                                    <MenuItem eventKey="4">UUID 16 bit more available</MenuItem>
                                    <MenuItem eventKey="5">UUID 128 bit complete list</MenuItem>
                                    <MenuItem eventKey="6">UUID 128 bit more available</MenuItem>
                                    <MenuItem eventKey="7">TX power level</MenuItem>
                                    <MenuItem eventKey="8">Custom AD type</MenuItem>
                                </DropdownButton>
                            </div>
                            <div className="adv-value-container">
                                <div>Name (string)</div>
                                <div>
                                    <input type="text" id="value" className="" />
                                </div>
                            </div>
                            <div className="adv-row">
                                <div className="adv-col adv-pkt">
                                    <Button className="btn-add">Add to adv. data</Button>
                                    <div className="adv-table-container">
                                        <div className="adv-header">Advertising data</div>
                                        <table className="table-striped">
                                            <thead>
                                                <tr>
                                                    <th>AD type</th>
                                                    <th>Value</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Complete local name</td>
                                                    <td>My device name</td>
                                                    <td><Button bsSize="small" onClick={this.delete}>Delete</Button></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="adv-col scan-rsp-pkt">
                                    <Button className="btn-add">Add to scan response</Button>
                                    <div className="adv-table-container">
                                        <div className="adv-header">Scan response data</div>
                                        <table className="table-striped">
                                            <thead>
                                                <tr>
                                                    <th>AD type</th>
                                                    <th>Value</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>UUID 16 bit complete list</td>
                                                    <td>0x180d, 0x2305, 0x3453, 0x2342</td>
                                                    <td><Button bsSize="small" onClick={this.delete}>Delete</Button></td>
                                                </tr>
                                                <tr>
                                                    <td>TX power level</td>
                                                    <td>20</td>
                                                    <td><Button bsSize="small" onClick={this.delete}>Delete</Button></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.props.onApply}>Apply</Button>
                        <Button onClick={this.props.onCancel}>Cancel</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

AdvertisingSetup.propTypes = {
    show: PropTypes.bool.isRequired,
    onApply: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};
