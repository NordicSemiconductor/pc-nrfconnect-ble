/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
                    variant="outline-secondary"
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
                    variant="outline-secondary"
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
                    variant="outline-secondary"
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
