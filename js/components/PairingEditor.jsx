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

        const { security } = props;

        this.secParams = security ? security.securityParams : null;
    }

    handleSecParamsChange(params) {
        this.secParams = params;
    }

    handlePair() {
        const {
            event,
            onPair,
        } = this.props;

        onPair(event.device, this.secParams);
    }

    handleCancel() {
        const {
            event,
            onCancel,
        } = this.props;

        onCancel(event.id);
    }

    render() {
        const {
            event,
            onCancel,
            security,
        } = this.props;

        return (
            <div>
                <div className='event-header'>
                    <h4>Pairing</h4>
                </div>
                <form className='form-horizontal'>
                    <SecurityParamsControls onChange={secParams => this.handleSecParamsChange(secParams)} securityParams={security.securityParams} />
                    <div className='form-group'>
                        <Button type='button'
                                onClick={() => this.handleCancel()}
                                className='btn btn-default btn-sm btn-nordic'>Cancel</Button>
                        <Button type='button' onClick={() => this.handlePair()}
                            className='btn btn-primary btn-sm btn-nordic'>Pair</Button>
                    </div>
                </form>
            </div>
        );
    }
}

PairingEditor.propTypes = {
    event: PropTypes.object.isRequired,
};
