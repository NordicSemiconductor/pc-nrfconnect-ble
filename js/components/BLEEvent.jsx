'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';

export class BLEEvent extends Component {
   // mixins: [BlueWhiteBlinkMixin], // HUH ?
   constructor(props) {
       super(props);
   }

   _getEventName(eventType) {
       switch (eventType) {
           case eventTypes.userInitiatedConnectionUpdate:
               return 'Update request';
           case eventTypes.peripheralInitiatedConnectionUpdate:
               return 'Update request';
           default:
               return 'unknown event';
       }
   }

   _getEventIcons(eventType) {
       switch (eventType) {
           case eventTypes.userInitiatedConnectionUpdate:
               return (<span className="icon-link"><span className="icon-down"/></span>);
           case eventTypes.peripheralInitiatedConnectionUpdate:
               return (<span className="icon-link"><span className="icon-up"/></span>);
           default:
               return 'unknown event';
       }
   }

   _timedOut() {
       connectionActions.eventTimedOut(this.props.event);
   }

   _getEventContent() {
       const eventName = this._getEventName();
       let eventTimer =(<div/>);

       if ((this.props.event.eventType === eventTypes.peripheralInitiatedConnectionUpdate)) {
           eventTimer = (<CountdownTimer ref="counter" seconds={30} onTimeout={this._timedOut}/>);
       }

       return (
           <div className="content">
               <span>{this._getEventIcons()}</span>
               <span className="left-space">
                   <div className="service-name truncate-text">{eventName}</div>
                   <div className="address-text">{this.props.event.deviceAddress}</div>
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
       if (!this.props.event.state) {
           return '';
       }

       switch (this.props.event.state) {
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
       if (!this.props.event.state) {
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

Event.propTypes = {
    eventType: PropTypes.string.isRequired,
    _state: PropTypes.string.isRequired,
};
