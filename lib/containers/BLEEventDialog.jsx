/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint react/forbid-prop-types: off */

'use strict';

import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import * as AdapterActions from '../actions/adapterActions';
import * as BLEEventActions from '../actions/bleEventActions';
import { BLEEventState, BLEEventType } from '../actions/common';
import AuthKeyEditor from '../components/AuthKeyEditor';
import BLEEvent from '../components/BLEEvent';
import ConnectionUpdateRequestEditor from '../components/ConnectionUpdateRequestEditor';
import DataLengthUpdateRequestEditor from '../components/DataLengthUpdateRequestEditor';
import MtuUpdateRequestEditor from '../components/MtuUpdateRequestEditor';
import PairingEditor from '../components/PairingEditor';
import PhyUpdateRequestEditor from '../components/PhyUpdateRequestEditor';

const BLEEventDialog = ({
    selectEventId,
    rejectDeviceConnectionParams,
    updateDeviceConnectionParams,
    updateDevicePhyParams,
    updateDeviceMtu,
    updateDeviceDataLength,
    disconnectFromDevice,
    // ignoreEvent,
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
    clearAllEvents,
    showDialog,
    visible,
    events,
    selectedEventId,
}) => {
    if (events === null || events === undefined || events.size < 1) {
        return <div />;
    }

    const onSelected = id => selectEventId(id);

    const getEditorComponent = event => {
        switch (event.type) {
            case BLEEventType.USER_INITIATED_CONNECTION_UPDATE:
            case BLEEventType.PEER_PERIPHERAL_INITIATED_CONNECTION_UPDATE:
                return (
                    <ConnectionUpdateRequestEditor
                        event={event}
                        onRejectConnectionParams={device =>
                            rejectDeviceConnectionParams(event.id, device)
                        }
                        onUpdateConnectionParams={(device, connectionParams) =>
                            updateDeviceConnectionParams(
                                event.id,
                                device,
                                connectionParams
                            )
                        }
                        onIgnoreEvent={eventId => acceptEvent(eventId)}
                        onCancelUserInitiatedEvent={eventId =>
                            removeEvent(eventId)
                        }
                    />
                );
            case BLEEventType.PEER_CENTRAL_INITIATED_CONNECTION_UPDATE:
                return (
                    <ConnectionUpdateRequestEditor
                        event={event}
                        onRejectConnectionParams={device =>
                            disconnectFromDevice(device)
                        }
                        onUpdateConnectionParams={eventId =>
                            acceptEvent(eventId)
                        }
                        onIgnoreEvent={() => {}}
                        onCancelUserInitiatedEvent={eventId =>
                            removeEvent(eventId)
                        }
                    />
                );
            case BLEEventType.USER_INITIATED_PAIRING:
                return (
                    <PairingEditor
                        event={event}
                        onPair={securityParams =>
                            pairWithDevice(
                                event.id,
                                event.device,
                                securityParams
                            )
                        }
                        onCancel={() => removeEvent(event.id)}
                        security={security}
                    />
                );
            case BLEEventType.PEER_INITIATED_PAIRING:
                return (
                    <PairingEditor
                        event={event}
                        onAccept={securityParams =>
                            acceptPairing(
                                event.id,
                                event.device,
                                securityParams
                            )
                        }
                        onReject={() => rejectPairing(event.id, event.device)}
                        onCancel={() => removeEvent(event.id)}
                        security={security}
                    />
                );
            case BLEEventType.PASSKEY_DISPLAY:
            case BLEEventType.PASSKEY_REQUEST:
            case BLEEventType.NUMERICAL_COMPARISON:
            case BLEEventType.LEGACY_OOB_REQUEST:
            case BLEEventType.LESC_OOB_REQUEST:
                return (
                    <AuthKeyEditor
                        event={event}
                        onAuthKeySubmit={(keyType, key) =>
                            replyAuthKey(event.id, event.device, keyType, key)
                        }
                        onLescOobSubmit={peerOobData =>
                            replyLescOob(
                                event.id,
                                event.device,
                                peerOobData,
                                event.ownOobData
                            )
                        }
                        onNumericalComparisonMatch={match =>
                            replyNumericalComparisonMatch(
                                event.id,
                                event.device,
                                match
                            )
                        }
                        onKeypress={value =>
                            sendKeypress(event.id, event.device, value)
                        }
                        onCancel={() => removeEvent(event.id)}
                    />
                );
            case BLEEventType.USER_INITIATED_PHY_UPDATE:
            case BLEEventType.PEER_INITIATED_PHY_UPDATE:
                return (
                    <PhyUpdateRequestEditor
                        event={event}
                        onUpdatePhy={({ rxPhy, txPhy }) =>
                            updateDevicePhyParams(event.id, event.device, {
                                rx_phys: rxPhy,
                                tx_phys: txPhy,
                            })
                        }
                        onCancelPhyUpdate={() => {
                            if (
                                event.type ===
                                BLEEventType.PEER_INITIATED_PHY_UPDATE
                            ) {
                                disconnectFromDevice(event.device);
                            } else {
                                removeEvent(event.id);
                            }
                        }}
                    />
                );
            case BLEEventType.USER_INITIATED_MTU_UPDATE:
            case BLEEventType.PEER_INITIATED_MTU_UPDATE:
                return (
                    <MtuUpdateRequestEditor
                        event={event}
                        onUpdateMtu={mtu =>
                            updateDeviceMtu(event.id, event.device, mtu, false)
                        }
                        onAcceptMtu={mtu =>
                            updateDeviceMtu(event.id, event.device, mtu, true)
                        }
                        onCancelMtuUpdate={() => {
                            if (
                                event.type ===
                                BLEEventType.PEER_INITIATED_MTU_UPDATE
                            ) {
                                disconnectFromDevice(event.device);
                            } else {
                                removeEvent(event.id);
                            }
                        }}
                    />
                );
            case BLEEventType.USER_INITIATED_DATA_LENGTH_UPDATE:
            case BLEEventType.PEER_INITIATED_DATA_LENGTH_UPDATE:
                return (
                    <DataLengthUpdateRequestEditor
                        event={event}
                        onUpdateDataLength={dataLength =>
                            updateDeviceDataLength(
                                event.id,
                                event.device,
                                dataLength
                            )
                        }
                        onCancelDataLengthUpdate={() => {
                            if (
                                event.type ===
                                BLEEventType.PEER_INITIATED_DATA_LENTH_UPDATE
                            ) {
                                disconnectFromDevice(event.device);
                            } else {
                                removeEvent(event.id);
                            }
                        }}
                    />
                );
            default:
                return null;
        }
    };

    const close = () => {
        clearAllEvents();
        showDialog(false);
    };

    return (
        <Modal
            className="events-modal"
            show={visible}
            backdrop
            onHide={() => {
                clearAllEvents();
                showDialog(false);
            }}
        >
            <Modal.Header>
                <Modal.Title>Events and actions</Modal.Title>
            </Modal.Header>

            <div className="bleevent-dialog">
                <div className="bleevent-dialog-view">
                    <div className="service-items-wrap">
                        {events.valueSeq().map(event => (
                            <BLEEvent
                                key={event.id}
                                onSelected={onSelected}
                                selected={selectedEventId === event.id}
                                event={event}
                                onTimedOut={() => {
                                    console.log('Guessing event timed out!');
                                }}
                            />
                        ))}
                    </div>

                    {events.valueSeq().map(event => (
                        <div
                            key={event.id}
                            className="item-editor"
                            style={
                                selectedEventId !== -1 &&
                                selectedEventId === event.id &&
                                event.state === BLEEventState.INDETERMINATE
                                    ? {}
                                    : { display: 'none' }
                            }
                        >
                            {getEditorComponent(event)}
                        </div>
                    ))}

                    <div
                        className="item-editor"
                        style={
                            selectedEventId === -1 && events.size > 0
                                ? {}
                                : { display: 'none' }
                        }
                    >
                        <div className="nothing-selected" />
                    </div>
                </div>
            </div>

            <Modal.Footer>
                <Button className="btn btn-primary btn-nordic" onClick={close}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

BLEEventDialog.propTypes = {
    visible: PropTypes.bool.isRequired,
    events: PropTypes.instanceOf(Map).isRequired,
    selectedEventId: PropTypes.number.isRequired,
    clearAllEvents: PropTypes.func.isRequired,
    showDialog: PropTypes.func.isRequired,
    selectEventId: PropTypes.func.isRequired,
    rejectDeviceConnectionParams: PropTypes.func.isRequired,
    updateDeviceConnectionParams: PropTypes.func.isRequired,
    updateDevicePhyParams: PropTypes.func.isRequired,
    updateDeviceMtu: PropTypes.func.isRequired,
    updateDeviceDataLength: PropTypes.func.isRequired,
    removeEvent: PropTypes.func.isRequired,
    rejectPairing: PropTypes.func.isRequired,
    acceptPairing: PropTypes.func.isRequired,
    replyNumericalComparisonMatch: PropTypes.func.isRequired,
    replyAuthKey: PropTypes.func.isRequired,
    replyLescOob: PropTypes.func.isRequired,
    sendKeypress: PropTypes.func.isRequired,
    disconnectFromDevice: PropTypes.func.isRequired,
    acceptEvent: PropTypes.func.isRequired,
    pairWithDevice: PropTypes.func.isRequired,
    security: PropTypes.object,
};

BLEEventDialog.defaultProps = {
    security: null,
};

function mapStateToProps(state) {
    const { bleEvent, adapter } = state.app;

    const selectedAdapter = adapter
        ? adapter.getIn(['adapters', adapter.selectedAdapterIndex])
        : undefined;

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

export default connect(mapStateToProps, mapDispatchToProps)(BLEEventDialog);
