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

import { Button, Input } from 'react-bootstrap';

import { SecurityParamsControls } from '../components/SecurityParamsControls';

import { BLEEventType } from '../actions/common';

export class AuthKeyEditor extends Component {
    constructor(props) {
        super(props);

        this.authKeyInput = '';
        this.keypressNotifyValue = props.keypressNotifyValue ? props.keypressNotifyValue : '';
    }

    handlePasskeyChange(event) {
        this.authKeyInput = event.target.value;
    }

    handlePasskeySubmit() {
        const { onAuthKeySubmit } = this.props;

        onAuthKeySubmit('BLE_GAP_AUTH_KEY_TYPE_PASSKEY', this.authKeyInput);
    }

    handleOobSubmit() {
        const { onAuthKeySubmit } = this.props;

        onAuthKeySubmit('BLE_GAP_AUTH_KEY_TYPE_OOB', this.authKeyInput);
    }

    handleNumericalComparisonMatch(match) {
        const { onNumericalComparisonMatch } = this.props;

        onNumericalComparisonMatch(match);
    }

    handleCancel() {
        const {
            event,
            onCancel,
        } = this.props;

        onCancel();
    }

    createPasskeyDisplayControls(passkey) {
        return (
            <form className='form-horizontal'>
                <div className='form-group'>
                    <label className='control-label col-sm-4'>Passkey</label>
                    <div className='col-sm-7'>
                        <Input readOnly type='text' value={passkey} />
                    </div>
                </div>
                <div className='form-group'>
                    <Button type='button' onClick={() => this.handleCancel()} className='btn btn-primary btn-sm btn-nordic'>OK</Button>
                </div>
            </form>
        );
    }

    createPasskeyRequestControls() {
        return (
            <form className='form-horizontal'>
                <div className='form-group'>
                    <label className='control-label col-sm-4'>Passkey</label>
                    <div className='col-sm-7'>
                        <Input
                            type='text' size={6} id='passkeyInputId' onChange={event => this.handlePasskeyChange(event)} />
                    </div>
                </div>
                <div className='form-group'>
                    <Button type='button' onClick={() => this.handleCancel()} className='btn btn-default btn-sm btn-nordic'>Ignore</Button>
                    <Button type='button' onClick={() => this.handlePasskeySubmit()} className='btn btn-primary btn-sm btn-nordic'>Submit</Button>
                </div>
            </form>
        );
    }

    createNumericalComparisonControls(passkey) {
        return (
            <form className='form-horizontal'>
                <div className='form-group'>
                    <label className='control-label col-sm-4'>Passkey</label>
                    <div className='col-sm-7'>
                        <Input readOnly type='text' value={passkey}/>
                    </div>
                </div>
                <div className='form-group'>
                    <Button type='button' onClick={() => this.handleNumericalComparisonMatch(true)} className='btn btn-primary btn-sm btn-nordic'>Match</Button>
                    <Button type='button' onClick={() => this.handleNumericalComparisonMatch(false)} className='btn btn-default btn-sm btn-nordic'>No match</Button>
                </div>
            </form>
        );
    }

    createLegacyOobRequestControls() {
        return (
            <form className='form-horizontal'>
                <div className='form-group'>
                    <label className='control-label col-sm-4'>Out-of-band data</label>
                    <div className='col-sm-7'>
                        <Input
                            type='text' size={6} id='passkeyInputId' onChange={event => this.handlePasskeyChange(event)} />
                    </div>
                </div>
                <div className='form-group'>
                    <Button type='button' onClick={() => this.handleCancel()} className='btn btn-default btn-sm btn-nordic'>Ignore</Button>
                    <Button type='button' onClick={() => this.handleOobSubmit()} className='btn btn-primary btn-sm btn-nordic'>Submit</Button>
                </div>
            </form>
        );
    }

    createLescOobRequestControls() {
        return '';
    }

    render() {
        const { event } = this.props;

        const title = (event.type === BLEEventType.PASSKEY_DISPLAY) ? 'Passkey display'
            : (event.type === BLEEventType.PASSKEY_REQUEST) ? 'Passkey request'
            : (event.type === BLEEventType.NUMERICAL_COMPARISON) ? 'Numerical comparison'
            : (event.type === BLEEventType.LEGACY_OOB_REQUEST) ? 'Out-of-band data request'
            : (event.type === BLEEventType.LESC_OOB_REQUEST) ? 'Out-of-band data request'
            : '';

        const controls = (event.type === BLEEventType.PASSKEY_DISPLAY) ? this.createPasskeyDisplayControls(event.authKeyParams.passkey)
            : (event.type === BLEEventType.PASSKEY_REQUEST) ? this.createPasskeyRequestControls()
            : (event.type === BLEEventType.NUMERICAL_COMPARISON) ? this.createNumericalComparisonControls(event.authKeyParams.passkey)
            : (event.type === BLEEventType.LEGACY_OOB_REQUEST) ? this.createLegacyOobRequestControls()
            : (event.type === BLEEventType.LESC_OOB_REQUEST) ? this.createLescOobRequestControls()
            : '';

        return (
            <div>
                <div className='event-header'>
                    <h4>{title}</h4>
                </div>
                {controls}
            </div>
        );
    }
}

AuthKeyEditor.propTypes = {
    event: PropTypes.object.isRequired,
};
