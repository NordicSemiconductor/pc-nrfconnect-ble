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

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Modal } from 'react-bootstrap';
import { BLEEventState } from '../actions/common';

import { BLEEvent } from '../components/BLEEvent';
import { ConnectionUpdateRequestEditor } from '../components/ConnectionUpdateRequestEditor';

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

    _areAllEventsHandledOrTimedOut() {
        const { events } = this.props;

        events.forEach((event, id) => {
            if (!event.state) {
                return false;
            }
        });

        return true;
    }

/*
    _handleEditorUpdate(selectedEventId) {
        this.refs['event_' + this.props.selectedEventId].stopCounter();
        this.setState({
            selectedEventId: null
        });
    } */

    render() {
        const {
            visible,
            events,
            selectedEventId,
            showDialog,
            clearAllEvents,
            rejectDeviceConnectionParams,
            updateDeviceConnectionParams,
        } = this.props;

        return (
            <Modal
                className="events-modal"
                show={visible}
                backdrop="static"
                onHide={() => { clearAllEvents(); showDialog(false); }} >
                <Modal.Header>
                    <Modal.Title>Events</Modal.Title>
                </Modal.Header>

                <div className="server-setup">
                    <div className="device-details-view">
                        <div className="service-items-wrap">
                            {events.map(event =>
                                <BLEEvent
                                    key={event.id}
                                    ref={'event_' + event.id}
                                    onSelected={(eventId) => this._onSelected(eventId)}
                                    selected={selectedEventId === event.id}
                                    event={event}
                                    onTimedOut={() => { console.log('Event timed out!'); }}
                                />
                            )}
                        </div>

                        {events.map(event =>
                            <div key={event.id} className="item-editor" style={ ( (selectedEventId === event.id) && (events.get(selectedEventId).state === BLEEventState.INDETERMINATE)) ? {} : {display: 'none'}}>
                                <ConnectionUpdateRequestEditor
                                    event={event}
                                    onUpdate={this._handleEditorUpdate}
                                    onRejectConnectionParams={(device) => rejectDeviceConnectionParams(event.id, device)}
                                    onUpdateConnectionParams={(device, connectionParams) => updateDeviceConnectionParams(event.id, device, connectionParams)}
                                    />
                            </div>
                        )}

                        <div className="item-editor"
                             style={((selectedEventId === -1) && (events.size > 0)) ? {} : {display: 'none'}}>
                            <div className="nothing-selected"/>
                        </div>
                    </div>
                </div>

                <Modal.Footer>
                    <button disabled={!this._areAllEventsHandledOrTimedOut()} className="btn btn-primary btn-nordic" onClick={() => this._close()}>Close</button>
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
};

function mapStateToProps(state) {
    const {
        bleEvent
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
