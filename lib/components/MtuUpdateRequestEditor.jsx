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
import { useSelector } from 'react-redux';
import ActionButton from './ActionButton';

import { Event } from '../reducers/bleEventReducer';
import { BLEEventType } from '../actions/common';
import TextInput from './input/TextInput';
import { isInRange, validInputStyle, invalidInputStyle } from './ConnectionUpdateRequestEditor';

const { PEER_INITIATED_MTU_UPDATE } = BLEEventType;

const MTU_MIN = 23;
const MTU_MAX = 247;
const DL_MIN = 27;
const DL_MAX = 251;

const MtuUpdateRequestEditor = ({
    event: {
        type,
        requestedMtu,
        requestedDataLength,
        device,
    },
    onUpdateMtu,
    onCancelMtuUpdate,
}) => {
    const { address } = device;
    const peerInitiated = type === PEER_INITIATED_MTU_UPDATE;

    // eslint-disable-next-line no-underscore-dangle
    const sdApiVersion = useSelector(({ app }) => app
        .adapter.bleDriver.adapter._bleDriver.NRF_SD_BLE_API_VERSION);

    const [dataLength, setDataLength] = useState(
        sdApiVersion >= 5 ? requestedDataLength || DL_MAX : null,
    );
    const [mtu, setMtu] = useState(peerInitiated ? requestedMtu : device.mtu);

    const isMtuValid = isInRange(mtu, MTU_MIN, MTU_MAX);
    const isDataLengthValid = isInRange(dataLength, DL_MIN, DL_MAX);

    return (
        <div>
            <div className="event-header">
                <h4>MTU update for device {address}</h4>
            </div>
            <form className="form-horizontal">
                {(dataLength !== null) && (
                    <TextInput
                        style={isDataLengthValid ? validInputStyle : invalidInputStyle}
                        id={`dl_${address}`}
                        className="form-control nordic-form-control col col-10 pr-0"
                        onChange={({ target }) => {
                            setDataLength(parseInt(target.value, 10));
                        }}
                        type="number"
                        value={dataLength}
                        min={DL_MIN}
                        max={DL_MAX}
                        readOnly={peerInitiated}
                        label="Data length"
                        labelClassName="col-md-7 text-right"
                        wrapperClassName="col-md-5"
                    />
                )}
                { peerInitiated || (
                    <TextInput
                        style={isMtuValid ? validInputStyle : invalidInputStyle}
                        id={`mtu_${address}`}
                        className="form-control nordic-form-control col col-10 pr-0"
                        onChange={({ target }) => {
                            setMtu(parseInt(target.value, 10));
                        }}
                        type="number"
                        value={mtu}
                        min={MTU_MIN}
                        max={MTU_MAX}
                        readOnly={peerInitiated}
                        label="ATT MTU"
                        labelClassName="col-md-7 text-right"
                        wrapperClassName="col-md-5"
                    />
                )}

                <div className="row-of-buttons">
                    <ActionButton
                        label={peerInitiated ? 'Accept' : 'Update'}
                        onClick={() => onUpdateMtu(
                            peerInitiated ? undefined : mtu,
                            sdApiVersion >= 5 ? dataLength : undefined,
                        )}
                        primary
                    />
                    <ActionButton
                        label={peerInitiated ? 'Disconnect' : 'Cancel'}
                        onClick={onCancelMtuUpdate}
                    />
                </div>
            </form>
        </div>
    );
};

MtuUpdateRequestEditor.propTypes = {
    event: PropTypes.instanceOf(Event).isRequired,
    onUpdateMtu: PropTypes.func.isRequired,
    onCancelMtuUpdate: PropTypes.func.isRequired,
};

export default MtuUpdateRequestEditor;
