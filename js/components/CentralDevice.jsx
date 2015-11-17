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

'use strict';

import React, { PropTypes, Component } from 'react';

export default class CentralDevice extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            id,
            name,
            address
        } = this.props;

        const style={
            position: 'relative',
            width: '250px',
            height: '102px'
        };

        return (
            <div id={this.props.id} className="device main-device standalone" style={style}>
                <img className="center-block" src="resources/nordic_usb_icon.png" height="41" width="16"/>
                <div className="device-body text-small">
                    <div>
                        <div className="role-flag pull-right">Central</div>
                        <strong>{this.props.name}</strong>
                    </div>
                    <div className="address-text">{address}</div>
                </div>
            </div>
        );
    }
}

CentralDevice.propTypes = {
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
}
