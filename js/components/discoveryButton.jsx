/* Copyright (c) 2015 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

'use strict';

import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';

export default class DiscoveryButton extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            isAdapterAvailable,
            isConnecting,
            scanInProgress,
            onScanClicked
        } = this.props;

        let labelString;
        let iconName;
        let hoverText;

        if (scanInProgress) {
            labelString = 'Stop scan';
            iconName = 'icon-stop';
            hoverText = 'Stop scan (Alt+S)';
        } else {
            labelString = 'Start scan';
            iconName = 'icon-play';
            hoverText = 'Start scan (Alt+S)';
        }

        return (
            <button title={hoverText} className="btn btn-primary btn-sm btn-nordic padded-row" disabled= {!isAdapterAvailable || isConnecting} onClick={() => onScanClicked()}>
                <span className={iconName} />
                {labelString}
            </button>
        );
    }
}

DiscoveryButton.propTypes = {
    isAdapterAvailable: PropTypes.bool.isRequired,
    isConnecting: PropTypes.bool.isRequired,
    scanInProgress: PropTypes.bool.isRequired,
    onScanClicked: PropTypes.func.isRequired
};
