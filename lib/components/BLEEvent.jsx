/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { BLEEventState, BLEEventType } from '../actions/common';
import { Event } from '../reducers/bleEventReducer';
import CountdownTimer from './CountdownTimer';

const EVENT_TIMEOUT_SECONDS = 30;

function onExpandAreaClick() {
    console.log('TODO: implement me! I did not exist earlier either...');
}

class BLEEvent extends React.PureComponent {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(e) {
        e.stopPropagation();

        const { onSelected, event } = this.props;

        if (onSelected) {
            onSelected(event.id);
        }
    }

    getEventInfo() {
        const {
            event: { type: eventType },
        } = this.props;

        switch (eventType) {
            case BLEEventType.USER_INITIATED_CONNECTION_UPDATE:
            case BLEEventType.PEER_CENTRAL_INITIATED_CONNECTION_UPDATE:
                return {
                    name: 'Connection update',
                    icon: (
                        <span className="mdi mdi-link-variant">
                            <span className="mdi mdi-arrow-down" />
                        </span>
                    ),
                };
            case BLEEventType.PEER_PERIPHERAL_INITIATED_CONNECTION_UPDATE:
                return {
                    name: 'Connection update request',
                    icon: (
                        <span className="mdi mdi-link-variant">
                            <span className="mdi mdi-arrow-up" />
                        </span>
                    ),
                };
            case BLEEventType.USER_INITIATED_PAIRING:
                return {
                    name: 'Pairing',
                    icon: (
                        <span className="mdi mdi-link-variant">
                            <span className="mdi mdi-arrow-down" />
                        </span>
                    ),
                };
            case BLEEventType.PEER_INITIATED_PAIRING:
                return {
                    name: 'Pairing requested',
                    icon: (
                        <span className="mdi mdi-link-variant">
                            <span className="mdi mdi-arrow-up" />
                        </span>
                    ),
                };
            case BLEEventType.PASSKEY_DISPLAY:
                return {
                    name: 'Passkey display',
                    icon: '',
                };
            case BLEEventType.PASSKEY_REQUEST:
                return {
                    name: 'Passkey request',
                    icon: '',
                };
            case BLEEventType.NUMERICAL_COMPARISON:
                return {
                    name: 'Numerical comparison',
                    icon: '',
                };
            case BLEEventType.LEGACY_OOB_REQUEST:
            case BLEEventType.LESC_OOB_REQUEST:
                return {
                    name: 'OOB request',
                    icon: '',
                };
            case BLEEventType.USER_INITIATED_PHY_UPDATE:
            case BLEEventType.PEER_INITIATED_PHY_UPDATE:
                return {
                    name: 'Phy update',
                    icon: '',
                };
            case BLEEventType.USER_INITIATED_MTU_UPDATE:
            case BLEEventType.PEER_INITIATED_MTU_UPDATE:
                return {
                    name: 'MTU update',
                    icon: '',
                };
            case BLEEventType.USER_INITIATED_DATA_LENGTH_UPDATE:
            case BLEEventType.PEER_INITIATED_DATA_LENGTH_UPDATE:
                return {
                    name: 'Data length update',
                    icon: '',
                };
            default:
                return {
                    name: 'unknown event',
                    icon: 'unknown event',
                };
        }
    }

    getEventContent() {
        const { event, onTimedOut } = this.props;
        const { name } = this.getEventInfo();

        const eventTimer =
            (event.type === BLEEventType.PEER_INITIATED_CONNECTION_UPDATE ||
                event.type ===
                    BLEEventType.PEER_PERIPHERAL_INITIATED_CONNECTION_UPDATE ||
                event.type === BLEEventType.PASSKEY_DISPLAY ||
                event.type === BLEEventType.PASSKEY_REQUEST ||
                event.type === BLEEventType.NUMERICAL_COMPARISON ||
                event.type === BLEEventType.LEGACY_OOB_REQUEST ||
                event.type === BLEEventType.LESC_OOB_REQUEST) &&
            event.state === BLEEventState.INDETERMINATE;

        return (
            <div className="content">
                <span className="left-space">
                    <div className="service-name truncate-text">{name}</div>
                    <div className="address-text">{event.device.address}</div>
                </span>
                {eventTimer && (
                    <CountdownTimer
                        ref={timer => {
                            this.countDownTimerRef = timer;
                        }}
                        seconds={EVENT_TIMEOUT_SECONDS}
                        onTimeout={() => onTimedOut()}
                    />
                )}
            </div>
        );
    }

    getClass() {
        const { event } = this.props;

        if (!event) {
            return '';
        }

        switch (event.state) {
            case BLEEventState.ERROR:
            case BLEEventState.REJECTED:
            case BLEEventState.DISCONNECTED:
            case BLEEventState.IGNORED:
                return 'failed-item';
            case BLEEventState.INDETERMINATE:
            case BLEEventState.PENDING:
                return '';
            case BLEEventState.SUCCESS:
                return 'success-item';
            default:
                throw new Error(
                    `Error. Unknown ble event state: ${event.state}`
                );
        }
    }

    getStyle() {
        const { event, selected } = this.props;
        if (!event.state) {
            if (selected) {
                return {
                    backgroundColor: 'rgb(179,225,245)',
                };
            }

            // seems this code is dead:
            const { backgroundColor } = this.state;
            const { r, g, b } = backgroundColor;
            return {
                backgroundColor: `rgb(${r}, ${g}, ${b})`,
            };
        }
        return {};
    }

    stopCounter() {
        if (this.countDownTimerRef) {
            this.countDownTimerRef.cancelTimer();
        }
    }

    render() {
        return (
            <div
                className={`service-item ${this.getClass()}`}
                style={this.getStyle()}
                onClick={this.onClick}
                onKeyDown={() => {}}
                role="button"
                tabIndex={0}
            >
                <div
                    className="expand-area"
                    onClick={onExpandAreaClick}
                    onKeyDown={() => {}}
                    role="button"
                    tabIndex={0}
                >
                    <div className="bar1" />
                    <div className="icon-wrap" />
                </div>
                <div className="content-wrap">{this.getEventContent()}</div>
            </div>
        );
    }
}

BLEEvent.propTypes = {
    event: PropTypes.instanceOf(Event).isRequired,
    selected: PropTypes.bool.isRequired,
    onTimedOut: PropTypes.func.isRequired,
    onSelected: PropTypes.func.isRequired,
};

export default BLEEvent;
