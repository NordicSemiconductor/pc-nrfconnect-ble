/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint react/forbid-prop-types: off */
/* eslint-disable react/state-in-constructor */

'use strict';

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import * as AdvertisingActions from '../actions/advertisingActions';
import AdvertisingParamsControl from '../components/AdvertisingParamsControl';

class AdvertisingParams extends React.PureComponent {
    state = {
        advParams: null,
    };

    handleAdvParamsChange = advParams => this.setState({ advParams });

    handleApply() {
        const { setAdvParams, hideAdvParamDialog } = this.props;
        const { advParams } = this.state;

        if (
            !advParams ||
            !advParams.interval ||
            (!advParams.timeout && advParams.timeout !== 0)
        )
            return;

        setAdvParams(advParams);
        hideAdvParamDialog();
    }

    handleCancel() {
        const { hideAdvParamDialog } = this.props;
        hideAdvParamDialog();
    }

    render() {
        const { showAdvParams, advParams } = this.props;

        return (
            <Modal
                className="adv-param-modal"
                show={showAdvParams}
                onHide={() => {
                    this.handleCancel();
                }}
            >
                <Modal.Header>
                    <Modal.Title>Advertising parameters</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AdvertisingParamsControl
                        onChange={this.handleAdvParamsChange}
                        advParams={advParams}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <div className="form-group">
                        <Button
                            type="button"
                            onClick={() => this.handleApply()}
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
    const { advertising } = state.app;

    return {
        showAdvParams: advertising.showAdvParams,
        advParams: advertising.advParams,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(AdvertisingActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdvertisingParams);

AdvertisingParams.propTypes = {
    advParams: PropTypes.object,
    showAdvParams: PropTypes.bool.isRequired,
    hideAdvParamDialog: PropTypes.func.isRequired,
    setAdvParams: PropTypes.func.isRequired,
};
