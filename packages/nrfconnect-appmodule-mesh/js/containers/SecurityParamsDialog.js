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

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Modal } from 'react-bootstrap';
import { Label } from 'react-bootstrap';
import { Input } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { DropdownButton } from 'react-bootstrap';
import { MenuItem } from 'react-bootstrap';

import { SecurityParamsControls } from '../components/SecurityParamsControls';

import * as SecurityActions from '../actions/securityActions';

const IO_CAPS_DISPLAY_ONLY = 0;
const IO_CAPS_DISPLAY_YESNO = 1;
const IO_CAPS_KEYBOARD_ONLY = 2;
const IO_CAPS_NONE = 3;
const IO_CAPS_KEYBOARD_DISPLAY = 4;

export class SecurityParamsDialog extends Component {
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
