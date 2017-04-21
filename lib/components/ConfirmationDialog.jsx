/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

import React, { PropTypes } from 'react';

import { Modal, Button } from 'react-bootstrap';
import Spinner from './Spinner';

const ConfirmationDialog = props => {
    const {
        text,
        show,
        showProgress,
        onCancel,
        onOk,
    } = props;
    const buttonDisabled = showProgress;
    const backDrop = showProgress ? 'static' : false;

    return (
        <div>
            <Modal show={show} onHide={onCancel} backdrop={backDrop}>
                <Modal.Header closeButton={!buttonDisabled}>
                    <Modal.Title>Confirm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{text}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Spinner visible={showProgress} />
                    &nbsp;
                    <Button onClick={onOk} disabled={buttonDisabled}>OK</Button>
                    <Button onClick={onCancel} disabled={buttonDisabled}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

ConfirmationDialog.propTypes = {
    text: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    showProgress: PropTypes.bool,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
};

ConfirmationDialog.defaultProps = {
    showProgress: false,
};

export default ConfirmationDialog;
