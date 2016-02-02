'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';
import { getUuidName } from '../utils/uuid_definitions';
import { toHexString } from '../utils/stringUtil';
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

    onButtonClick(e, device) {
        const {
            onCancelConnect,
            onConnect,
            adapterIsConnecting,
        } = this.props;

        e.stopPropagation();

        if (adapterIsConnecting) {
            onCancelConnect(device);
        } else {
            onConnect(device);
        }
    }

    render() {
        const {
            device,
            isConnecting,
            onToggleExpanded,
            adapterIsConnecting,
        } = this.props;

        let adDataDiv = '';
        let advTypeDiv = '';
        let flagsDiv = '';
        let servicesDiv = '';
        let addressDiv = '';

        if (device.isExpanded) {
            if (device.advType) {
                this.currentAdvType = device.advType;
            }

            if (device.flags && device.flags.size > 0) {
                this.currentFlags = device.flags;
            }

            if (device.services && device.services.size > 0) {
                this.currentServices = device.services;
            }

            adDataDiv =
                <div>
                 {
                    device.adData
                    .filterNot((value, key) => key.includes('BIT_SERVICE') || key.includes('_FLAGS') || key.includes('LOCAL_NAME'))
                    .map((value, key) => {
                        return (
                        <div className='adv-line'>
                            <span key={key + '_1'} className='adv-label'>{this.rewriter(key)}: </span>
                            <span key={key + '_2'} className='adv-value'>{toHexString(value)} </span>
                        </div>);
                    })
                }
                </div>;

            advTypeDiv = this.currentAdvType ?
                <div className='adv-line'>
                    <span className='adv-label'>Advertising type:</span>
                    <span className='adv-value'>{this.getAdvTypeText(this.currentAdvType)} </span>
                </div>
                : '';

            flagsDiv = this.currentFlags && this.currentFlags.size > 0 ?
                        <div className='adv-line'>
                            <span className='adv-label'>Flags:</span>
                            {
                                this.currentFlags.map(function(flag, index) {
                                    return (<span key={index + '_3'} className='adv-value'>{flag}</span>);
                                })
                            }
                        </div>
                        : '';

            servicesDiv = this.currentServices && this.currentServices.size > 0 ?
                        <div className='adv-line'>
                            <span className='adv-label'>Services:</span>
                            {
                                device.services.map(function(service, index) {
                                    return (<span key={index + '_4'} className='adv-value'>{getUuidName(service)} </span>);
                                })
                            }
                        </div>
                        : '';

        }

        addressDiv = <div className='address-text'>
                        {device.address}
                    </div>;

        const dirIcon = device.isExpanded ? 'icon-down-dir' : 'icon-right-dir'

        if (!device) {
            return (
                <div>
                    <h3 style={{textAlign: 'center'}}>Local dongle</h3>
                </div>
            );
        }

        return (
            <div className='device' onClick={e => onToggleExpanded(device.address)} >
                <div className='top-bar'>
                    <div style={{float: 'right'}}>
                        <span style={{width: this.getRssiWidth(device.rssi) + 'px'}} className='icon-signal icon-foreground' />
                        <span className='icon-signal icon-background' title={device.rssi + ' dBm'}/>
                    </div>
                    <div className='device-name'>{device.name || '<Unknown name>'}</div>
                </div>
                <div className='discovered-device-body text-small'>
                    <div className='discovered-device-address-line'>
                        <button onClick={e => this.onButtonClick(e, device)} className='btn btn-primary btn-xs btn-nordic' disabled={!isConnecting && adapterIsConnecting}>
                            {isConnecting ? 'Cancel' : 'Connect'} <i className='icon-link'></i>
                        </button>
                        {addressDiv}
                    </div>
                    <div>
                        <span className={'adv-details'}><i className={dirIcon}/>Advertising details</span>
                        {advTypeDiv}
                        {servicesDiv}
                        {flagsDiv}
                        {adDataDiv}
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
    onCancelConnect: PropTypes.func.isRequired,
};
