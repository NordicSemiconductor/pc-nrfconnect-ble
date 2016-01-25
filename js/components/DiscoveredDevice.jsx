'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';
import { getUuidName } from '../utils/uuid_definitions';

const RSSI_WIDTH_MAX = 20;
const RSSI_WIDTH_HIGH = Math.round(RSSI_WIDTH_MAX * 0.8);
const RSSI_WIDTH_MID = Math.round(RSSI_WIDTH_MAX * 0.6);
const RSSI_WIDTH_LOW = Math.round(RSSI_WIDTH_MAX * 0.4);
const RSSI_WIDTH_MIN = Math.round(RSSI_WIDTH_MAX * 0.2);

export default class DiscoveredDevice extends Component {
    constructor(props) {
        super(props);

        this.currentAdvType = undefined;
    }

    getRssiWidth(rssi) {
        let rssiWidth;
        if (rssi < -100) {
            rssiWidth = RSSI_WIDTH_MIN;
        } else if (rssi < -80) {
            rssiWidth = RSSI_WIDTH_LOW;
        } else if (rssi < -60) {
            rssiWidth = RSSI_WIDTH_MID;
        } else if (rssi < -45) {
            rssiWidth = RSSI_WIDTH_HIGH;
        } else {
            rssiWidth = RSSI_WIDTH_MAX;
        }

        return rssiWidth;
    }

    getAdvTypeText(advType) {
        if (!advType) {
            return;
        }

        if (advType.includes('ADV_IND')) {
            return 'Connectable undirected';
        } else if (advType.includes('ADV_DIRECT')) {
            return 'Connectable directed';
        } else if (advType.includes('ADV_SCAN')) {
            return 'Scannable undirected';
        } else if (advType.includes('NONCONN_IND')) {
            return 'Non connectable undirected';
        }

        return;
    }

    render() {
        const {
            device,
            adapterIsConnecting,
            isConnecting,
            onConnect,
            onCancelConnect,
        } = this.props;

        if (device.advType) {
            this.currentAdvType = device.advType;
        }

        const advTypeDiv = this.currentAdvType ?
            <div className='flag-line'>
                <div className='device-flag'>{this.getAdvTypeText(this.currentAdvType)}</div>
            </div>
            : '';

        if (!device) {
            return (
                <div>
                    <h3 style={{textAlign: 'center'}}>Local dongle</h3>
                </div>
            );
        }

        return (
            <div className='device'>
                <div className='top-bar'>
                    <div style={{float: 'right'}}>
                        <span style={{width: this.getRssiWidth(device.rssi) + 'px'}} className='icon-signal icon-foreground' />
                        <span className='icon-signal icon-background' />
                    </div>
                    <div className='text-small truncate-text'>{device.name || '<Unknown name>'}</div>
                </div>
                <div className='device-body text-small'>
                    <div className='discovered-device-address-line'>
                        <button onClick={adapterIsConnecting ? () => { onCancelConnect(device); } : () => { onConnect(device); }} className='btn btn-primary btn-xs btn-nordic' disabled={!isConnecting && adapterIsConnecting}>
                            {isConnecting ? 'Cancel' : 'Connect'} <i className='icon-link'></i>
                        </button>
                        <div className='address-text'>
                            {device.address}
                        </div>
                    </div>
                    <div className='flag-line'>
                        {
                            device.services.map(function(service, index) {
                                return (<div key={index} className='device-flag'>{getUuidName(service)}</div>);
                            })
                        }
                    </div>
                    {advTypeDiv}
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
    onCancelConnect: PropTypes.func.isRequired,
};
