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

import { CountdownTimer } from '../components/CountdownTimer';
import { BLEEventState, BLEEventType } from './../actions/common';

const EVENT_TIMEOUT_SECONDS = 30;

export class BLEEvent extends React.PureComponent {
    constructor(props) {
        super(props);
        this.countDownTimerRef = 'counter-' + this.props.event.id;
    }

    _getEventInfo() {
        const eventType = this.props.event.type;

        switch (eventType) {
            case BLEEventType.USER_INITIATED_CONNECTION_UPDATE:
            case BLEEventType.PEER_CENTRAL_INITIATED_CONNECTION_UPDATE:
                return {
                    name: 'Connection update',
                    icon: (<span className='icon-link'><span className='icon-down'/></span>),
                };
            case BLEEventType.PEER_PERIPHERAL_INITIATED_CONNECTION_UPDATE:
                return {
                    name: 'Connection update request',
                    icon: (<span className='icon-link'><span className='icon-up'/></span>),
                };
            case BLEEventType.USER_INITIATED_PAIRING:
                return {
                    name: 'Pairing',
                    icon: (<span className='icon-link'><span className='icon-down'/></span>),
                };
            case BLEEventType.PEER_INITIATED_PAIRING:
                return {
                    name: 'Pairing requested',
                    icon: (<span className='icon-link'><span className='icon-up'/></span>),
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
            default:
                return {
                   name: 'unknown event',
                   icon: 'unknown event',
               };
        }
    }

    _getEventContent() {
        const { event, onTimedOut, countDownTimerRef } = this.props;
        const { name } = this._getEventInfo();

        let eventTimer = (<div/>);

        if ((event.type === BLEEventType.PEER_INITIATED_CONNECTION_UPDATE
            || event.type === BLEEventType.PEER_PERIPHERAL_INITIATED_CONNECTION_UPDATE
            || event.type === BLEEventType.PASSKEY_DISPLAY
            || event.type === BLEEventType.PASSKEY_REQUEST
            || event.type === BLEEventType.NUMERICAL_COMPARISON
            || event.type === BLEEventType.LEGACY_OOB_REQUEST
            || event.type === BLEEventType.LESC_OOB_REQUEST)
            && (event.state === BLEEventState.INDETERMINATE))
        {
            eventTimer = (<CountdownTimer ref={countDownTimerRef} seconds={EVENT_TIMEOUT_SECONDS} onTimeout={() => onTimedOut()}/>);
        }

        return (
           <div className='content'>
               <span className='left-space'>
                   <div className='service-name truncate-text'>{name}</div>
                   <div className='address-text'>{event.device.address}</div>
               </span>
               {eventTimer}
           </div>
        );
    }

    _onClick(e) {
        e.stopPropagation();

        const {
           onSelected,
           event,
        } = this.props;

        if (onSelected) {
            onSelected(event.id);
        }
    }

    _getClass() {
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
                throw `Error. Unknown ble event state: ${event.state}`;
        }
    }

    _getStyle() {
        const { event, selected } = this.props;

        if (!event.state) {
            return {
                backgroundColor: selected ? 'rgb(179,225,245)'
                   : `rgb(${this.state.backgroundColor.r}, ${this.state.backgroundColor.g}, ${this.state.backgroundColor.b})`,
            };
        } else {
            return {};
        }
    }

    _onExpandAreaClick() {
        console.log('TODO: implement me! I did not exist earlier either...');
    }

    stopCounter() {
        const {
            countDownTimerRef,
        } = this.props;

        if (this.refs[countDownTimerRef]) {
            this.refs[countDownTimerRef].cancelTimer();
        }
    }

    render() {
        return (
            <div className={'service-item ' + this._getClass()} style={this._getStyle()} onClick={_event => this._onClick(_event)}>
                <div className='expand-area' onClick={() => this._onExpandAreaClick()}>
                    <div className='bar1' />
                    <div className='icon-wrap'></div>
                </div>
                <div className='content-wrap'>
                    {this._getEventContent()}
                </div>
            </div>
        );
    }
}

BLEEvent.propTypes = {
    event: PropTypes.object.isRequired,
    selected: PropTypes.bool.isRequired,
    onTimedOut: PropTypes.func.isRequired,
    onSelected: PropTypes.func.isRequired,
};
