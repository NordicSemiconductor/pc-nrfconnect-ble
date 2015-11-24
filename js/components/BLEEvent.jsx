'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';

import { CountdownTimer } from '../components/CountdownTimer';
import * as BLEEventActions from '../actions/bleEventActions';

const EVENT_TIMEOUT_SECONDS = 30;

export class BLEEvent extends Component {
   // mixins: [BlueWhiteBlinkMixin], // HUH ?
   constructor(props) {
       super(props);
   }

   _getEventInfo() {
       const eventType = this.props.event.type;

       switch (eventType) {
           case BLEEventActions.EventType.USER_INITIATED_CONNECTION_UPDATE:
                return {
                    name: 'Update request',
                    icon: (<span className="icon-link"><span className="icon-down"/></span>)
                };
           case BLEEventActions.EventType.PERIPHERAL_INITIATED_CONNECTION_UPDATE:
                return {
                    name: 'Update request',
                    icon: (<span className="icon-link"><span className="icon-up"/></span>)
                };
           default:
               return {
                   name: 'unknown event',
                   icon: 'unknown event'
               };
       }
   }

   _getEventContent() {
       const { event, onTimedOut } = this.props;
       const { name, icon } = this._getEventInfo();

       let eventTimer =(<div/>);

       if (event.eventType === BLEEventActions.EventType.PERIPHERAL_INITIATED_CONNECTION_UPDATE) {
           eventTimer = (<CountdownTimer ref="counter" seconds={EVENT_TIMEOUT_SECONDS} onTimeout={() => onTimedOut()}/>);
       }

       return (
           <div className="content">
               <span>{icon}</span>
               <span className="left-space">
                   <div className="service-name truncate-text">{name}</div>
                   <div className="address-text">{event.deviceAddress}</div>
               </span>
               {eventTimer}
           </div>
       );
   }

   _onClick(e) {
       e.stopPropagation();

       if (this.props.onSelected) {
           this.props.onSelected(this.props.index);
       }
   }

   _getClass() {
       const { event } = this.props;

       if (!event) {
           return '';
       }

       switch (event.state) {
           case 'error':
           case 'timedOut':
           case 'rejected':
           case 'canceled':
               return 'failed-item';
           case 'indeterminate':
               return '';
           case 'success':
               return 'success-item';
           default:
               throw 'error: unknown ble event state';
       }
   }

   _getStyle() {
       const { event } = this.props;

       if (!event.state) {
           return {
               backgroundColor: this.props.selected ? 'rgb(179,225,245)'
                   : `rgb(${this.state.backgroundColor.r}, ${this.state.backgroundColor.g}, ${this.state.backgroundColor.b})`
           };
       } else {
           return {};
       }
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
           <div className={'service-item ' + this._getClass()} style={this._getStyle()} onClick={this._onClick}>
               <div className="expand-area" onClick={this._onExpandAreaClick}>
                   <div className="bar1" />
                   <div className="icon-wrap"></div>
               </div>
               <div className="content-wrap">
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
