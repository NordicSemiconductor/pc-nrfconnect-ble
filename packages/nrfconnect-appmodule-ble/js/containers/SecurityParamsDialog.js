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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Modal } from 'react-bootstrap';
import { Button } from 'react-bootstrap';

import { SecurityParamsControls } from '../components/SecurityParamsControls';

import * as SecurityActions from '../actions/securityActions';

const IO_CAPS_DISPLAY_ONLY = 0;
const IO_CAPS_DISPLAY_YESNO = 1;
const IO_CAPS_KEYBOARD_ONLY = 2;
const IO_CAPS_NONE = 3;
const IO_CAPS_KEYBOARD_DISPLAY = 4;

export class SecurityParamsDialog extends React.PureComponent {
    constructor(props) {
        super(props);

        this.secParams = props.security ? props.security.securityParams : null;
    }

    handleSecParamsChange(params) {
        this.secParams = params;
    }

    handleApplyParams() {
        const {
            setSecurityParams,
            hideSecurityParamsDialog,
        } = this.props;

        setSecurityParams(this.secParams);

        hideSecurityParamsDialog();
    }

    handleCancel() {
        const {
            hideSecurityParamsDialog,
        } = this.props;

        hideSecurityParamsDialog();
    }

    render() {
        const {
            onCancel,
            security,
        } = this.props;

        if (!security) {
            return <div />;
        }

        return (
            <Modal className='' show={security.showingSecurityDialog} onHide={() => {}}>
                <Modal.Header>
                    <Modal.Title>Security parameters</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form className='form-horizontal'>
                        <SecurityParamsControls onChange={secParams => this.handleSecParamsChange(secParams)} securityParams={security.securityParams} />
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <div className='form-group'>
                        <Button type='button' onClick={() => this.handleApplyParams()}
                            className='btn btn-primary btn-sm btn-nordic'>Apply</Button>
                        <Button type='button'
                                onClick={() => this.handleCancel()}
                                className='btn btn-default btn-sm btn-nordic'>Cancel</Button>
                    </div>
                </Modal.Footer>
            </Modal>
        );
    }
}

function mapStateToProps(state) {
    const {
        adapter,
    } = state;

    const selectedAdapter = adapter.getIn(['adapters', adapter.selectedAdapter]);

    if (!selectedAdapter) {
        return {};
    }

    return {
        security: selectedAdapter.security,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
        {},
        bindActionCreators(SecurityActions, dispatch)
    );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SecurityParamsDialog);

SecurityParamsDialog.propTypes = {
    security: PropTypes.object,
    setSecurityParams: PropTypes.func.isRequired,
    hideSecurityParamsDialog: PropTypes.func.isRequired,
};
