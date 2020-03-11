/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* eslint jsx-a11y/label-has-for: off */
/* eslint jsx-a11y/label-has-associated-control: off */

'use strict';

import PropTypes from 'prop-types';
import React, { useState } from 'react';
import ActionButton from './ActionButton';

import { Event } from '../reducers/bleEventReducer';
import { BLEPHYType } from '../actions/common';

const PhyUpdateRequestEditor = ({
    event: {
        id,
        device,
    },
    onUpdatePhyParams,
    onCancelUserInitiatedEvent,
}) => {
    const { address } = device;

    const [linked, setLinked] = useState(true);
    const [txPhy, setTxPhy] = useState(device.txPhy);
    const [rxPhy, setRxPhy] = useState(device.rxPhy);

    const linkedRxPhy = linked ? txPhy : rxPhy;

    /* eslint-disable jsx-a11y/click-events-have-key-events */
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
                                    primary={txPhy === BLEPHYType.BLE_GAP_PHY_1MBPS}
                                    onClick={() => setTxPhy(BLEPHYType.BLE_GAP_PHY_1MBPS)}
                                />
                                <ActionButton
                                    className="col col-3 mt-0"
                                    label="2 Mb/s"
                                    primary={txPhy === BLEPHYType.BLE_GAP_PHY_2MBPS}
                                    onClick={() => setTxPhy(BLEPHYType.BLE_GAP_PHY_2MBPS)}
                                />
                            </div>
                            <div className="row">
                                <span className="col col-4">Reception:</span>
                                <ActionButton
                                    className="col col-3 mt-0"
                                    label="1 Mb/s"
                                    primary={linkedRxPhy === BLEPHYType.BLE_GAP_PHY_1MBPS}
                                    disabled={linked}
                                    onClick={() => setRxPhy(BLEPHYType.BLE_GAP_PHY_1MBPS)}
                                />
                                <ActionButton
                                    className="col col-3 mt-0"
                                    label="2 Mb/s"
                                    primary={linkedRxPhy === BLEPHYType.BLE_GAP_PHY_2MBPS}
                                    disabled={linked}
                                    onClick={() => setRxPhy(BLEPHYType.BLE_GAP_PHY_2MBPS)}
                                />
                            </div>
                        </div>
                        <div
                            className={`col pl-0 mdi mdi-${linked ? 'link' : 'link-off'}`}
                            onClick={() => setLinked(!linked)}
                            role="button"
                            tabIndex="0"
                        />
                    </div>
                </div>

                <div className="row-of-buttons">
                    <ActionButton
                        label="Update"
                        onClick={() => onUpdatePhyParams(
                            device,
                            {
                                tx_phys: txPhy,
                                rx_phys: linkedRxPhy,
                            },
                        )}
                        primary
                    />
                    <ActionButton label="Cancel" onClick={() => onCancelUserInitiatedEvent(id)} />
                </div>
            </form>
        </div>
    );
};

PhyUpdateRequestEditor.propTypes = {
    event: PropTypes.instanceOf(Event).isRequired,
    onUpdatePhyParams: PropTypes.func.isRequired,
    onCancelUserInitiatedEvent: PropTypes.func.isRequired,
};

export default PhyUpdateRequestEditor;
