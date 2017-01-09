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

import { Button } from 'react-bootstrap';

import { SecurityParamsControls } from '../components/SecurityParamsControls';

import { BLEEventType } from '../actions/common';

export class PairingEditor extends React.PureComponent {
    constructor(props) {
        super(props);

        const { event } = props;

        this.secParams = event && event.pairingParameters ? event.pairingParameters : null;
    }

    handleSecParamsChange(params) {
        this.secParams = this.secParams.merge(params);
    }

    handlePair() {
        const {
            event,
            onPair,
        } = this.props;

        onPair(this.secParams);
    }

    handleAccept() {
        const {
            event,
            onAccept,
        } = this.props;

        onAccept(this.secParams);
    }

    handleReject() {
        const {
            event,
            onReject,
        } = this.props;

        onReject();
    }

    handleCancel() {
        const {
            onCancel,
        } = this.props;

        onCancel();
    }

    render() {
        const {
            event,
            onCancel,
            security,
        } = this.props;

        const title = (event.type === BLEEventType.PEER_INITIATED_PAIRING) ? 'Pairing requested'
            : 'User initiated pairing';

        const cancelButton = (event.type === BLEEventType.USER_INITIATED_PAIRING) ?
            <Button type='button' onClick={() => this.handleCancel()}
                    className='btn btn-default btn-sm btn-nordic'>Cancel</Button> : '';

        const pairButton = (event.type === BLEEventType.USER_INITIATED_PAIRING) ?
            <Button type='button' onClick={() => this.handlePair()}
                className='btn btn-primary btn-sm btn-nordic'>Pair</Button> : '';

        const acceptButton = (event.type === BLEEventType.PEER_INITIATED_PAIRING) ?
            <Button type='button' onClick={() => this.handleAccept()}
                className='btn btn-primary btn-sm btn-nordic'>Accept</Button> : '';

        const rejectButton = (event.type === BLEEventType.PEER_INITIATED_PAIRING) ?
            <Button type='button' onClick={() => this.handleReject()}
                className='btn btn-default btn-sm btn-nordic'>Reject</Button> : '';

        const ignoreButton = (event.type === BLEEventType.PEER_INITIATED_PAIRING) ?
            <Button type='button' onClick={() => this.handleCancel()}
                className='btn btn-default btn-sm btn-nordic'>Ignore</Button> : '';

        return (
            <div>
                <div className='event-header'>
                    <h4>{title}</h4>
                </div>
                <form className='form-horizontal'>
                    <SecurityParamsControls onChange={secParams => this.handleSecParamsChange(secParams)} securityParams={event.pairingParameters} />
                    <div className='form-group'>
                        {cancelButton}
                        {ignoreButton}
                        {pairButton}
                        {rejectButton}
                        {acceptButton}
                    </div>
                </form>
            </div>
        );
    }
}

PairingEditor.propTypes = {
    event: PropTypes.object.isRequired,
};
