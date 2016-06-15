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
        return {
            showModal: this.props.show,
            showProgress: this.props.showProgress,
        };
    },

    render() {
        const progressStyle = {
            visibility: this.props.showProgress ? 'visible' : 'hidden',
        };

        const buttonDisabled = this.props.showProgress;
        const backDrop = this.props.showProgress ? 'static' : false;

        return (
          <div>
            <Modal show={this.props.show} onHide={this.props.onCancel} backdrop={backDrop}>
              <Modal.Header closeButton={!buttonDisabled}>
                <Modal.Title>Confirm</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>{this.props.text}</p>
              </Modal.Body>
              <Modal.Footer>
                <img className='spinner' src='resources/ajax-loader.gif' height='16' width='16' style={progressStyle} />
                &nbsp;
                <Button onClick={this.props.onOk} disabled={buttonDisabled}>OK</Button>
                <Button onClick={this.props.onCancel} disabled={buttonDisabled}>Cancel</Button>
              </Modal.Footer>
            </Modal>
          </div>
        );
    },
});

module.exports = ConfirmationDialog;
