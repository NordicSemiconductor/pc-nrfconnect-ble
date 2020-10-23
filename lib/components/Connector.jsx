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
/* eslint react/no-multi-comp: off */
/* eslint-disable max-classes-per-file */

'use strict';

import PropTypes from 'prop-types';
import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

import layoutStrategies from '../common/layoutStrategies';

const ConnectionSetup = props => {
    const { device } = props;

    let securityLevelText;
    switch (device.securityLevel) {
        case 2:
            securityLevelText = 'Unauthenticated encrypted link';
            break;
        case 3:
            securityLevelText = 'Authenticated encrypted link';
            break;
        case 4:
            securityLevelText = 'LESC authenticated encrypted link';
            break;
        default:
            securityLevelText = 'Unencrypted link';
    }

    const iconClass =
        device.securityLevel && device.securityLevel > 1
            ? 'mdi mdi-lock'
            : 'mdi mdi-lock-open-outline';
    const iconBondedClass = device.bonded
        ? 'mdi mdi-link-variant'
        : 'mdi mdi-link-variant-off';
    const bondedText = device.bonded ? 'Bonded' : 'Not bonded';

    return (
        <Container className="connection-parameters">
            <Row>
                <Col sm={8} xs={8} className="connection-parameter-label">
                    Connection Interval
                </Col>
                <Col sm={4} xs={4} className="connection-parameter-value">
                    {device.maxConnectionInterval} ms
                </Col>
            </Row>
            <Row>
                <Col sm={8} xs={8} className="connection-parameter-label">
                    Slave latency
                </Col>
                <Col sm={4} xs={4} className="connection-parameter-value">
                    {device.slaveLatency} ms
                </Col>
            </Row>
            <Row>
                <Col sm={6} xs={6} className="connection-parameter-label">
                    Timeout
                </Col>
                <Col sm={6} xs={6} className="connection-parameter-value">
                    {device.connectionSupervisionTimeout} ms
                </Col>
            </Row>
            <Row>
                <Col sm={8} xs={8} className={`top-spacer ${iconBondedClass}`}>
                    {bondedText}
                </Col>
                <Col sm={4} xs={4} className="connection-parameter-value" />
            </Row>
            <Row>
                <Col
                    sm={12}
                    xs={12}
                    className={`connection-security ${iconClass}`}
                >
                    {securityLevelText}
                </Col>
            </Row>
        </Container>
    );
};

ConnectionSetup.propTypes = {
    device: PropTypes.object.isRequired,
};

class ConnectionOverlay extends React.PureComponent {
    constructor(props) {
        super(props);
        this.closeme = this.closeme.bind(this);
    }

    closeme() {
        this.overlayTrigger.hide();
    }

    render() {
        const { style, device } = this.props;

        const iconClass =
            device.securityLevel && device.securityLevel > 1
                ? 'mdi mdi-lock'
                : 'mdi mdi-lock-open-outline';

        return (
            <div
                className="connection-info-button btn btn-xs btn-link"
                style={style}
            >
                <OverlayTrigger
                    ref={overlayTrigger => {
                        this.overlayTrigger = overlayTrigger;
                    }}
                    trigger={['click', 'focus', 'hover']}
                    rootClose
                    placement="left"
                    overlay={
                        <Popover
                            className="connection-info-popover"
                            title="Connection Information"
                        >
                            <ConnectionSetup
                                device={device}
                                closePopover={this.closeme}
                            />
                        </Popover>
                    }
                >
                    <span>
                        <i className={`icon-encircled ${iconClass}`} />
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

function generateLines(lineCoordinates) {
    const result = [];

    for (let i = 0; i < lineCoordinates.length - 1; i += 1) {
        result.push(
            <line
                stroke="black"
                strokeWidth="3"
                strokeLinecap="square"
                key={i}
                x1={lineCoordinates[i].x}
                y1={lineCoordinates[i].y}
                x2={lineCoordinates[i + 1].x}
                y2={lineCoordinates[i + 1].y}
            />
        );
    }

    return result;
}

class Connector extends React.PureComponent {
    componentDidMount() {
        this.onUpdate();
    }

    componentDidUpdate() {
        this.onUpdate();
    }

    // To be able to draw the line between two components they have to be in the browser DOM
    // At first render they are not rendered, therefore we have to do an additional rendering
    // after the components are in the browser DOM everytime when it is updated.
    /* eslint react/no-unused-state: off */
    onUpdate() {
        const { connectedDevicesNumber } = this.props;
        this.setState({
            connectedDevicesNumber,
        });
    }

    getConnectionOverlay(lineCoordinates) {
        const { device, targetId } = this.props;

        if (lineCoordinates.length < 2) {
            return null;
        }

        const pointA = lineCoordinates[lineCoordinates.length - 2];
        const pointB = lineCoordinates[lineCoordinates.length - 1];

        let posX = (pointA.x - pointB.x) / 2;
        let posY = (pointA.y - pointB.y) / 2;

        const targetElement = document.getElementById(targetId);
        const targetRect = targetElement.getBoundingClientRect();

        if (posX === 0) {
            posX = targetRect.width / 2;
        }

        if (posY === 0) {
            posY = targetRect.height / 2;
        }

        return (
            <ConnectionOverlay
                style={{
                    position: 'absolute',
                    left: posX - 17,
                    top: posY - 14,
                }}
                device={device}
            />
        );
    }

    render() {
        const { sourceId, targetId, layout } = this.props;
        const sourceElement = document.getElementById(sourceId);
        const targetElement = document.getElementById(targetId);

        if (!sourceElement || !targetElement) {
            return <div />;
        }

        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        const layoutInfo = layoutStrategies(layout)(sourceRect, targetRect, 3);
        const connectorBox = layoutInfo.boundingBox;
        const lines = generateLines(layoutInfo.lineCoordinates);
        const connectionInfoOverlay = this.getConnectionOverlay(
            layoutInfo.lineCoordinates
        );

        return (
            <div className="connector">
                <svg
                    style={{
                        position: 'absolute',
                        left: connectorBox.left,
                        top: connectorBox.top,
                        width: connectorBox.width,
                        height: connectorBox.height,
                    }}
                >
                    {lines}
                </svg>
                {connectionInfoOverlay}
            </div>
        );
    }
}

Connector.propTypes = {
    device: PropTypes.object.isRequired,
    sourceId: PropTypes.string.isRequired,
    targetId: PropTypes.string.isRequired,
    layout: PropTypes.string.isRequired,
    connectedDevicesNumber: PropTypes.number.isRequired,
};

export default Connector;
