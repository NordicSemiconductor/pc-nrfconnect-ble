/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint jsx-a11y/label-has-for: off */
/* eslint jsx-a11y/label-has-associated-control: off */
/* eslint jsx-a11y/click-events-have-key-events: off */

'use strict';

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { BLEEventType, BLEPHYType } from '../actions/common';
import { Event } from '../reducers/bleEventReducer';
import ActionButton from './ActionButton';

const { PEER_INITIATED_PHY_UPDATE } = BLEEventType;

const PhyUpdateRequestEditor = ({
    event: {
        type,
        device,
        requestedPhyParams: { txPhy: rTxPhy, rxPhy: rRxPhy },
    },
    onUpdatePhy,
    onCancelPhyUpdate,
}) => {
    const { address } = device;
    const peerInitiated = type === PEER_INITIATED_PHY_UPDATE;

    const [txPhy, setTxPhy] = useState(peerInitiated ? rTxPhy : device.txPhy);
    const [rxPhy, setRxPhy] = useState(peerInitiated ? rRxPhy : device.rxPhy);
    const [linked, setLinked] = useState(rTxPhy === rRxPhy);

    const linkedRxPhy = linked ? txPhy : rxPhy;

    return (
        <div>
            <div className="event-header">
                <h4>Phy update for device {address}</h4>
            </div>
            <form className="form-horizontal">
                <div className="container">
                    <div className="row">
                        <div className="col col-10 pr-0">
                            <div className="row mb-2">
                                <span className="col col-4">Transmission:</span>
                                <ActionButton
                                    className="col col-3 mt-0"
                                    label="1 Mb/s"
                                    primary={
                                        txPhy === BLEPHYType.BLE_GAP_PHY_1MBPS
                                    }
                                    onClick={() =>
                                        setTxPhy(BLEPHYType.BLE_GAP_PHY_1MBPS)
                                    }
                                    disabled={peerInitiated}
                                />
                                <ActionButton
                                    className="col col-3 mt-0"
                                    label="2 Mb/s"
                                    primary={
                                        txPhy === BLEPHYType.BLE_GAP_PHY_2MBPS
                                    }
                                    onClick={() =>
                                        setTxPhy(BLEPHYType.BLE_GAP_PHY_2MBPS)
                                    }
                                    disabled={peerInitiated}
                                />
                            </div>
                            <div className="row">
                                <span className="col col-4">Reception:</span>
                                <ActionButton
                                    className="col col-3 mt-0"
                                    label="1 Mb/s"
                                    primary={
                                        linkedRxPhy ===
                                        BLEPHYType.BLE_GAP_PHY_1MBPS
                                    }
                                    disabled={linked || peerInitiated}
                                    onClick={() =>
                                        setRxPhy(BLEPHYType.BLE_GAP_PHY_1MBPS)
                                    }
                                />
                                <ActionButton
                                    className="col col-3 mt-0"
                                    label="2 Mb/s"
                                    primary={
                                        linkedRxPhy ===
                                        BLEPHYType.BLE_GAP_PHY_2MBPS
                                    }
                                    disabled={linked || peerInitiated}
                                    onClick={() =>
                                        setRxPhy(BLEPHYType.BLE_GAP_PHY_2MBPS)
                                    }
                                />
                            </div>
                        </div>
                        <div
                            className={`col pl-0 mdi mdi-${
                                linked ? 'link' : 'link-off'
                            }`}
                            onClick={() => setLinked(!linked)}
                            role="button"
                            tabIndex="0"
                        />
                    </div>
                </div>

                <div className="row-of-buttons">
                    <ActionButton
                        label={peerInitiated ? 'Accept' : 'Update'}
                        onClick={() =>
                            onUpdatePhy({
                                rxPhy: linkedRxPhy,
                                txPhy,
                            })
                        }
                        primary
                    />
                    <ActionButton
                        label={peerInitiated ? 'Disconnect' : 'Cancel'}
                        onClick={onCancelPhyUpdate}
                    />
                </div>
            </form>
        </div>
    );
};

PhyUpdateRequestEditor.propTypes = {
    event: PropTypes.instanceOf(Event).isRequired,
    onUpdatePhy: PropTypes.func.isRequired,
    onCancelPhyUpdate: PropTypes.func.isRequired,
};

export default PhyUpdateRequestEditor;
