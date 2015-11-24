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

// import { ConnectionUpdateRequestEditor } from '../components/ConnectionUpdateRequestEditor';

import { BLEEvent } from '../components/BLEEvent';
import { ConnectionUpdateRequestEditor } from '../components/ConnectionUpdateRequestEditor';

import * as BLEEventActions from '../actions/bleEventActions';

export class BLEEventDialog extends Component {
//    mixins: [Reflux.listenTo(connectionStore, "onConnectionStoreChanged")],
    constructor(props) {
        super(props);
    }

/*    getInitialState(){
        return Object.assign({}, connectionStore.getInitialState(), {visible: false, selectedIndex: null});
    } */

/*
    onConnectionStoreChanged(newState) {
        if (!this.state.visible) {
            if (newState.events && (newState.events.length > 0) ) {
                this.setState(
                    Object.assign({},
                        newState,
                        {
                            visible: true,
                            selectedIndex: this.state.events.length -1
                        }
                    )
                );

            } else {
                this.setState(newState);
            }
        } else {
            this.setState(newState);
        }
    } */

    _close() {
        const { clearAllEvents, showDialog } = this.props;

        clearAllEvents();
        showDialog(false);
    }

    _onSelected(selected) {
        this.setState({selectedIndex: selected});
    }

    _areAllEventsHandledOrTimedOut() {
        this.props.events.forEach((event, index) => {
            if (!event.state) {
                return false;
            }
        });

        return true;
    }

    _handleEditorUpdate(selectedIndex) {
        this.refs['event_' + this.props.selectedIndex].stopCounter();
        this.setState({
            selectedIndex: null
        });
    }

    render() {
        const {
            visible,
            events,
            selectedIndex,
            showDialog,
            clearAllEvents,
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
                            {events.map((event, i) =>
                                <BLEEvent
                                    key={i}
                                    ref={'event_' + i}
                                    onSelected={this._onSelected}
                                    selected={selectedIndex===i}
                                    event={events[i]}
                                    index={i}
                                    onTimedOut={() => { console.log('Event timed out!'); }}
                                />
                            )}
                        </div>
                        {events.map((event, i) =>
                            <div key={i} className="item-editor" style={ ( (selectedIndex === i) && !(events[selectedIndex].state)) ? {} : {display: 'none'}}>
                                <ConnectionUpdateRequestEditor
                                    event={event}
                                    onUpdate={this._handleEditorUpdate}/>
                            </div>
                        )}
                        <div className="item-editor"
                             style={((selectedIndex === null) ||
                                     (events.size === 0) ||
                                     (events[selectedIndex].state) ) ? {} : {display: 'none'}}>
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
    selectedIndex: PropTypes.number.isRequired,
    clearAllEvents: PropTypes.func.isRequired,
    showDialog: PropTypes.func.isRequired,
    selectEvent: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const {
        bleEvent
    } = state;

    return {
        visible: bleEvent.visible,
        events: bleEvent.events,
        selectedIndex: bleEvent.selectedIndex,
    };
}

function mapDispatchToProps(dispatch) {
    const retval = Object.assign(
        {},
        bindActionCreators(BLEEventActions, dispatch)
    );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BLEEventDialog);
