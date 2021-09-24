/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

const DfuButton = props => {
    const { dfuInProgress, disabled, onClick } = props;

    let labelString;
    let iconName;

    if (dfuInProgress) {
        labelString = 'Stop DFU';
        iconName = 'mdi mdi-stop';
    } else {
        labelString = 'Start DFU';
        iconName = 'mdi mdi-play';
    }

    return (
        <Button
            variant="primary"
            disabled={disabled}
            className="btn-nordic pull-right"
            onClick={onClick}
        >
            <span className={iconName} />
            {labelString}
        </Button>
    );
};

DfuButton.propTypes = {
    dfuInProgress: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
};

export default DfuButton;
