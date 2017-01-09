/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

 'use strict';

import React, { PropTypes } from 'react';
import { getUuidName } from '../utils/uuid_definitions';
import { toHexString } from '../utils/stringUtil';
import changeCase from 'change-case';

const RSSI_WIDTH_MAX = 20;
const RSSI_WIDTH_HIGH = Math.round(RSSI_WIDTH_MAX * 0.8);
const RSSI_WIDTH_MID = Math.round(RSSI_WIDTH_MAX * 0.6);
const RSSI_WIDTH_LOW = Math.round(RSSI_WIDTH_MAX * 0.4);
const RSSI_WIDTH_MIN = Math.round(RSSI_WIDTH_MAX * 0.2);

export default class DiscoveredDevice extends React.PureComponent {
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
            { expr: /BLE_GAP_AD_TYPE_(.*)/, on_match: function (matches) {
                    return changeCase.pascalCase(matches[1]);
                },
            },
            { expr: /BLE_GAP_ADDR_TYPE_(.*)/, on_match: function (matches) {
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
    }

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
        let addressTypeDiv = '';

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

            addressTypeDiv =
                <div className='adv-line'>
                    <span className='adv-label'>Address type: </span>
                    <span className='adv-value'>{this.rewriter(device.addressType)} </span>
                </div>;

            flagsDiv = this.currentFlags && this.currentFlags.size > 0 ?
                        <div className='adv-line'>
                            <span className='adv-label'>Flags:</span>
                            {
                                this.currentFlags.map(function (flag, index) {
                                    return (<span key={index + '_3'} className='adv-value'>{flag}</span>);
                                })
                            }
                        </div>
                        : '';

            servicesDiv = this.currentServices && this.currentServices.size > 0 ?
                        <div className='adv-line'>
                            <span className='adv-label'>Services:</span>
                            {
                                device.services.map(function (service, index) {
                                    return (<span key={index + '_4'} className='adv-value'>{getUuidName(service)} </span>);
                                })
                            }
                        </div>
                        : '';

        }

        addressDiv = <div className='address-text'>
                        {device.address}
                    </div>;

        const dirIcon = device.isExpanded ? 'icon-down-dir' : 'icon-right-dir';

        if (!device) {
            return (
                <div>
                    <h3 style={{ textAlign: 'center' }}>Local dongle</h3>
                </div>
            );
        }

        return (
            <div className='device' onClick={e => onToggleExpanded(device.address)} >
                <div className='top-bar'>
                    <div style={{ float: 'right' }}>
                        <span style={{ width: this.getRssiWidth(device.rssi) + 'px' }} className='icon-signal icon-foreground' />
                        <span className='icon-signal icon-background' title={device.rssi + ' dBm'}/>
                    </div>
                    <div className='device-name'>{device.name || '<Unknown name>'}</div>
                </div>
                <div className='discovered-device-body text-small'>
                    <div className='discovered-device-address-line'>
                        <button onClick={e => this.onButtonClick(e, device)} className='btn btn-primary btn-xs btn-nordic' disabled={(!isConnecting && adapterIsConnecting) || device.connected}>
                            {isConnecting ? 'Cancel' : 'Connect'} <i className='icon-link'></i>
                        </button>
                        {addressDiv}
                    </div>
                    <div>
                        <span className={'adv-details'}><i className={dirIcon}/>Details</span>
                        {addressTypeDiv}
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
