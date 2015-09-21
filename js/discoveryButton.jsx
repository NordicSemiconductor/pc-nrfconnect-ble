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

import React from 'react';
import Reflux from 'reflux';
import driverStore from './stores/bleDriverStore';
import DiscoveryActions from './actions/discoveryActions';

var DiscoveryButton = React.createClass({
    mixins: [Reflux.connect(driverStore, "driverStore")],
    buttonClicked: function(){
        if (this.props.scanInProgress) {
            DiscoveryActions.stopScan();
        } else {
            DiscoveryActions.startScan();
        }

    },

    render: function() {
        var labelString;
        var iconName;
        var hoverText;

        if (this.props.scanInProgress) {
            labelString = 'Stop scan';
            iconName = 'icon-stop';
            hoverText = 'Stop scan (Alt+S)';
         } else {
            labelString = 'Start scan';
            iconName = 'icon-play';
            hoverText = 'Start scan (Alt+S)';
        }

        return (
            <button title={hoverText} className="btn btn-primary btn-sm btn-nordic padded-row" disabled= {!this.state.driverStore.connectedToDriver || this.props.isConnecting} onClick={this.buttonClicked}>
            <span className={iconName} />
            {labelString}
            </button>
        );
    }
});

module.exports = DiscoveryButton;
