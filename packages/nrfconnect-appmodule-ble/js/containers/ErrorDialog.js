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

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as ErrorActions from '../actions/errorDialogActions';
import { Modal, Button } from 'react-bootstrap';

export class ErrorDialog extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    _createErrorHtml(index, error) {
        const {
            debug,
        } = this.props;

        let html;

        if (debug === true) {
            html = (<p key={index}>{error.stack}</p>);
        } else {
            html = (<p key={index}>{error.message}</p>);
        }

        return html;
    }

    render() {
        const {
            visible,
            errors,
            closeErrorDialog,
        } = this.props;

        let _errors = [];

        errors.forEach((error, index) => _errors.push(this._createErrorHtml(index, error)));

        return (
            <div>
                <Modal show={visible} onHide={() => closeErrorDialog()}>
                    <Modal.Header closeButton>
                        <Modal.Title>Error!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {_errors}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button autoFocus onClick={() => closeErrorDialog()}>OK</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

ErrorDialog.propTypes = {
    errors: PropTypes.object.isRequired,
    visible: PropTypes.bool.isRequired,
    closeErrorDialog: PropTypes.func.isRequired,
    toggleDebug: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const {
        errorDialog,
    } = state;

    return {
        visible: errorDialog.visible,
        errors: errorDialog.errors,
        debug: errorDialog.debug,
    };
}

function mapDispatchToProps(dispatch) {
    const retval = Object.assign(
        {},
        bindActionCreators(ErrorActions, dispatch)
    );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ErrorDialog);
