/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const AddNewItem = ({ bars: propBars, onClick, text }) => (
    <div
        className="add-new"
        onClick={onClick}
        onKeyDown={onClick}
        role="button"
        tabIndex={0}
    >
        {Array(propBars)
            .fill(1)
            .map((_, i) => (
                <div className={`bar${i + 1}`} key={`${i + 1}`} />
            ))}
        <div className="content-wrap">
            <div className="content padded-row">
                <span className="icon-wrap">
                    <i className="icon-slim mdi mdi-plus-circle" />
                </span>
                <span>{text}</span>
            </div>
        </div>
    </div>
);

AddNewItem.propTypes = {
    bars: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default AddNewItem;
