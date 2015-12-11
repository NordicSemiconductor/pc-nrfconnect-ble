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

import React from 'react';

import {Modal} from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import Component from 'react-pure-render/component';

export default class ConfirmationDialog extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        let errors = [];

        if (this.props.errors.constructor === Array) {
            errors = this.props.errors.map((error, index) => (<p key={index}>{error}</p>));
        } else {
            errors = [(<p key={0}>{this.props.errors}</p>)];
        }

        return (
            <div>
                <Modal show={this.props.show} onHide={this.props.onOk}>
                    <Modal.Header closeButton>
                        <Modal.Title>Error!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {errors}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.props.onOk}>Ok</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}
