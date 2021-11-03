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

const { PEER_INITIATED_DATA_LENGTH_UPDATE } = BLEEventType;

const DL_MIN = 27;
const DL_MAX = 251;

const DataLengthUpdateRequestEditor = ({
    event: { type, requestedDataLength, device },
    onUpdateDataLength,
    onCancelDataLengthUpdate,
}) => {
    const { address } = device;
    const peerInitiated = type === PEER_INITIATED_DATA_LENGTH_UPDATE;
    const [dataLength, setDataLength] = useState(
        peerInitiated ? requestedDataLength : device.dataLength
    );
    const isDataLengthValid = isInRange(dataLength, DL_MIN, DL_MAX);

    return (
        <div>
            <div className="event-header">
                <h4>Data length update for device {address}</h4>
            </div>
            <form className="form-horizontal">
                <p className="mx-4">
                    Data length is the length of payload of link layer packets.
                    Its valid range is between {DL_MIN} and {DL_MAX} octets.
                </p>
                <TextInput
                    style={
                        isDataLengthValid ? validInputStyle : invalidInputStyle
                    }
                    id={`dl_${address}`}
                    className="form-control nordic-form-control col col-10 pr-0"
                    onChange={({ target }) =>
                        setDataLength(parseInt(target.value, 10))
                    }
                    type="number"
                    value={dataLength}
                    min={DL_MIN}
                    max={DL_MAX}
                    label="Data length"
                    labelClassName="col-md-7 text-right"
                    wrapperClassName="col-md-5"
                />

                <div className="row-of-buttons">
                    <ActionButton
                        label={peerInitiated ? 'Accept' : 'Update'}
                        onClick={() => onUpdateDataLength(dataLength)}
                        primary
                    />
                    <ActionButton
                        label={peerInitiated ? 'Disconnect' : 'Cancel'}
                        onClick={onCancelDataLengthUpdate}
                    />
                </div>
            </form>
        </div>
    );
};

DataLengthUpdateRequestEditor.propTypes = {
    event: PropTypes.instanceOf(Event).isRequired,
    onUpdateDataLength: PropTypes.func.isRequired,
    onCancelDataLengthUpdate: PropTypes.func.isRequired,
};

export default DataLengthUpdateRequestEditor;
