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

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as ErrorActions from '../actions/errorDialogActions';
import { Modal, Button } from 'react-bootstrap';

export class ErrorDialog extends Component {
    constructor(props) {
        super(props);
    }

    _createErrorHtml(index, error) {
        const {
            debug
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
