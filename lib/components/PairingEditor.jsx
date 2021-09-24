/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint react/forbid-prop-types: off */

'use strict';

import React from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

import { BLEEventType } from '../actions/common';
import SecurityParamsControls from './SecurityParamsControls';

class PairingEditor extends React.PureComponent {
    constructor(props) {
        super(props);

        const { event } = props;

        this.secParams =
            event && event.pairingParameters ? event.pairingParameters : null;
        this.handleSecParamsChange = this.handleSecParamsChange.bind(this);
        this.handlePair = this.handlePair.bind(this);
        this.handleAccept = this.handleAccept.bind(this);
        this.handleReject = this.handleReject.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
    }

    handleSecParamsChange(params) {
        this.secParams = this.secParams.merge(params);
    }

    handlePair() {
        const { onPair } = this.props;
        if (onPair) {
            onPair(this.secParams);
        }
    }

    handleAccept() {
        const { onAccept } = this.props;
        if (onAccept) {
            onAccept(this.secParams);
        }
    }

    handleReject() {
        const { onReject } = this.props;
        if (onReject) {
            onReject();
        }
    }

    handleCancel() {
        const { onCancel } = this.props;
        onCancel();
    }

    render() {
        const { event } = this.props;

        const title =
            event.type === BLEEventType.PEER_INITIATED_PAIRING
                ? 'Pairing requested'
                : 'User initiated pairing';

        const cancelButton =
            event.type === BLEEventType.USER_INITIATED_PAIRING ? (
                <Button
                    type="button"
                    onClick={this.handleCancel}
                    className="btn btn-default btn-sm btn-nordic"
                    variant="secondary"
                >
                    Cancel
                </Button>
            ) : (
                ''
            );

        const pairButton =
            event.type === BLEEventType.USER_INITIATED_PAIRING ? (
                <Button
                    type="button"
                    onClick={this.handlePair}
                    className="btn btn-primary btn-sm btn-nordic"
                >
                    Pair
                </Button>
            ) : (
                ''
            );

        const acceptButton =
            event.type === BLEEventType.PEER_INITIATED_PAIRING ? (
                <Button
                    type="button"
                    onClick={this.handleAccept}
                    className="btn btn-primary btn-sm btn-nordic"
                >
                    Accept
                </Button>
            ) : (
                ''
            );

        const rejectButton =
            event.type === BLEEventType.PEER_INITIATED_PAIRING ? (
                <Button
                    type="button"
                    onClick={this.handleReject}
                    className="btn btn-default btn-sm btn-nordic"
                    variant="secondary"
                >
                    Reject
                </Button>
            ) : (
                ''
            );

        const ignoreButton =
            event.type === BLEEventType.PEER_INITIATED_PAIRING ? (
                <Button
                    type="button"
                    onClick={this.handleCancel}
                    className="btn btn-default btn-sm btn-nordic"
                    variant="secondary"
                >
                    Ignore
                </Button>
            ) : (
                ''
            );

        return (
            <div>
                <div className="event-header">
                    <h4>{title}</h4>
                </div>
                <form className="form-horizontal">
                    <SecurityParamsControls
                        onChange={this.handleSecParamsChange}
                        securityParams={event.pairingParameters}
                    />
                    <div className="row-of-buttons">
                        {acceptButton}
                        {rejectButton}
                        {pairButton}
                        {ignoreButton}
                        {cancelButton}
                    </div>
                </form>
            </div>
        );
    }
}

PairingEditor.propTypes = {
    event: PropTypes.object.isRequired,
    onPair: PropTypes.func,
    onAccept: PropTypes.func,
    onReject: PropTypes.func,
    onCancel: PropTypes.func.isRequired,
};

PairingEditor.defaultProps = {
    onPair: null,
    onAccept: null,
    onReject: null,
};

export default PairingEditor;
