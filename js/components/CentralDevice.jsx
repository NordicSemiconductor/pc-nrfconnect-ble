'use strict';

import React from 'react';

var CentralDevice = React.createClass({
    render: function() {
        return (
            <div className="device standalone main-device">
                <div className="main-device-table">
                    <div className="icon-wrap"><i className="icon-usb icon-rotate-270"></i></div>
                    <div className="device-body text-small">
                        <div>
                            <strong>{this.props.name}</strong>
                        </div>
                        <div>{this.props.address}</div>
                        <div className="role-flag">Central</div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = CentralDevice;