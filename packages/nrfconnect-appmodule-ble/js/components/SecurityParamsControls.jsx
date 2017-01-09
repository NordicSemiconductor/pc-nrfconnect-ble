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

import { DropdownButton, MenuItem, Checkbox } from 'react-bootstrap';

const IO_CAPS_DISPLAY_ONLY = 0;
const IO_CAPS_DISPLAY_YESNO = 1;
const IO_CAPS_KEYBOARD_ONLY = 2;
const IO_CAPS_NONE = 3;
const IO_CAPS_KEYBOARD_DISPLAY = 4;

export class SecurityParamsControls extends React.PureComponent {
    constructor(props) {
        super(props);

        this.ioCaps = props.securityParams.io_caps;
        this.enableLesc = props.securityParams.lesc;
        this.enableMitm = props.securityParams.mitm;
        this.enableOob = props.securityParams.oob;
        this.enableKeypress = props.securityParams.keypress;
        this.performBonding = props.securityParams.bond;

        this.ioCapsTitle = this.keyToIoCapsText(this.ioCaps);
    }

    onIoCapsSelect(event, eventKey) {
        this.ioCaps = parseInt(eventKey);
        this.ioCapsTitle = this.keyToIoCapsText(this.ioCaps);
        this.handleChange();
        this.forceUpdate();
    }

    keyToIoCapsText(key) {
        switch (key) {
            case IO_CAPS_DISPLAY_ONLY:
                return 'Display, no keyboard';

            case IO_CAPS_DISPLAY_YESNO:
                return 'Display and yes no entry';

            case IO_CAPS_KEYBOARD_ONLY:
                return 'Keyboard, no display';

            case IO_CAPS_NONE:
                return 'No keyboard, no display';

            case IO_CAPS_KEYBOARD_DISPLAY:
                return 'Keyboard and display';
        }
    }

    handleCheckboxChange(variableName, checked) {
        this[variableName] = checked;
        this.handleChange();
    }

    handleChange() {
        const newSecParams = {
            io_caps: this.ioCaps,
            lesc: this.enableLesc,
            mitm: this.enableMitm,
            oob: this.enableOob,
            keypress: this.enableKeypress,
            bond: this.performBonding,
        };

        this.props.onChange(newSecParams);
    }

    render() {
        return (
            <div>
                <div className='form-group'>
                    <label className='control-label col-sm-4'>IO capabilities</label>
                    <div className='col-sm-7'>
                        <DropdownButton title={this.ioCapsTitle} key='ioCapsDropdownKey'
                            id='ioCapsDropdownId' onSelect={(eventKey, event) => this.onIoCapsSelect(event, eventKey)}>
                            <MenuItem eventKey={IO_CAPS_DISPLAY_ONLY}>{this.keyToIoCapsText(IO_CAPS_DISPLAY_ONLY)}</MenuItem>
                            <MenuItem eventKey={IO_CAPS_DISPLAY_YESNO}>{this.keyToIoCapsText(IO_CAPS_DISPLAY_YESNO)}</MenuItem>
                            <MenuItem eventKey={IO_CAPS_KEYBOARD_ONLY}>{this.keyToIoCapsText(IO_CAPS_KEYBOARD_ONLY)}</MenuItem>
                            <MenuItem eventKey={IO_CAPS_NONE}>{this.keyToIoCapsText(IO_CAPS_NONE)}</MenuItem>
                            <MenuItem eventKey={IO_CAPS_KEYBOARD_DISPLAY}>{this.keyToIoCapsText(IO_CAPS_KEYBOARD_DISPLAY)}</MenuItem>
                        </DropdownButton>
                    </div>
                </div>
                <div className='form-group'>
                    <label className='control-label col-sm-4'>Authentication</label>
                    <div className='col-sm-7'>
                        <Checkbox defaultChecked={this.enableLesc}
                            onChange={event => this.handleCheckboxChange('enableLesc', event.target.checked)}>
                            Enable LE Secure Connection pairing
                        </Checkbox>
                        <Checkbox defaultChecked={this.enableMitm}
                            onChange={event => this.handleCheckboxChange('enableMitm', event.target.checked)}>
                            Enable MITM protection
                        </Checkbox>
                        <Checkbox defaultChecked={this.enableOob}
                            onChange={event => this.handleCheckboxChange('enableOob', event.target.checked)}>
                            Enable OOB data
                        </Checkbox>
                    </div>
                </div>
                <div className='form-group'>
                    <label className='control-label col-sm-4'>Keypress notifications</label>
                    <div className='col-sm-7'>
                        <Checkbox defaultChecked={this.enableKeypress}
                            onChange={event => this.handleCheckboxChange('enableKeypress', event.target.checked)}>
                            Enable keypress notifications
                        </Checkbox>
                    </div>
                </div>
                <div className='form-group'>
                    <label className='control-label col-sm-4'>Bonding</label>
                    <div className='col-sm-7'>
                        <Checkbox
                            defaultChecked={this.performBonding}
                            onChange={event => this.handleCheckboxChange('performBonding', event.target.checked)}>
                            Perform bonding
                        </Checkbox>
                    </div>
                </div>
            </div>
        );
    }
}

SecurityParamsControls.propTypes = {
    onChange: PropTypes.func.isRequired,
    securityParams: PropTypes.object,
};
