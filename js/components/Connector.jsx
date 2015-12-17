/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
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

 /*jslint browser:true */

 'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';
import { Popover, OverlayTrigger } from 'react-bootstrap';

import layoutStrategies from '../common/layoutStrategies';

export class ConnectionSetup extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            device,
        } = this.props;

        const securityLevelText = (device.securityMode1Levels === 2) ? 'Encrypted link (unauthenticated)'
            : 'Unencrypted link';

        const iconClass = (device.securityMode1Levels && device.securityMode1Levels) > 1 ? 'icon-lock'
            : 'icon-lock-open';

        return (
            <div className='connection-parameters'>
                <span className='col-sm-8 col-xs-8 connection-parameter-label'>Connection Interval</span>
                <span className='col-sm-4 col-xs-4 connection-parameter-value'>{device.maxConnectionInterval} ms</span>
                <span className='col-sm-8 col-xs-8 connection-parameter-label'>Slave latency</span>
                <span className='col-sm-4 col-xs-4 connection-parameter-value'>{device.slaveLatency} ms</span>
                <span className='col-sm-8 col-xs-8 connection-parameter-label'>Timeout</span>
                <span className='col-sm-4 col-xs-4 connection-parameter-value'>{device.connectionSupervisionTimeout} ms</span>
                <span className={'connection-security ' + iconClass}> {securityLevelText}</span>
            </div>
        );
    }
}

ConnectionSetup.propTypes = {
    device: PropTypes.object.isRequired,
};

export class ConnectionOverlay extends Component {
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

        const iconClass = (device.securityMode1Levels && device.securityMode1Levels) > 1 ? 'icon-lock'
            : 'icon-lock-open';

        return (
            <div className='connection-info-button' style={style}>
                <OverlayTrigger ref='overlayTrigger' trigger={['click', 'focus']} rootClose={true} placement='left' overlay={<Popover id='pover' title='Connection Information'><ConnectionSetup device={device} closePopover={this._closeme}/></Popover>}>
                    <span style={{fontSize: '15px'}}>
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

export class Connector extends Component {
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
            result.push(<line stroke='black' strokeWidth='3' strokeLinecap='square' key={i} x1={lineCoordinates[i].x} y1={lineCoordinates[i].y} x2={lineCoordinates[i + 1].x} y2={lineCoordinates[i + 1].y}/>);
        }

        return result;
    }

    _getConnectionOverlay(lineCoordinates) {
        const {
            device
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

        return (<ConnectionOverlay style={{position: 'absolute', left: posX - 12, top: posY - 12}} device={device}/>);
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
                    <svg style={{position: 'absolute', left: connectorBox.left, top: connectorBox.top, width: connectorBox.width, height: connectorBox.height}}>
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
