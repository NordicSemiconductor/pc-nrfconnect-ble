'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';
import { getUuidName } from '../utils/uuid_definitions';
import changeCase from 'change-case'

const RSSI_WIDTH_MAX = 20;
const RSSI_WIDTH_HIGH = Math.round(RSSI_WIDTH_MAX * 0.8);
const RSSI_WIDTH_MID = Math.round(RSSI_WIDTH_MAX * 0.6);
const RSSI_WIDTH_LOW = Math.round(RSSI_WIDTH_MAX * 0.4);
const RSSI_WIDTH_MIN = Math.round(RSSI_WIDTH_MAX * 0.2);

export default class DiscoveredDevice extends Component {
    constructor(props) {
        super(props);

        this.currentAdvType = undefined;
        this.currentFlags = undefined;
        this.currentServices = undefined;
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

    rewriter(value) {
        const rewrite_rules = [
            { expr: /BLE_GAP_AD_TYPE_(.*)/, on_match: function(matches) {
                    return changeCase.pascalCase(matches[1]);
                },
            },

        ];

        try {
            for (let rewrite_rule in rewrite_rules) {
                const rule = rewrite_rules[rewrite_rule];

                if (rule.expr.test(value)) {
                    return rule.on_match(rule.expr.exec(value));
                }
            }
        } catch (err) {
            // Log to console.log because we may not have a valid logger if we get here.
            console.log(err);
        }

        // We did not find any rules to rewrite the value, return original value
        return changeCase.camelCase(value);
    };

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

        if (device.flags && device.flags.size > 0) {
            this.currentFlags = device.flags;
        }

        if (device.services && device.services.size > 0) {
            this.currentServices = device.services;
        }

        const adDataDiv =
            <div className='flag-line'>
             {
                device.adData
                .filterNot((value, key) => key.includes('BIT_SERVICE') || key.includes('_FLAGS') || key.includes('LOCAL_NAME'))
                .map((value, key) => {
                    return (
                    <div>
                        <span key={key + '_1'}className='text-smaller inline-block'>{this.rewriter(key)}:</span>
                        <span key={key + '_2'} className='device-flag'>{value} </span>
                    </div>);
                })
            }
            </div>;

        const advTypeDiv = this.currentAdvType ?
            <div className='flag-line'>
                <span className='text-smaller inline-block'>Advertising type:</span>
                <span className='device-flag'>{this.getAdvTypeText(this.currentAdvType)} </span>
            </div>
            : '';

        const flagsDiv = this.currentFlags && this.currentFlags.size > 0 ?
                    <div className='flag-line'>
                        <span className='text-smaller inline-block'>Flags:</span>
                        {
                            this.currentFlags.map(function(flag, index) {
                                return (<span key={index + '_3'} className='device-flag'>{flag}</span>);
                            })
                        }
                    </div>
                    : '';

        const servicesDiv = this.currentServices && this.currentServices.size > 0 ?
                    <div className='flag-line'>
                        <span className='text-smaller inline-block'>Services:</span>
                        {
                            device.services.map(function(service, index) {
                                return (<span key={index + '_4'} className='device-flag'>{getUuidName(service)} </span>);
                            })
                        }
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
                        <span className='icon-signal icon-background' title={device.rssi}/>
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
                    {advTypeDiv}
                    {servicesDiv}
                    {flagsDiv}
                    {adDataDiv}
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
