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

import { Button } from 'react-bootstrap';

import { SecurityParamsControls } from '../components/SecurityParamsControls';

import { BLEEventType } from '../actions/common';

export class PairingEditor extends Component {
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
