/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import Spinner from './Spinner';

const EnumeratingAttributes = props => {
    const barList = [];

    for (let i = 0; i < props.bars; i += 1) {
        const key = `bar${i + 1}`;
        barList.push(<div key={key} className={key} />);
    }

    return (
        <div className="enumerating-items-wrap">
            {barList}
            <div className="enumerating-content">
                <Spinner
                    onWhite
                    visible
                    className="spinner center-block"
                    size={20}
                />
            </div>
        </div>
    );
};

EnumeratingAttributes.propTypes = {
    bars: PropTypes.number.isRequired,
};

export default EnumeratingAttributes;
