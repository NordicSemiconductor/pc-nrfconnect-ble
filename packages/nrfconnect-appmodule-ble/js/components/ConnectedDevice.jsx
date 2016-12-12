/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
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
