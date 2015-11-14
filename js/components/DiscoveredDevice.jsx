'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';

export default class DiscoveredDevice extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            device,
            adapterIsConnecting,
            isConnecting,
            onConnect,
            onCancelConnect
        } = this.props;

        let isThisDevice = true;

        if(!device) {
            return (
                <div>
                    <h3 style={{textAlign: 'center'}}>Local dongle</h3>
                </div>
            );
        }

        return (
            <div className="device">
                <div className="top-bar">
                    <div style={{float: 'right'}}>
                        <span style={{width: device.rssi_level + 'px'}} className="icon-signal icon-foreground" />
                        <span className="icon-signal icon-background" />
                    </div>
                    <div className="text-small truncate-text">{device.name || '<Unknown name>'}</div>
                </div>
                <div className="device-body text-small">
                    <div className="discovered-device-address-line">
                        <button onClick={adapterIsConnecting ? () => { onCancelConnect(device) } : () => { onConnect(device) }} className="btn btn-primary btn-xs btn-nordic" disabled={!isConnecting && adapterIsConnecting}>
                            {isConnecting && adapterIsConnecting ? 'Cancel' : 'Connect'} <i className="icon-link"></i>
                        </button>
                        <div className="address-text">
                            {device.address}
                        </div>
                    </div>
                    <div className="flag-line">
                        {
                            device.services.map(function(service, index) {
                                return (<div key={index} className="device-flag">{service}</div>);
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}

DiscoveredDevice.propTypes = {
    device: PropTypes.object.isRequired,
    adapterIsConnecting: PropTypes.bool.isRequired, // If adapter is currently connecting to a device
    isConnecting: PropTypes.bool.isRequired, // If adapter is currently connecting to this device
    onConnect: PropTypes.func.isRequired,
    onCancelConnect: PropTypes.func.isRequired
};
