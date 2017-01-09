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
import ReactDOM from 'react-dom';

import { Dropdown, MenuItem, Button } from 'react-bootstrap';

import { Connector } from './Connector';

import dfuIcon from '../../resources/dfu_icon.png';

const WINDOW_WIDTH_OFFSET = 375;
const THROTTLE_TIMEOUT = 100;

export default class ConnectedDevice extends React.PureComponent {
    constructor(props) {
        super(props);
        this.boundResizeListener = this._resizeThrottler.bind(this);
    }

    componentDidMount() {
        window.addEventListener('resize', this.boundResizeListener);
        const domNode = ReactDOM.findDOMNode(this);
        if (domNode) {
            this.boundingRect = domNode.getBoundingClientRect();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.boundResizeListener);
    }

    _resizeThrottler() {
        if (this.resizeTimeout) {
            return;
        }

        this.resizeTimeout = setTimeout(() => {
            this.resizeTimeout = null;
            this._onResize();
        }, THROTTLE_TIMEOUT);
    }

    _onResize() {
        if (!this.boundingRect) {
            return;
        }

        const isCurrentlyBelow = window.innerWidth < (this.boundingRect.right + WINDOW_WIDTH_OFFSET);
        const hasChanged = isCurrentlyBelow !== this.belowWidthThreshold;

        if (!hasChanged) {
            return;
        }

        this.belowWidthThreshold = isCurrentlyBelow;
        this.forceUpdate();
    }

    _onSelect(event, eventKey) {
        const {
            onDisconnect,
            onPair,
            onConnectionParamsUpdate,
            device,
        } = this.props;

        switch (eventKey) {
            case 'Disconnect':
                onDisconnect();
                break;
            case 'Update':
                onConnectionParamsUpdate(device);
                break;
            case 'Pair':
                onPair();
                break;
            default:
                console.log('Unknown eventKey received: ' + eventKey);
        }
    }

    render() {
        const {
            device,
            id,
            sourceId,
            layout,
            isDfuSupported,
        } = this.props;

        const role = device.role === 'central' ? 'Central' : 'Peripheral';

        const style = {
            opacity: device.connected === true ? 1.0 : 0.5,
        };

        const pullRight = this.belowWidthThreshold ? true : false;

        return (
            <div id={id} className='device standalone' style={style}>
                <div className='top-bar'>
                    <div className='flag-line'></div>
                </div>

                <div className='device-body text-small' >
                    <div>
                        <div className='pull-right'>
                            {
                                isDfuSupported ?
                                    <Button id='dfuButton' bsStyle='primary' className='btn-nordic btn-xs' title="Start Secure DFU" onClick={this.props.onClickDfu}>
                                        <img src={dfuIcon} className="icon-dfu-button" />
                                    </Button> : null
                            }
                            <Dropdown pullRight={pullRight} id='connectionDropDown' onClick={() => this._onResize()} onSelect={(eventKey, event) => { this._onSelect(event, eventKey); }}>
                                <Dropdown.Toggle noCaret>
                                    <span className='icon-cog' aria-hidden='true' />
                                </Dropdown.Toggle>
                                <Dropdown.Menu pullRight={pullRight}>
                                    <MenuItem id='updateConnectionMenuItem' eventKey='Update'>Update connection...</MenuItem>
                                    <MenuItem id='pairMenuItem' eventKey='Pair'>Pair...</MenuItem>
                                    <MenuItem id='disconnectMenuItem' eventKey='Disconnect'>Disconnect</MenuItem>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        <div className='role-flag pull-right'>{role}</div>
                        <strong>{device.name ? device.name : '<Unknown>'}</strong>
                    </div>
                    <div className='address-text'>{device.address}</div>
                </div>
                <Connector sourceId={sourceId} targetId={id} device={device} layout={layout} />
            </div>
        );

        // TODO: later on, we must implement a transition of data from device discovery flags
        // TODO: to connected devices.
        //
        // <div className='flag-line'>
        //     {device.services.map((service, index) => {
        //         return (<div key={index} className='device-flag'>{service}</div>);
        //     })}
        // </div>
    }
}

ConnectedDevice.propTypes = {
    id: PropTypes.string.isRequired,
    device: PropTypes.object.isRequired,
    sourceId: PropTypes.string.isRequired,
    layout: PropTypes.string.isRequired,
    isDfuSupported: PropTypes.bool,
    onClickDfu: PropTypes.func,
    onDisconnect: PropTypes.func.isRequired,
    onPair: PropTypes.func.isRequired,
    onConnectionParamsUpdate: PropTypes.func.isRequired,
};
