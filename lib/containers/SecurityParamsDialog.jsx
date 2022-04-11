/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint react/forbid-prop-types: off */

'use strict';

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import * as SecurityActions from '../actions/securityActions';
import SecurityParamsControls from '../components/SecurityParamsControls';

class SecurityParamsDialog extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            secParams: null,
        };
    }

    handleSecParamsChange = secParams => this.setState({ secParams });

    handleApplyParams() {
        const {
            setSecurityParams,
            hideSecurityParamsDialog,
            security: { securityParams },
        } = this.props;
        const { secParams } = this.state;
        setSecurityParams(secParams || securityParams);
        hideSecurityParamsDialog();
    }

    handleCancel() {
        const { hideSecurityParamsDialog } = this.props;
        hideSecurityParamsDialog();
    }

    render() {
        const { security } = this.props;

        if (!security) {
            return <div />;
        }

        return (
            <Modal
                className="security-param-modal"
                show={security.showingSecurityDialog}
                onHide={() => {}}
            >
                <Modal.Header>
                    <Modal.Title>Security parameters</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form className="form-horizontal">
                        <SecurityParamsControls
                            onChange={this.handleSecParamsChange}
                            securityParams={security.securityParams}
                        />
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <div className="form-group">
                        <Button
                            type="button"
                            onClick={() => this.handleApplyParams()}
                            className="btn btn-primary btn-sm btn-nordic"
                        >
                            Apply
                        </Button>
                        <Button
                            type="button"
                            onClick={() => this.handleCancel()}
                            className="btn btn-default btn-sm btn-nordic"
                            variant="secondary"
                        >
                            Cancel
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        );
    }
}

function mapStateToProps(state) {
    const {
        adapter: { selectedAdapter },
    } = state.app;

    if (!selectedAdapter) {
        return {};
    }

    return {
        security: selectedAdapter.security,
        adapter: state.app.adapter,
    };
}

function mapDispatchToProps(dispatch) {
    const retval = {
        ...bindActionCreators(SecurityActions, dispatch),
    };

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
