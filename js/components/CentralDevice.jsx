/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
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

 /*jslint browser:true */

'use strict';

import React, { PropTypes, Component } from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';

export default class CentralDevice extends Component {
    constructor(props) {
        super(props);
    }

    _onSelect(event, eventKey) {
        const {
            onToggleAdvertising,
            onAdvertisingSetup,
        } = this.props;

        switch (eventKey) {
            case 'ToggleAdvertising':
                console.log('Toggle advertising');
                this.props.onToggleAdvertising();
                break;
            case 'AdvertisingSetup':
                console.log('AdvertisingSetup');
                this.props.onShowDialog();
                break;
            default:
                console.log('Unknown eventKey received: ' + eventKey);

        }
    }

    render() {
        const {
            id,
            name,
            address,
            advertising,
        } = this.props;

        const style = {
            position: 'relative',
            width: '250px',
            height: '102px',
        };

        const advertisingText = advertising ? 'Stop advertising' : 'Start advertising';

        return (
            <div id={id} className="device main-device standalone" style={style}>
                <img className="center-block" src="resources/nordic_usb_icon.png" height="41" width="16"/>
                <div className="device-body text-small">
                    <div className="pull-right">
                        <Dropdown id="connectionDropDown" onSelect={(event, eventKey) => { this._onSelect(event, eventKey); }}>
                            <Dropdown.Toggle noCaret>
                                <span className="icon-cog" aria-hidden="true" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <MenuItem eventKey="ToggleAdvertising">{advertisingText}</MenuItem>
                                <MenuItem eventKey="AdvertisingSetup">Advertising setup...</MenuItem>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    <div>
                        <div className="role-flag pull-right">Adapter</div>
                        <strong>{name}</strong>
                    </div>
                    <div className="address-text">{address}</div>
                </div>
            </div>
        );
    }
}

CentralDevice.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    advertising: PropTypes.bool.isRequired,
    onToggleAdvertising: PropTypes.func.isRequired,
    onShowDialog: PropTypes.func.isRequired,
};
