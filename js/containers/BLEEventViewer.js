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

 'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';
import { Modal } from 'react-bootstrap';

import { ConnectionUpdateRequestEditor } from '../components/ConnectionUpdateRequestEditor';
import { CountdownTimer } from '../components/CountdownTimer';
import { BLEEvent } from '../components/BLEEvent';

export class BLEEventViewer extends Component {
//    mixins: [Reflux.listenTo(connectionStore, "onConnectionStoreChanged")],
    constructor(props) {
        super(props);
    }

/*    getInitialState(){
        return Object.assign({}, connectionStore.getInitialState(), {visible: false, selectedIndex: null});
    } */

    onConnectionStoreChanged(newState) {
        if (!this.state.visible) {
            if (newState.eventsToShowUser && (newState.eventsToShowUser.length > 0) ) {
                this.setState(
                    Object.assign({},
                        newState,
                        {
                            visible: true,
                            selectedIndex: this.state.eventsToShowUser.length -1
                        }
                    )
                );

            } else {
                this.setState(newState);
            }
        } else {
            this.setState(newState);
        }
    }

    _close() {
        connectionActions.clearAllUserEvents();
        this.setState({visible: false});
    }

    _onSelected(selected) {
        this.setState({selectedIndex: selected});
    }

    _areAllEventsHandledOrTimedOut() {
        for(let i = 0; i < this.state.eventsToShowUser.length; i++) {
            if (!this.state.eventsToShowUser[i].state) {
                return false;
            }
        }
        return true;
    }

    _handleEditorUpdate() {
        this.refs['event_' + this.state.selectedIndex].stopCounter();
        this.setState({
            selectedIndex: null
        });
    }

    render() {
        const {
            visible,
            style,
            eventsToShowUser,
            selectedIndex,
        } = this.props;

        return (
            <Modal className="events-modal" show={visible} backdrop="static" onHide={this._close} >
                <Modal.Header>
                    <Modal.Title>Events</Modal.Title>
                </Modal.Header>
                <div className="server-setup" style={style}>
                    <div className="device-details-view">
                        <div className="service-items-wrap">
                            {eventsToShowUser.map((event, i) =>
                                <BLEEvent key={i} ref={'event_' + i} onSelected={this._onSelected} selected={selectedIndex===i} event={eventsToShowUser[i]} index={i}/>
                            )}
                        </div>
                        {eventsToShowUser.map((event, i) =>
                            <div key={i} className="item-editor" style={ ( (selectedIndex === i) && !(eventsToShowUser[selectedIndex].state)) ? {} : {display: 'none'}}>
                                <ConnectionUpdateRequestEditor
                                    event={event}
                                    onUpdate={this._handleEditorUpdate}/>
                            </div>
                        )}
                        <div className="item-editor"
                             style={((selectedIndex === null) ||
                                     (eventsToShowUser.length === 0) ||
                                     (eventsToShowUser[selectedIndex].state) ) ? {} : {display: 'none'}}>
                            <div className="nothing-selected"/>
                        </div>
                    </div>
                </div>
                <Modal.Footer>
                    <button disabled={!this._areAllEventsHandledOrTimedOut()} className="btn btn-primary btn-nordic" onClick={this._close}>Close</button>
                </Modal.Footer>
            </Modal>
        );
    }
}
