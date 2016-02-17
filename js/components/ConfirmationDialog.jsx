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

'use strict';

import React from 'react';

import {Modal} from 'react-bootstrap';
import {Button} from 'react-bootstrap';

var ConfirmationDialog = React.createClass({
    getInitialState() {
        return { showModal: this.props.show };
    },

    render() {
        return (
          <div>
            <Modal show={this.props.show} onHide={this.props.onCancel}>
              <Modal.Header closeButton>
                <Modal.Title>Confirm</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>{this.props.text}</p>
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={this.props.onOk}>OK</Button>
                <Button onClick={this.props.onCancel}>Cancel</Button>
              </Modal.Footer>
            </Modal>
          </div>
        );
    },
});

module.exports = ConfirmationDialog;
