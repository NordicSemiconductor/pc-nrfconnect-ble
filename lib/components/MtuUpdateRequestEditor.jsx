/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint jsx-a11y/label-has-for: off */
/* eslint jsx-a11y/label-has-associated-control: off */

'use strict';

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { BLEEventType } from '../actions/common';
import { Event } from '../reducers/bleEventReducer';
import ActionButton from './ActionButton';
import {
    invalidInputStyle,
    isInRange,
    validInputStyle,
} from './ConnectionUpdateRequestEditor';
import TextInput from './input/TextInput';

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
