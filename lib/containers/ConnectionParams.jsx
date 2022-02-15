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

import * as AdapterActions from '../actions/adapterActions';
import ConnectionParamsControl from '../components/ConnectionParamsControl';

class ConnectionParams extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            connectionParameters: null,
        };
    }

    handleParamChange = connectionParameters =>
        this.setState({ connectionParameters });

    handleApply = () => {
        const { hideConnectionParamDialog, setConnectionParams } = this.props;
        const { connectionParameters } = this.state;
        if (!connectionParameters) {
            return;
        }
        setConnectionParams(connectionParameters);
        hideConnectionParamDialog();
    };

    render() {
        const {
            showConnectionParams,
            connectionParameters,
            hideConnectionParamDialog,
        } = this.props;

        return (
            <Modal
                className="adv-param-modal"
                show={showConnectionParams}
                onHide={hideConnectionParamDialog}
            >
                <Modal.Header>
                    <Modal.Title>Connection parameters</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ConnectionParamsControl
                        onChange={this.handleParamChange}
                        connectionParameters={connectionParameters}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <div className="form-group">
                        <Button
                            type="button"
                            onClick={this.handleApply}
                            className="btn btn-primary btn-sm btn-nordic"
                        >
                            Apply
                        </Button>
                        <Button
                            type="button"
                            onClick={hideConnectionParamDialog}
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
    const { adapter } = state.app;

    return {
        showConnectionParams: adapter.showConnectionParams,
        connectionParameters: adapter.connectionParameters,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        ...bindActionCreators(AdapterActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionParams);

ConnectionParams.propTypes = {
    connectionParameters: PropTypes.object,
    showConnectionParams: PropTypes.bool.isRequired,
    hideConnectionParamDialog: PropTypes.func.isRequired,
    setConnectionParams: PropTypes.func.isRequired,
};
