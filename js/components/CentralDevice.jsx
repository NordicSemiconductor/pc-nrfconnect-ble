'use strict';

import React from 'react';

var CentralDevice = React.createClass({
    render: function() {
        var style={
            position: 'relative', 
            width: '250px',
            top: this.props.position.y + 'px',
            left: this.props.position.x + 'px'
        };
        return (
            <div id={this.props.id} className="device standalone main-device" style={style}>
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