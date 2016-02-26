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

export class PairingEditor extends Component {
    constructor(props) {
        super(props);

        const { event } = props;
        const { device } = event;
    }

    render() {
        const {
            event,
        } = this.props;

        return (
            <div>
                <div>
                    <h4>Pairing</h4>
                </div>
                <form className='form-horizontal'>
                    <div className='form-group'>
                        <label>IO capabilities</label>
                        <DropdownButton title='IO capabilities' key='iocapdd' id='iocapdd'>
                            <MenuItem eventKey='noKeybNoDisp'>No keyboard, no display</MenuItem>
                            <MenuItem eventKey='keybNoDisp'>Keyboard, no display</MenuItem>
                            <MenuItem eventKey='dispNoKeyb'>Display, no keyboard</MenuItem>
                            <MenuItem eventKey='keybAndDisp'>Keyboard and display</MenuItem>
                        </DropdownButton>
                    </div>
                    <div className='form-group'>
                        <label>Authentication</label>
                        <DropdownButton title='Authentication' key='authdd' id='authdd'>
                            <MenuItem eventKey='noAuth'>No authentication required</MenuItem>
                            <MenuItem eventKey='passkey'>Passkey required</MenuItem>
                            <MenuItem eventKey='oob'>OOB required</MenuItem>
                        </DropdownButton>
                    </div>
                    <div className='form-group'>
                        <label>Bonding</label>
                        <Input type='checkbox' label='Perform bonding' />
                    </div>
                </form>
            </div>
        );
    }
}

PairingEditor.propTypes = {
    event: PropTypes.object.isRequired,
};
