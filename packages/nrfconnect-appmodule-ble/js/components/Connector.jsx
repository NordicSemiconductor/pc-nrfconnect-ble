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
import { Popover, OverlayTrigger } from 'react-bootstrap';

import layoutStrategies from '../common/layoutStrategies';

export class ConnectionSetup extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            device,
        } = this.props;

        const securityLevelText = (device.securityLevel === 2) ? 'Unauthenticated encrypted link'
            : (device.securityLevel === 3) ? 'Authenticated encrypted link'
            : (device.securityLevel === 4) ? 'LESC authenticated encrypted link'
            : 'Unencrypted link';

        const iconClass = (device.securityLevel && (device.securityLevel > 1)) ? 'icon-lock' : 'icon-lock-open';
        const iconBondedClass = device.bonded ? 'icon-link' : 'icon-unlink';
        const bondedText = device.bonded ? 'Bonded' : 'Not bonded';

        return (
            <div className='connection-parameters'>
                <span className='col-sm-8 col-xs-8 connection-parameter-label'>Connection Interval</span>
                <span className='col-sm-4 col-xs-4 connection-parameter-value'>{device.maxConnectionInterval} ms</span>
                <span className='col-sm-8 col-xs-8 connection-parameter-label'>Slave latency</span>
                <span className='col-sm-4 col-xs-4 connection-parameter-value'>{device.slaveLatency} ms</span>
                <span className='col-sm-8 col-xs-8 connection-parameter-label'>Timeout</span>
                <span className='col-sm-4 col-xs-4 connection-parameter-value'>{device.connectionSupervisionTimeout} ms</span>

                <span className={'col-sm-8 col-xs-8 top-spacer ' + iconBondedClass}> {bondedText}</span>
                <span className='col-sm-4 col-xs-4 connection-parameter-value'></span>
                <span className={'connection-security ' + iconClass}> {securityLevelText}</span>
            </div>
        );
    }
}

ConnectionSetup.propTypes = {
    device: PropTypes.object.isRequired,
};

export class ConnectionOverlay extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    _closeme() {
        this.refs.overlayTrigger.hide();
    }

    render() {
        const {
            style,
            device,
        } = this.props;

        const iconClass = (device.securityLevel && (device.securityLevel > 1)) ? 'icon-lock'
            : 'icon-lock-open';

        return (
            <div className='connection-info-button btn btn-xs btn-link' style={style}>
                <OverlayTrigger ref='overlayTrigger' trigger={['click', 'focus', 'hover']} rootClose={true} placement='left'
                    overlay={
                        <Popover id='pover' title='Connection Information'>
                            <ConnectionSetup device={device} closePopover={this._closeme}/>
                        </Popover>
                    }>
                    <span>
                        <i className={'icon-encircled ' + iconClass}></i>
                    </span>
                </OverlayTrigger>
            </div>
        );
    }
}

ConnectionOverlay.propTypes = {
    style: PropTypes.object.isRequired,
    device: PropTypes.object.isRequired,
};

export class Connector extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // To be able to draw the line between two component they have be in the browser DOM
        // At first render they are not rendered, therefore we have to do an additional rendering
        // after the componenets are in the brower DOM.
        this.forceUpdate();
    }

    _generateLines(lineCoordinates) {
        var result = [];

        for (let i = 0; i < lineCoordinates.length - 1; i++) {
            result.push(<line stroke='black' strokeWidth='3' strokeLinecap='square' key={i}
                x1={lineCoordinates[i].x}
                y1={lineCoordinates[i].y}
                x2={lineCoordinates[i + 1].x}
                y2={lineCoordinates[i + 1].y}
                />);
        }

        return result;
    }

    _getConnectionOverlay(lineCoordinates) {
        const {
            device,
        } = this.props;

        if (lineCoordinates.length < 2) {
            return;
        }

        const pointA = lineCoordinates[lineCoordinates.length - 2];
        const pointB = lineCoordinates[lineCoordinates.length - 1];

        let posX = (pointA.x - pointB.x) / 2;
        let posY = (pointA.y - pointB.y) / 2;

        const targetElement = document.getElementById(this.props.targetId);
        const targetRect = targetElement.getBoundingClientRect();

        if (posX === 0) {
            posX = targetRect.width / 2;
        }

        if (posY === 0) {
            posY = targetRect.height / 2;
        }

        return (<ConnectionOverlay style={{ position: 'absolute', left: posX - 14, top: posY - 14 }} device={device}/>);
    }

    render() {
        const {
            sourceId,
            targetId,
            layout,
        } = this.props;

        const sourceElement = document.getElementById(sourceId);
        const targetElement = document.getElementById(targetId);

        if (!sourceElement || !targetElement) {
            return (<div/>);
        }

        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        const layoutInfo = layoutStrategies(layout)(sourceRect, targetRect, 3);
        const connectorBox = layoutInfo.boundingBox;
        const lines = this._generateLines(layoutInfo.lineCoordinates);
        const connectionInfoOverlay = this._getConnectionOverlay(layoutInfo.lineCoordinates);

        return (<div className='connector'>
                    <svg style={{ position: 'absolute', left: connectorBox.left, top: connectorBox.top, width: connectorBox.width, height: connectorBox.height }}>
                        {lines}
                    </svg>
                    {connectionInfoOverlay}
                </div>);
    }
}

Connector.propTypes = {
    device: PropTypes.object.isRequired,
    sourceId: PropTypes.string.isRequired,
    targetId: PropTypes.string.isRequired,
    layout: PropTypes.string.isRequired,
};
