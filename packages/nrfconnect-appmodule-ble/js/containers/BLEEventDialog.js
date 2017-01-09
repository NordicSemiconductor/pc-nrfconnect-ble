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

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Modal, Button } from 'react-bootstrap';
import { BLEEventState, BLEEventType } from '../actions/common';

import { BLEEvent } from '../components/BLEEvent';
import { ConnectionUpdateRequestEditor } from '../components/ConnectionUpdateRequestEditor';
import { PairingEditor } from '../components/PairingEditor';
import { AuthKeyEditor } from '../components/AuthKeyEditor';

import * as BLEEventActions from '../actions/bleEventActions';
import * as AdapterActions from '../actions/adapterActions';

export class BLEEventDialog extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    _close() {
        const { clearAllEvents, showDialog } = this.props;

        clearAllEvents();
        showDialog(false);
    }

    _onSelected(selectedEventId) {
        const { selectEventId } = this.props;
        selectEventId(selectedEventId);
    }

    _areAllEventsHandled() {
        const { events } = this.props;
        let allEventsHandled = true;

        events.forEach((event, id) => {
            if (event.state === BLEEventState.INDETERMINATE) {
                allEventsHandled = false;
                return false; // Stops the iteration
            }
        });

        return allEventsHandled;
    }

    _getEditorComponent(event) {
        const {
            rejectDeviceConnectionParams,
            updateDeviceConnectionParams,
            disconnectFromDevice,
            ignoreEvent,
            acceptEvent,
            removeEvent,
            pairWithDevice,
            security,
            rejectPairing,
            acceptPairing,
            replyNumericalComparisonMatch,
            replyAuthKey,
            replyLescOob,
            sendKeypress,
        } = this.props;

        if (event.type === BLEEventType.USER_INITIATED_CONNECTION_UPDATE || event.type === BLEEventType.PEER_PERIPHERAL_INITIATED_CONNECTION_UPDATE) {
            return <ConnectionUpdateRequestEditor
                event={event}
                onUpdate={this._handleEditorUpdate}
                onRejectConnectionParams={device => rejectDeviceConnectionParams(event.id, device)}
                onUpdateConnectionParams={(device, connectionParams) => updateDeviceConnectionParams(event.id, device, connectionParams)}
                onIgnoreEvent={eventId => acceptEvent(eventId)}
                onCancelUserInitiatedEvent={eventId => removeEvent(eventId)}
            />;
        } else if (event.type === BLEEventType.PEER_CENTRAL_INITIATED_CONNECTION_UPDATE) {
            return <ConnectionUpdateRequestEditor
                event={event}
                onUpdate={this._handleEditorUpdate}
                onRejectConnectionParams={device => disconnectFromDevice(device)}
                onUpdateConnectionParams={eventId => acceptEvent(eventId)}
                onIgnoreEvent={() => {}}
                onCancelUserInitiatedEvent={eventId => removeEvent(eventId)}
            />;
        } else if (event.type === BLEEventType.USER_INITIATED_PAIRING) {
            return <PairingEditor
                event={event}
                onPair={securityParams => pairWithDevice(event.id, event.device, securityParams)}
                onCancel={() => removeEvent(event.id)}
                security={security}
                />;
        } else if (event.type === BLEEventType.PEER_INITIATED_PAIRING) {
            return <PairingEditor
                event={event}
                onAccept={securityParams => acceptPairing(event.id, event.device, securityParams)}
                onReject={() => rejectPairing(event.id, event.device)}
                onCancel={() => removeEvent(event.id)}
                security={security}
                />;
        } else if (event.type === BLEEventType.PASSKEY_DISPLAY ||
            event.type === BLEEventType.PASSKEY_REQUEST ||
            event.type === BLEEventType.NUMERICAL_COMPARISON ||
            event.type === BLEEventType.LEGACY_OOB_REQUEST ||
            event.type === BLEEventType.LESC_OOB_REQUEST) {
            return <AuthKeyEditor
                event={event}
                onAuthKeySubmit={(keyType, key) => replyAuthKey(event.id, event.device, keyType, key)}
                onLescOobSubmit={peerOobData => replyLescOob(event.id, event.device, peerOobData, event.ownOobData)}
                onNumericalComparisonMatch={match => replyNumericalComparisonMatch(event.id, event.device, match)}
                onKeypress={(value) => sendKeypress(event.id, event.device, value)}
                onCancel={() => removeEvent(event.id)}
                />;
        }
    }

    render() {
        const {
            visible,
            events,
            selectedEventId,
            showDialog,
            clearAllEvents,
        } = this.props;

        if (events === null || events === undefined || events.size < 1)
        {
            return <div />;
        }

        return (
            <Modal
                className='events-modal'
                show={visible}
                backdrop={true}
                onHide={() => {
                    clearAllEvents();
                    showDialog(false);
                }} >
                <Modal.Header>
                    <Modal.Title>Events and actions</Modal.Title>
                </Modal.Header>

                <div className='bleevent-dialog'>
                    <div className='bleevent-dialog-view'>
                        <div className='service-items-wrap'>
                            {
                                events.map(event =>
                                {
                                    return <BLEEvent
                                        key={event.id}
                                        ref={'event_' + event.id}
                                        onSelected={eventId => this._onSelected(eventId)}
                                        selected={selectedEventId === event.id}
                                        event={event}
                                        onTimedOut={
                                            () => {
                                                console.log('Guessing event timed out!');
                                            }
                                        }
                                    />
                                }
                            )}
                        </div>

                        {events.map(event =>
                            {
                                return <div key={event.id} className='item-editor' style={ ((selectedEventId !== -1) && (selectedEventId === event.id) && event.state === BLEEventState.INDETERMINATE) ? {} : {display: 'none'}}>
                                    {this._getEditorComponent(event)}
                                </div>
                            }
                        )}

                        <div className='item-editor'
                             style={((selectedEventId === -1) && (events.size > 0)) ? {} : {display: 'none'}}>
                            <div className='nothing-selected'/>
                        </div>
                    </div>
                </div>

                <Modal.Footer>
                    <Button className='btn btn-primary btn-nordic' onClick={() => this._close()}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

BLEEventDialog.propTypes = {
    visible: PropTypes.bool.isRequired,
    events: PropTypes.object.isRequired,
    selectedEventId: PropTypes.number.isRequired,
    clearAllEvents: PropTypes.func.isRequired,
    showDialog: PropTypes.func.isRequired,
    selectEventId: PropTypes.func.isRequired,
    rejectDeviceConnectionParams: PropTypes.func.isRequired,
    updateDeviceConnectionParams: PropTypes.func.isRequired,
    ignoreEvent: PropTypes.func.isRequired,
    removeEvent: PropTypes.func.isRequired,
    rejectPairing: PropTypes.func.isRequired,
    acceptPairing: PropTypes.func.isRequired,
    replyNumericalComparisonMatch: PropTypes.func.isRequired,
    replyAuthKey: PropTypes.func.isRequired,
    replyLescOob: PropTypes.func.isRequired,
    sendKeypress: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const {
        bleEvent,
        adapter,
    } = state;

    const selectedAdapter = adapter.getIn(['adapters', adapter.selectedAdapter]);

    return {
        visible: bleEvent.visible,
        events: bleEvent.events,
        selectedEventId: bleEvent.selectedEventId,
        security: selectedAdapter ? selectedAdapter.security : null,
    };
}

function mapDispatchToProps(dispatch) {
    const retval = Object.assign(
        bindActionCreators(AdapterActions, dispatch),
        bindActionCreators(BLEEventActions, dispatch)
    );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BLEEventDialog);
