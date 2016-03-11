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

import { Input, Button, DropdownButton, MenuItem } from 'react-bootstrap';

import { BLEEventType } from '../actions/common';

const IO_CAPS_DISPLAY_ONLY = 0;
const IO_CAPS_DISPLAY_YESNO = 1;
const IO_CAPS_KEYBOARD_ONLY = 2;
const IO_CAPS_NONE = 3;
const IO_CAPS_KEYBOARD_DISPLAY = 4;

export class PairingEditor extends Component {
    constructor(props) {
        super(props);

        const { event } = props;
        const { device } = event;

        this.ioCaps = IO_CAPS_KEYBOARD_DISPLAY;
        this.ioCapsTitle = this.keyToIoCapsText(this.ioCaps);
        this.enableLesc = false;
        this.enableMitm = false;
        this.enableOob = false;
        this.enableKeypress = false;
        this.performBonding = false;
    }

    onIoCapsSelect(event, eventKey) {
        this.ioCaps = parseInt(eventKey);
        this.ioCapsTitle = this.keyToIoCapsText(this.ioCaps);
        this.forceUpdate();
    }

    keyToIoCapsText(key) {
        switch (key) {
            case IO_CAPS_DISPLAY_ONLY:
                return 'No keyboard, no display';

            case IO_CAPS_DISPLAY_YESNO:
                return 'Keyboard, no display';

            case IO_CAPS_KEYBOARD_ONLY:
                return 'Display, no keyboard';

            case IO_CAPS_NONE:
                return 'Display and yes no entry';

            case IO_CAPS_KEYBOARD_DISPLAY:
                return 'Keyboard and display';
        }
    }

    handlePair() {
        const {
            event,
            onPair,
        } = this.props;

        // Set minConnectionInterval and maxConnectionInterval to connectionInterval
        // that way we force the connectionInterval on SoftDevice.
        this.minConnectionInterval = this.connectionInterval;
        this.maxConnectionInterval = this.connectionInterval;

        onPair(
            event.device,
            {
                bond: this.performBonding,
                ioCaps: this.ioCaps,
                lesc: this.enableLesc,
                mitm: this.enableMitm,
                oob: this.enableOob,
                keypress: this.enableKeypress,
            }
        );
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
        } = this.props;

        return (
            <div>
                <div className='event-header'>
                    <h4>Pairing</h4>
                </div>
                <form className='form-horizontal'>
                    <div className='form-group'>
                        <label className='control-label col-sm-4'>IO capabilities</label>
                        <div className='col-sm-7'>
                            <DropdownButton title={this.ioCapsTitle} key='ioCapsDropdownKey'
                                id='ioCapsDropdownId' onSelect={(event, eventKey) => this.onIoCapsSelect(event, eventKey)}>
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
                            <Input standalone type='checkbox' label='Enable LE Secure Connection pairing' defaultChecked={this.enableLesc} onChange={event => this.enableLesc = event.target.checked} />
                            <Input standalone type='checkbox' label='Enable MITM protection' defaultChecked={this.enableMitm} onChange={event => this.enableMitm = event.target.checked} />
                            <Input standalone type='checkbox' label='Enable OOB data' defaultChecked={this.enableOob} onChange={event => this.enableOob = event.target.checked} />
                        </div>
                    </div>
                    <div className='form-group'>
                        <label className='control-label col-sm-4'>Keypress notifications</label>
                        <div className='col-sm-7'>
                            <Input standalone type='checkbox' label='Enable keypress notifications' defaultChecked={this.enableKeypress} onChange={event => this.enableKeypress = event.target.checked} />
                        </div>
                    </div>
                    <div className='form-group'>
                        <label className='control-label col-sm-4'>Bonding</label>
                        <div className='col-sm-7'>
                            <Input standalone type='checkbox' label='Perform bonding' defaultChecked={this.performBonding} onChange={event => this.performBonding = event.target.checked} />
                        </div>
                    </div>
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
