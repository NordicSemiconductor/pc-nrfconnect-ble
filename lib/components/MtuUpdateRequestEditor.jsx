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
import { BLEEventType } from '../actions/common';
import TextInput from './input/TextInput';
import {
    isInRange,
    validInputStyle,
    invalidInputStyle,
} from './ConnectionUpdateRequestEditor';

const { PEER_INITIATED_MTU_UPDATE } = BLEEventType;

const MTU_MIN = 23;
const MTU_MAX = 247;

const MtuUpdateRequestEditor = ({
    event: { type, requestedMtu, device },
    onUpdateMtu,
    onAcceptMtu,
    onCancelMtuUpdate,
}) => {
    const { address } = device;
    const peerInitiated = type === PEER_INITIATED_MTU_UPDATE;
    const [mtu, setMtu] = useState(peerInitiated ? requestedMtu : device.mtu);
    const isMtuValid = isInRange(mtu, MTU_MIN, MTU_MAX);

    return (
        <div>
            <div className="event-header">
                <h4>MTU update for device {address}</h4>
            </div>
            <form className="form-horizontal">
                <p className="mx-4">
                    ATT Maximum Transmission Unit (MTU) is the maximum length of
                    an ATT packet. Its valid range is between {MTU_MIN} and{' '}
                    {MTU_MAX} octets.
                </p>
                <p className="mx-4">This value can only be changed once.</p>
                <TextInput
                    style={isMtuValid ? validInputStyle : invalidInputStyle}
                    id={`mtu_${address}`}
                    className="form-control nordic-form-control col col-10 pr-0"
                    onChange={({ target }) =>
                        setMtu(parseInt(target.value, 10))
                    }
                    type="number"
                    value={mtu}
                    min={MTU_MIN}
                    max={MTU_MAX}
                    readOnly={peerInitiated}
                    label="ATT MTU"
                    labelClassName="col-md-7 text-right"
                    wrapperClassName="col-md-5"
                />

                <div className="row-of-buttons">
                    {peerInitiated && (
                        <ActionButton
                            label="Accept"
                            onClick={() => onAcceptMtu(mtu)}
                            primary
                        />
                    )}
                    {peerInitiated || (
                        <ActionButton
                            label="Update"
                            onClick={() => onUpdateMtu(mtu)}
                            primary
                        />
                    )}
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
    onAcceptMtu: PropTypes.func.isRequired,
    onCancelMtuUpdate: PropTypes.func.isRequired,
};

export default MtuUpdateRequestEditor;
