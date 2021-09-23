/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import PropTypes from 'prop-types';

const Spinner = props => {
    const { size, visible, className, onWhite } = props;
    const style = {
        visibility: visible ? 'visible' : 'hidden',
        width: size,
        height: size,
    };
    return (
        <div
            className={className + (onWhite ? ' on-white' : '')}
            style={style}
        />
    );
};

Spinner.propTypes = {
    size: PropTypes.number,
    visible: PropTypes.bool,
    className: PropTypes.string,
    onWhite: PropTypes.bool,
};

Spinner.defaultProps = {
    size: 16,
    visible: false,
    className: 'spinner',
    onWhite: false,
};

export default Spinner;
