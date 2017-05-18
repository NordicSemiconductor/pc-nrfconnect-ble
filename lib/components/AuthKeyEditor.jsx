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

/* eslint jsx-a11y/label-has-for: off */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { Button } from 'react-bootstrap';
import TextInput from './input/TextInput';

import { BLEEventType } from '../actions/common';
import { toHexString } from '../utils/stringUtil';

import { Event } from '../reducers/bleEventReducer';

const SUCCESS = 'success';
const ERROR = 'error';

function validatePasskeyInput(value) {
    if ((!value && value !== '')) {
        return ERROR;
    } else if (value.search(/^\d{6}$/) === -1) {
        return ERROR;
    }
    return SUCCESS;
}

function validateOobInput(value) {
    if (!value) {
        return ERROR;
    } else if (value.search(/^[0-9a-fA-F]{32}$/) === -1) {
        return ERROR;
    }
    return SUCCESS;
}

class AuthKeyEditor extends React.PureComponent {
    constructor(props) {
        super(props);

        this.authKeyInput = '';
        this.randomInput = '';
        this.confirmInput = '';

        this.validationFeedbackEnabled = false;
    }

    handlePasskeyChange(event) {
        const { onKeypress } = this.props;
        const e = this.props.event;

        if (e.sendKeypressEnabled === true) {
            const newCount = event.target.value.length - this.authKeyInput.length;

            if (event.target.value.length === 0 && this.authKeyInput.length > 1) {
                onKeypress('BLE_GAP_KP_NOT_TYPE_PASSKEY_CLEAR');
            } else if (newCount > 0) {
                for (let i = 0; i < newCount; i += 1) {
                    onKeypress('BLE_GAP_KP_NOT_TYPE_PASSKEY_DIGIT_IN');
                }
            } else if (newCount < 0) {
                for (let i = 0; i < Math.abs(newCount); i += 1) {
                    onKeypress('BLE_GAP_KP_NOT_TYPE_PASSKEY_DIGIT_OUT');
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

        if (validatePasskeyInput(this.authKeyInput) !== SUCCESS) {
            this.validationFeedbackEnabled = true;
            this.forceUpdate();
            return;
        }

        onAuthKeySubmit('BLE_GAP_AUTH_KEY_TYPE_PASSKEY', this.authKeyInput);
    }

    handleOobSubmit() {
        const { onAuthKeySubmit } = this.props;

        if (validateOobInput(this.authKeyInput) !== SUCCESS) {
            this.validationFeedbackEnabled = true;
            this.forceUpdate();
            return;
        }

        onAuthKeySubmit('BLE_GAP_AUTH_KEY_TYPE_OOB', this.authKeyInput);
    }

    handleLescOobSubmit() {
        const { onLescOobSubmit } = this.props;

        if (validateOobInput(this.confirmInput) !== SUCCESS ||
            validateOobInput(this.randomInput) !== SUCCESS) {
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
            onCancel,
        } = this.props;

        onCancel();
    }

    createPasskeyDisplayControls(
        passkey,
        keypressEnabled,
        keypressStartReceived,
        keypressEndReceived,
        keypressCount,
    ) {
        const digitsCreated = [];
        const digitsTypedIn = [];

        for (let i = 0; i < 6; i += 1) {
            digitsCreated.push(
                <div key={`digitsCreated${i}`} className="col-sm-1">{passkey[i]}</div>,
            );
        }

        const digitsCreatedFormGroup = (
            <div className="form-group">
                <label className="control-label col-sm-4" htmlFor="passkeydigits">Passkey</label>
                <div className="col-sm-8 form-control-static" id="passkeydigits">
                    {digitsCreated}
                </div>
            </div>
        );

        let digitsTypedInFormGroup = '';

        if (keypressEnabled) {
            if (keypressCount !== undefined) {
                const style = {
                    backgroundColor: 'red',
                };
                if (keypressCount > 0) {
                    if (keypressCount === 6) {
                        style.backgroundColor = 'green';
                    } else {
                        style.backgroundColor = 'yellow';
                    }
                }

                for (let i = 0; i < keypressCount; i += 1) {
                    digitsTypedIn.push(
                        <div key={`digitsTyped${i}`} className="col-sm-1" style={style}>*</div>,
                    );
                }

                if (keypressCount < 6) {
                    for (let i = 0; i < 6 - keypressCount; i += 1) {
                        digitsTypedIn.push(
                            <div key={`count${i}`} className="col-sm-1" style={style}>-</div>,
                        );
                    }
                }

                digitsTypedInFormGroup = (
                    <div className="form-group">
                        <label className="control-label col-sm-4" htmlFor="passkeytypedin">
                            Typed
                        </label>
                        <div className="col-sm-8 form-control-static" id="passkeytypedin">
                            {digitsTypedIn}
                        </div>
                    </div>
                );
            }
        }

        return (
            <form
                className="form-horizontal"
                onSubmit={event => { this.handleCancel(); event.preventDefault(); }}
            >
                {digitsCreatedFormGroup}
                {digitsTypedInFormGroup}
                <div className="form-group">
                    <Button
                        type="button"
                        onClick={() => this.handleCancel()}
                        className="btn btn-primary btn-sm btn-nordic"
                    >
                        OK
                    </Button>
                </div>
            </form>
        );
    }

    createPasskeyRequestControls() {
        return (
            <form
                className="form-horizontal"
                onSubmit={event => { this.handlePasskeySubmit(); event.preventDefault(); }}
            >
                <TextInput
                    label="Passkey"
                    defaultValue=""
                    id="passkeyInputId"
                    hasFeedback={this.validationFeedbackEnabled}
                    placeholder="Enter passkey"
                    validationState={validatePasskeyInput(this.authKeyInput)}
                    onChange={event => this.handlePasskeyChange(event)}
                />
                <div className="form-group">
                    <Button
                        type="button"
                        onClick={() => this.handleCancel()}
                        className="btn btn-default btn-sm btn-nordic"
                    >
                        Ignore
                    </Button>
                    <Button
                        type="button"
                        onClick={() => this.handlePasskeySubmit()}
                        className="btn btn-primary btn-sm btn-nordic"
                    >
                        Submit
                    </Button>
                </div>
            </form>
        );
    }

    createNumericalComparisonControls(passkey) {
        return (
            <form
                className="form-horizontal"
                onSubmit={event => {
                    this.handleNumericalComparisonMatch(true); event.preventDefault();
                }}
            >
                <div className="form-group">
                    <label className="col-sm-4">Passkey</label>
                    <label className="col-sm-7">{passkey}</label>
                </div>
                <div className="form-group">
                    <Button
                        type="button"
                        onClick={() => this.handleNumericalComparisonMatch(false)}
                        className="btn btn-default btn-sm btn-nordic"
                    >
                        No match
                    </Button>
                    <Button
                        type="button"
                        onClick={() => this.handleNumericalComparisonMatch(true)}
                        className="btn btn-primary btn-sm btn-nordic"
                    >
                        Match
                    </Button>
                </div>
            </form>
        );
    }

    createLegacyOobRequestControls() {
        return (
            <form
                className="form-horizontal"
                onSubmit={event => { this.handleOobSubmit(); event.preventDefault(); }}
            >
                <TextInput
                    label="Out-of-band data"
                    defaultValue=""
                    id="oobInputId"
                    hasFeedback={this.validationFeedbackEnabled}
                    placeholder="Enter out-of-band data"
                    validationState={validateOobInput(this.authKeyInput)}
                    onChange={event => this.handlePasskeyChange(event)}
                />
                <div className="form-group">
                    <Button
                        type="button"
                        onClick={() => this.handleCancel()}
                        className="btn btn-default btn-sm btn-nordic"
                    >
                        Ignore
                    </Button>
                    <Button
                        type="button"
                        onClick={() => this.handleOobSubmit()}
                        className="btn btn-primary btn-sm btn-nordic"
                    >
                        Submit
                    </Button>
                </div>
            </form>
        );
    }

    createLescOobRequestControls() {
        const { event } = this.props;

        const random = toHexString(event.ownOobData.r).replace(/-/g, '');
        const confirm = toHexString(event.ownOobData.c).replace(/-/g, '');

        return (
            <form
                className="form-horizontal"
                onSubmit={event2 => { this.handleLescOobSubmit(); event2.preventDefault(); }}
            >
                <TextInput
                    label="Peer random"
                    defaultValue=""
                    id="randomInputId"
                    hasFeedback={this.validationFeedbackEnabled}
                    placeholder="Enter out-of-band data"
                    validationState={validateOobInput(this.randomInput)}
                    onChange={event2 => this.handleRandomChange(event2)}
                />
                <TextInput
                    label="Peer confirm"
                    defaultValue=""
                    id="confirmInputId"
                    hasFeedback={this.validationFeedbackEnabled}
                    placeholder="Enter out-of-band data"
                    validationState={validateOobInput(this.confirmInput)}
                    onChange={event2 => this.handleConfirmChange(event2)}
                />
                <TextInput
                    readOnly
                    label="Own random"
                    id="randomInputId"
                    value={random}
                />
                <TextInput
                    readOnly
                    label="Own confirm"
                    id="confirmInputId"
                    value={confirm}
                />
                <div className="form-group">
                    <Button
                        type="button"
                        onClick={() => this.handleCancel()}
                        className="btn btn-default btn-sm btn-nordic"
                    >
                        Ignore
                    </Button>
                    <Button
                        type="button"
                        onClick={() => this.handleLescOobSubmit()}
                        className="btn btn-primary btn-sm btn-nordic"
                    >
                        Submit
                    </Button>
                </div>
            </form>
        );
    }

    render() {
        const { event } = this.props;

        let title = '';
        let controls = '';
        switch (event.type) {
            case BLEEventType.PASSKEY_DISPLAY:
                title = 'Passkey display';
                controls = this.createPasskeyDisplayControls(
                    event.authKeyParams.passkey,
                    event.receiveKeypressEnabled,
                    event.keypressStartReceived,
                    event.keypressEndReceived,
                    event.keypressCount,
                );
                break;
            case BLEEventType.PASSKEY_REQUEST:
                title = 'Passkey request';
                controls = this.createPasskeyRequestControls();
                break;
            case BLEEventType.NUMERICAL_COMPARISON:
                title = 'Numerical comparison';
                controls = this.createNumericalComparisonControls(event.authKeyParams.passkey);
                break;
            case BLEEventType.LEGACY_OOB_REQUEST:
                title = 'Out-of-band data request';
                controls = this.createLegacyOobRequestControls();
                break;
            case BLEEventType.LESC_OOB_REQUEST:
                title = 'Out-of-band data request';
                controls = this.createLescOobRequestControls();
                break;
            default:
        }

        return (
            <div>
                <div className="event-header">
                    <h4>{title}</h4>
                </div>
                {controls}
            </div>
        );
    }
}

AuthKeyEditor.propTypes = {
    event: PropTypes.instanceOf(Event).isRequired,
    onKeypress: PropTypes.func.isRequired,
    onAuthKeySubmit: PropTypes.func.isRequired,
    onNumericalComparisonMatch: PropTypes.func.isRequired,
    onLescOobSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default AuthKeyEditor;
