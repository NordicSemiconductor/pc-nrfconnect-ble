/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* eslint react/forbid-prop-types: off */

'use strict';

import PropTypes from 'prop-types';
import React from 'react';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';

import Connector from './Connector';

const WINDOW_WIDTH_OFFSET = 375;
const THROTTLE_TIMEOUT = 100;

class ConnectedDevice extends React.PureComponent {
    constructor(props) {
        super(props);
        this.boundResizeListener = this.resizeThrottler.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onSelect = this.onSelect.bind(this);
    }

    componentDidMount() {
        window.addEventListener('resize', this.boundResizeListener);
        if (this.node) {
            this.boundingRect = this.node.getBoundingClientRect();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.boundResizeListener);
    }

    onResize() {
        if (!this.boundingRect) {
            return;
        }

        const isCurrentlyBelow = window.innerWidth
            < (this.boundingRect.right + WINDOW_WIDTH_OFFSET);
        const hasChanged = isCurrentlyBelow !== this.belowWidthThreshold;

        if (!hasChanged) {
            return;
        }

        this.belowWidthThreshold = isCurrentlyBelow;
        this.forceUpdate();
    }

    onSelect(eventKey) {
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
                console.log('Unknown eventKey received:', eventKey);
        }
    }

    resizeThrottler() {
        if (this.resizeTimeout) {
            return;
        }

        this.resizeTimeout = setTimeout(() => {
            this.resizeTimeout = null;
            this.onResize();
        }, THROTTLE_TIMEOUT);
    }

    render() {
        const {
            device,
            id,
            sourceId,
            layout,
            connectedDevicesNumber,
            isDfuSupported,
            onClickDfu,
        } = this.props;

        const role = device.role === 'central' ? 'Central' : 'Peripheral';

        const style = {
            opacity: device.connected === true ? 1.0 : 0.5,
        };

        const dfuIcon = require('../../resources/dfu_icon.png'); // eslint-disable-line

        return (
            <div
                ref={node => { this.node = node; }}
                id={id}
                className="device standalone"
                style={style}
            >
                <div className="top-bar">
                    <div className="flag-line" />
                </div>

                <div className="device-body text-small">
                    <div>
                        <div className="pull-right">
                            { isDfuSupported
                                && (
                                    <Button
                                        id="dfuButton"
                                        variant="primary"
                                        className="btn-nordic btn-xs"
                                        size="sm"
                                        title="Start Secure DFU"
                                        onClick={onClickDfu}
                                    >
                                        <img src={dfuIcon} className="icon-dfu-button" alt="" />
                                    </Button>
                                )
                            }
                            <Dropdown
                                id="connectionDropDown"
                                onClick={this.onResize}
                                onSelect={this.onSelect}
                            >
                                <Dropdown.Toggle>
                                    <span className="mdi mdi-settings" aria-hidden="true" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item id="updateConnectionMenuItem" eventKey="Update">
                                        Update connection...
                                    </Dropdown.Item>
                                    <Dropdown.Item id="pairMenuItem" eventKey="Pair">
                                        Pair...
                                    </Dropdown.Item>
                                    <Dropdown.Item id="disconnectMenuItem" eventKey="Disconnect">
                                        Disconnect
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        <div className="role-flag pull-right">{role}</div>
                        <strong className="selectable">{device.name ? device.name : '<Unknown>'}</strong>
                    </div>
                    <div className="address-text selectable">{device.address}</div>
                </div>
                <Connector
                    sourceId={sourceId}
                    targetId={id}
                    device={device}
                    layout={layout}
                    connectedDevicesNumber={connectedDevicesNumber}
                />
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
    connectedDevicesNumber: PropTypes.number.isRequired,
    isDfuSupported: PropTypes.bool.isRequired,
    onClickDfu: PropTypes.func.isRequired,
    onDisconnect: PropTypes.func.isRequired,
    onPair: PropTypes.func.isRequired,
    onConnectionParamsUpdate: PropTypes.func.isRequired,
};

export default ConnectedDevice;
