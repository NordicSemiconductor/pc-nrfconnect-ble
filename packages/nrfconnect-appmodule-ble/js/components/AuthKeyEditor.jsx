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
import { TextInput } from 'nrfconnect-core';

import { BLEEventType } from '../actions/common';
import { toHexString } from '../utils/stringUtil';

const SUCCESS = 'success';
const ERROR = 'error';

export class AuthKeyEditor extends React.PureComponent {
    constructor(props) {
        super(props);

        this.authKeyInput = '';
        this.randomInput = '';
        this.confirmInput = '';

        this.validationFeedbackEnabled = false;
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
        this.forceUpdate();
    }

    handleRandomChange(event) {
        this.randomInput = event.target.value;
        this.forceUpdate();
    }

    handleConfirmChange(event) {
        this.confirmInput = event.target.value;
        this.forceUpdate();
    }

    handlePasskeySubmit() {
        const { onAuthKeySubmit } = this.props;

        if (this.validatePasskeyInput(this.authKeyInput) !== SUCCESS) {
            this.validationFeedbackEnabled = true;
            this.forceUpdate();
            return;
        }

        onAuthKeySubmit('BLE_GAP_AUTH_KEY_TYPE_PASSKEY', this.authKeyInput);
    }

    handleOobSubmit() {
        const { onAuthKeySubmit } = this.props;

        if (this.validateOobInput(this.authKeyInput) !== SUCCESS) {
            this.validationFeedbackEnabled = true;
            this.forceUpdate();
            return;
        }

        onAuthKeySubmit('BLE_GAP_AUTH_KEY_TYPE_OOB', this.authKeyInput);
    }

    handleLescOobSubmit() {
        const { onLescOobSubmit } = this.props;

        if (this.validateOobInput(this.confirmInput) !== SUCCESS ||
            this.validateOobInput(this.randomInput) !== SUCCESS)
        {
            this.validationFeedbackEnabled = true;
            this.forceUpdate();
            return;
        }

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

    validatePasskeyInput(value) {
        if ((!value && value !== '')) {
            return ERROR;
        } else if (value.search(/^\d{6}$/) === -1) {
            return ERROR;
        } else {
            return SUCCESS;
        }
    }

    validateOobInput(value) {
        if (!value) {
            return ERROR;
        } else if (value.search(/^[0-9a-fA-F]{32}$/) === -1) {
            return ERROR;
        } else {
            return SUCCESS;
        }
    }

    createPasskeyDisplayControls(passkey, keypressEnabled, keypressStartReceived, keypressEndReceived, keypressCount) {
        const digitsCreated = [];
        const digitsTypedIn = [];

        for (let i = 0; i < 6; i++) {
            digitsCreated.push(
                <div key={'digitsCreated' + i} className='col-sm-1'>{passkey[i]}</div>
            );
        }

        let digitsCreatedFormGroup = <div className='form-group'>
            <label className='control-label col-sm-4' htmlFor='passkeydigits'>Passkey</label>
            <div className='col-sm-8 form-control-static' id='passkeydigits'>
                {digitsCreated}
            </div>
        </div>;

        let digitsTypedInFormGroup = '';

        if (keypressEnabled) {
            if (keypressCount !== undefined) {
                let style = {
                    backgroundColor: keypressCount > 0 ?
                                        (keypressCount == 6 ? 'green' : 'yellow')
                                        : 'red',
                };

                for (let i = 0; i < keypressCount; i++) {
                    digitsTypedIn.push(
                        <div key={'digitsTyped' + i} className='col-sm-1' style={style}>*</div>
                    );
                }

                if (keypressCount < 6) {
                    for (let i = 0; i < 6 - keypressCount; i++) {
                        digitsTypedIn.push(
                            <div key={'count' + i} className='col-sm-1'  style={style}>-</div>
                        );
                    }
                }

                digitsTypedInFormGroup = <div className='form-group'>
                    <label className='control-label col-sm-4' htmlFor='passkeytypedin'>Typed</label>
                    <div className='col-sm-8 form-control-static' id='passkeytypedin'>
                        {digitsTypedIn}
                    </div>
                </div>;
            }
        }

        return (
            <form className='form-horizontal' onSubmit={event => { this.handleCancel(); event.preventDefault(); }}>
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
            <form className='form-horizontal' onSubmit={event => { this.handlePasskeySubmit(); event.preventDefault(); }}>
                <TextInput
                    label='Passkey'
                    defaultValue=''
                    id='passkeyInputId'
                    hasFeedback={this.validationFeedbackEnabled}
                    placeholder='Enter passkey'
                    validationState={this.validatePasskeyInput(this.authKeyInput)}
                    onChange={event => this.handlePasskeyChange(event)} />
                <div className='form-group'>
                    <Button type='button' onClick={() => this.handleCancel()} className='btn btn-default btn-sm btn-nordic'>Ignore</Button>
                    <Button type='button' onClick={() => this.handlePasskeySubmit()} className='btn btn-primary btn-sm btn-nordic'>Submit</Button>
                </div>
            </form>
        );
    }

    createNumericalComparisonControls(passkey) {
        return (
            <form className='form-horizontal' onSubmit={event => { this.handleNumericalComparisonMatch(true); event.preventDefault(); }}>
                <div className='form-group'>
                    <label className='col-sm-4'>Passkey</label>
                    <label className='col-sm-7'>{passkey}</label>
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
            <form className='form-horizontal' onSubmit={event => { this.handleOobSubmit(); event.preventDefault(); }}>
                <TextInput
                    label='Out-of-band data'
                    defaultValue=''
                    id='oobInputId'
                    hasFeedback={this.validationFeedbackEnabled}
                    placeholder='Enter out-of-band data'
                    validationState={this.validateOobInput(this.authKeyInput)}
                    onChange={event => this.handlePasskeyChange(event)} />
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
            <form className='form-horizontal' onSubmit={event => { this.handleLescOobSubmit(); event.preventDefault(); }}>
                <TextInput
                    label='Peer random'
                    defaultValue=''
                    id='randomInputId'
                    hasFeedback={this.validationFeedbackEnabled}
                    placeholder='Enter out-of-band data'
                    validationState={this.validateOobInput(this.randomInput)}
                    onChange={event => this.handleRandomChange(event)} />
                <TextInput
                    label='Peer confirm'
                    defaultValue=''
                    id='confirmInputId'
                    hasFeedback={this.validationFeedbackEnabled}
                    placeholder='Enter out-of-band data'
                    validationState={this.validateOobInput(this.confirmInput)}
                    onChange={event => this.handleConfirmChange(event)} />
                <TextInput
                    readOnly
                    label='Own random'
                    id='randomInputId'
                    value={random} />
                <TextInput
                    readOnly
                    label='Own confirm'
                    id='confirmInputId'
                    value={confirm} />
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
