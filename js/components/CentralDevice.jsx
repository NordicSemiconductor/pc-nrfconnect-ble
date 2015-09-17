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

import React from 'react';

var CentralDevice = React.createClass({
    render: function() {
        var style={
            position: 'relative',
            width: '250px',
            height: '110px'
        };
        return (
            <div id={this.props.id} className="device standalone main-device" style={style}>
                <div className="main-device-table">
                    <div className="icon-wrap"><i className="icon-usb icon-rotate-90"></i></div>
                    <div className="device-body text-small">
                        <div>
                            <strong>{this.props.name}</strong>
                        </div>
                        <div className="address-text">{this.props.address}</div>
                        <div className="role-flag">Central</div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = CentralDevice;
