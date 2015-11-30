'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';

import { CountdownTimer } from '../components/CountdownTimer';
import { BLEEventState, BLEEventType } from './../actions/common';

const EVENT_TIMEOUT_SECONDS = 10; // Used to be 30 secs

export class BLEEvent extends Component {
    constructor(props) {
        super(props);
    }

    _getEventInfo() {
        const eventType = this.props.event.type;

        switch (eventType) {
            case BLEEventType.USER_INITIATED_CONNECTION_UPDATE:
                return {
                    name: 'Update request',
                    icon: (<span className='icon-link'><span className='icon-down'/></span>),
                };
            case BLEEventType.PERIPHERAL_INITIATED_CONNECTION_UPDATE:
                return {
                    name: 'Update request',
                    icon: (<span className='icon-link'><span className='icon-up'/></span>),
                };
            default:
                return {
                   name: 'unknown event',
                   icon: 'unknown event',
               };
        }
    }

    _getEventContent() {
        const { event, onTimedOut } = this.props;
        const { name, icon } = this._getEventInfo();

        let eventTimer = (<div/>);

        if (event.eventType === BLEEventType.PERIPHERAL_INITIATED_CONNECTION_UPDATE) {
            eventTimer = (<CountdownTimer ref='counter' seconds={EVENT_TIMEOUT_SECONDS} onTimeout={() => onTimedOut()}/>);
        }

        return (
           <div className='content'>
               <span>{icon}</span>
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
                  return 'failed-item';
            case BLEEventState.INDETERMINATE:
                return '';
            case BLEEventState.SUCCESS:
                return 'success-item';
            default:
                throw 'error: unknown ble event state';
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
        // Used to let EventViewer tell Event to stop it's counter
        if (this.refs.counter) {
            this.refs.counter.cancelTimer();
        }
    }

    render() {
        const {
            event,
            onTimedOut,
        } = this.props;

        return (
            <div className={'service-item ' + this._getClass()} style={this._getStyle()} onClick={_event => this._onClick(_event)}>
                <div className='expand-area' onClick={() => this._onExpandAreaClick()}>
                    <div className='bar1' />
                    <div className='icon-wrap'></div>
                </div>
                <div className='content-wrap'>
                    {this._getEventContent()}
                    <div>
                        State: {event.state}
                    </div>
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
