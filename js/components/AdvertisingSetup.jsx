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
import {DropdownButton} from 'react-bootstrap';
import {MenuItem} from 'react-bootstrap';
import {Button} from 'react-bootstrap';

import AdvertisingList from './AdvertisingList';

export default class AdvertisingSetup extends Component {
    constructor(props) {
        super(props);
    }

    onDelete(id) {
        console.log('DELETE');
    }

    onClear() {
        console.log('CLEAR');
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

        const advDataEntries = [{id:1, type:'Complete local name', value:'Wayland'},
                                {id: 2, type: 'TX power', value: '-20'},];
        const scanResponseEntries = [{id: 10, type: 'UUID 16 bit more available', value: '0x1234, 0x4343'}];

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
                                    <AdvertisingList 
                                        title="Advertising data" 
                                        onDelete={this.onDelete} 
                                        onClear={this.onClear} 
                                        advEntries={advDataEntries}/>
                                </div>
                                <div className="adv-col scan-rsp-pkt">
                                    <Button className="btn-add">Add to scan response</Button>
                                    <AdvertisingList
                                        title="Scan response data"
                                        onDelete={this.onDelete}
                                        onClear={this.onClear}
                                        advEntries={scanResponseEntries}/>
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
