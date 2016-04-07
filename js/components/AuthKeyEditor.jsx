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
import { toHexString } from '../utils/stringUtil';

export class AuthKeyEditor extends Component {
    constructor(props) {
        super(props);

        this.authKeyInput = '';
        this.randomInput = '';
        this.confirmInput = '';
    }

    handlePasskeyChange(event) {
        const { onKeypress } = this.props;
        let _event = this.props.event;

        if (_event.sendKeypressEnabled === true) {
            let newCount = event.target.value.length - this.authKeyInput.length;

            if (event.target.value.length === 0 && this.authKeyInput.length > 1) {
                onKeypress('BLE_GAP_KP_NOT_TYPE_PASSKEY_CLEAR');
            } else {
                if (newCount > 0) {
                    for (let i = 0; i < newCount; i++) {
                        onKeypress('BLE_GAP_KP_NOT_TYPE_PASSKEY_DIGIT_IN');
                    }
                } else if (newCount < 0) {
                    for (let i = 0; i < Math.abs(newCount); i++) {
                        onKeypress('BLE_GAP_KP_NOT_TYPE_PASSKEY_DIGIT_OUT');
                    }
                }
            }
        }

        this.authKeyInput = event.target.value;
    }

    handleRandomChange(event) {
        this.randomInput = event.target.value;
    }

    handleConfirmChange(event) {
        this.confirmInput = event.target.value;
    }

    handlePasskeySubmit() {
        const { onAuthKeySubmit } = this.props;

        onAuthKeySubmit('BLE_GAP_AUTH_KEY_TYPE_PASSKEY', this.authKeyInput);
    }

    handleOobSubmit() {
        const { onAuthKeySubmit } = this.props;

        onAuthKeySubmit('BLE_GAP_AUTH_KEY_TYPE_OOB', this.authKeyInput);
    }

    handleLescOobSubmit() {
        const { onLescOobSubmit } = this.props;

        onLescOobSubmit({
            confirm: this.confirmInput,
            random: this.randomInput,
        });
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

    createPasskeyDisplayControls(passkey, keypressEnabled, keypressStartReceived, keypressEndReceived, keypressCount) {
        const digitsCreated = [];
        const digitsTypedIn = [];

        for (let i of passkey) {
            digitsCreated.push(
                <div className='col-sm-1'>{i}</div>
            );
        }

        let digitsCreatedFormGroup = <div className='form-group'>
            <label className='control-label col-sm-4'>Passkey</label>
            <div className='col-sm-8'>
                {digitsCreated}
            </div>
        </div>;

        let digitsTypedInFormGroup = '';

        if (keypressEnabled) {
            if (keypressCount !== undefined) {
                let style = {
                    backgroundColor: keypressStartReceived === true ? 'green' : 'red',
                };

                for (let i = 0; i < keypressCount; i++) {
                    digitsTypedIn.push(
                        <div className='col-sm-1' style={style}>*</div>
                    );
                }

                if (keypressCount < 6) {
                    for (let i = 0; i < 6 - keypressCount; i++) {
                        digitsTypedIn.push(
                            <div className='col-sm-1'  style={style}>-</div>
                        );
                    }
                }

                digitsTypedInFormGroup = <div className='form-group'>
                    <label className='control-label col-sm-4'>Typed</label>
                    <div className='col-sm-8'>
                        {digitsTypedIn}
                    </div>
                </div>;
            }
        }

        return (
            <form className='form-horizontal'>
                {digitsCreatedFormGroup}
                {digitsTypedInFormGroup}
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
                        <Input standalone readonly value={passkey}/>
                    </div>
                </div>
                <div className='form-group'>
                    <Button type='button' onClick={() => this.handleNumericalComparisonMatch(false)} className='btn btn-default btn-sm btn-nordic'>No match</Button>
                    <Button type='button' onClick={() => this.handleNumericalComparisonMatch(true)} className='btn btn-primary btn-sm btn-nordic'>Match</Button>
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
        const { event } = this.props;

        const random = toHexString(event.ownOobData.r).replace(/-/g, '');
        const confirm = toHexString(event.ownOobData.c).replace(/-/g, '');

        return (
            <form className='form-horizontal'>
                <div className='form-group'>
                    <label className='control-label col-sm-4'>Peer random</label>
                    <div className='col-sm-7'>
                        <Input
                            type='text' size={32} id='randomInputId' onChange={event => this.handleRandomChange(event)} />
                    </div>

                    <label className='control-label col-sm-4'>Peer confirm</label>
                    <div className='col-sm-7'>
                        <Input
                            type='text' size={32} id='confirmInputId' onChange={event => this.handleConfirmChange(event)} />
                    </div>

                    <label className='control-label col-sm-4'>Own random</label>
                    <div className='col-sm-7'>
                        <Input readOnly
                            type='text' size={32} id='passkeyInputId' value={random} />
                    </div>

                    <label className='control-label col-sm-4'>Own confirm</label>
                    <div className='col-sm-7'>
                        <Input readOnly
                            type='text' size={32} id='passkeyInputId' value={confirm} />
                    </div>
                </div>
                <div className='form-group'>
                    <Button type='button' onClick={() => this.handleCancel()} className='btn btn-default btn-sm btn-nordic'>Ignore</Button>
                    <Button type='button' onClick={() => this.handleLescOobSubmit()} className='btn btn-primary btn-sm btn-nordic'>Submit</Button>
                </div>
            </form>
        );
    }

    render() {
        const { event } = this.props;

        const title = (event.type === BLEEventType.PASSKEY_DISPLAY) ? 'Passkey display'
            : (event.type === BLEEventType.PASSKEY_REQUEST) ? 'Passkey request'
            : (event.type === BLEEventType.NUMERICAL_COMPARISON) ? 'Numerical comparison'
            : (event.type === BLEEventType.LEGACY_OOB_REQUEST) ? 'Out-of-band data request'
            : (event.type === BLEEventType.LESC_OOB_REQUEST) ? 'Out-of-band data request'
            : '';

        const controls = (event.type === BLEEventType.PASSKEY_DISPLAY) ? this.createPasskeyDisplayControls(event.authKeyParams.passkey, event.receiveKeypressEnabled, event.keypressStartReceived, event.keypressEndReceived, event.keypressCount)
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
    onKeypress: PropTypes.func,
    onAuthKeySubmit: PropTypes.func,
    onNumericalComparisonMatch:  PropTypes.func,
};
