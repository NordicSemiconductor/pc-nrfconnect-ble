/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';

const ConfirmationDialog = props => {
    const { text, show, onCancel, onOk, okButtonText, cancelButtonText } =
        props;

    return (
        <div>
            <Modal show={show} onHide={onCancel}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{text}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={onOk}>{okButtonText}</Button>
                    <Button onClick={onCancel}>{cancelButtonText}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

ConfirmationDialog.propTypes = {
    text: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
    okButtonText: PropTypes.string,
    cancelButtonText: PropTypes.string,
};

ConfirmationDialog.defaultProps = {
    okButtonText: 'OK',
    cancelButtonText: 'Cancel',
};

export default ConfirmationDialog;
