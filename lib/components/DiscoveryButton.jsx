/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

import withHotkey from '../utils/withHotkey';

const DiscoveryButton = props => {
    const {
        isAdapterAvailable,
        adapterIsConnecting,
        scanInProgress,
        onScanClicked,
        bindHotkey,
    } = props;

    let labelString;
    let iconName;
    let hoverText;

    if (scanInProgress) {
        labelString = 'Stop scan';
        iconName = 'mdi mdi-stop';
        hoverText = 'Stop scan (Alt+S)';
    } else {
        labelString = 'Start scan';
        iconName = 'mdi mdi-play';
        hoverText = 'Start scan (Alt+S)';
    }

    bindHotkey('alt+s', onScanClicked);

    return (
        <Button
            title={hoverText}
            className="btn btn-primary btn-nordic"
            disabled={!isAdapterAvailable || adapterIsConnecting}
            type="button"
            onClick={onScanClicked}
        >
            <span className={iconName} />
            <span>{labelString}</span>
        </Button>
    );
};

DiscoveryButton.propTypes = {
    isAdapterAvailable: PropTypes.bool.isRequired,
    adapterIsConnecting: PropTypes.bool.isRequired,
    scanInProgress: PropTypes.bool.isRequired,
    onScanClicked: PropTypes.func.isRequired,
    bindHotkey: PropTypes.func.isRequired,
};

export default withHotkey(DiscoveryButton);
