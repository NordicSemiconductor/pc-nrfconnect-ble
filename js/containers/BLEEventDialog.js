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
import Component from 'react-pure-render/component';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Modal, Button } from 'react-bootstrap';
import { BLEEventState, BLEEventType } from '../actions/common';

import { BLEEvent } from '../components/BLEEvent';
import { ConnectionUpdateRequestEditor } from '../components/ConnectionUpdateRequestEditor';
import { PairingEditor } from '../components/PairingEditor';

import * as BLEEventActions from '../actions/bleEventActions';
import * as AdapterActions from '../actions/adapterActions';

export class BLEEventDialog extends Component {
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
        if (event.type === BLEEventType.USER_INITIATED_CONNECTION_UPDATE) {
        return <ConnectionUpdateRequestEditor
            event={event}
            onUpdate={this._handleEditorUpdate}
            onRejectConnectionParams={device => rejectDeviceConnectionParams(event.id, device)}
            onUpdateConnectionParams={(device, connectionParams) => updateDeviceConnectionParams(event.id, device, connectionParams)}
            onIgnoreEvent={eventId => ignoreEvent(eventId)}
            onCancelUserInitiatedEvent={eventId => removeEvent(eventId)}
            />;
        } else if (event.type === BLEEventType.USER_INITIATED_PAIRING) {
            return <PairingEditor
                event={event}
                onCancelUserInitiatedEvent={eventId => removeEvent(eventId)}
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
            rejectDeviceConnectionParams,
            updateDeviceConnectionParams,
            ignoreEvent,
            removeEvent,
        } = this.props;

        if (events === null || events === undefined || events.size < 1)
        {
            this._close();
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
                    <Modal.Title>Events</Modal.Title>
                </Modal.Header>

                <div className='bleevent-dialog'>
                    <div className='bleevent-dialog-view'>
                        <div className='service-items-wrap'>
                            {
                                events.map(event =>
                                <BLEEvent
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
                            )}
                        </div>

                        {events.map(event =>
                            <div key={event.id} className='item-editor' style={ ((selectedEventId !== -1) && (selectedEventId === event.id) && (events.get(selectedEventId).state === BLEEventState.INDETERMINATE)) ? {} : {display: 'none'}}>
                                {this._getEditorComponent(event)}
                            </div>
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
};

function mapStateToProps(state) {
    const {
        bleEvent,
    } = state;

    return {
        visible: bleEvent.visible,
        events: bleEvent.events,
        selectedEventId: bleEvent.selectedEventId,
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
