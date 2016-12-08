/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
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
import { List, Record } from 'immutable';


import Component from 'react-pure-render/component';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';


class QuickStartCont extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            pageView,
        } = this.props;


        return (
            <div>
                <h1>Quick Start</h1>
                <p><b> Plug in the nRF5x boards to the PC. </b></p>
                <p> The nRF5x boards currently supported are nRF51-Dongle (PCA10031) and nRF51-DK (PCA10028).
                (nRF52-DK support will be added at a later date)</p>
                <p> Attach only boards of the same type at the same time. Do not mix nRF51-DKs and nRF51-Dongles </p>
                <h2>Programming </h2>
                <p>Program all the boards with the Standard Gateway/Node firmware. </p>
                <h2>Initializing </h2>
                <p>Initialize all the boards by selecting all the nodes and clicking "Fill with default values" </p>
                <p> </p>
                <h2>Gateway Node </h2>
                <p>Select one of the boards as the Gateway Node </p>
                <p> You can control the state of an LED light on the board by setting the value 0 or 1 to Handle 0.</p>
                <p>Set the handle to 0 and the value to 1 to turn on the LED </p>
                <p> Set the handle to 0 and the value to 0 to turn off the LED</p>
                <p> The "handle" is like an address and we have setup the firmware to use handle 0 as the broadcast address.</p>
                <h2>Demo </h2>
                <p>Unplug all the boards from the PC except one.</p>
                <p> Plug them into a USB hub or USB charger so they get power but are not connected to the PC.</p>
                <p>Demonstrate by changing the value of Handle 0 to 0 or 1 and watch the LED change on all the boards you have configured. </p>
                <p> </p>

                <h2>DFU </h2>
                <p>Select the board type. The details for the selected board type (i.e. softdevice, application ID, version) are populated with defaults and will match the default firmware. </p>
                <p>If you change the firmware to be updated to a custom firmware then you need to put the right values for the softdevice, application and other components. </p>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const {
        meshPageSelector
    } = state;

    const pageView = meshPageSelector.get('selectedPage');
    return {
        pageView: pageView,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
        {},
    );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(QuickStartCont);

QuickStartCont.propTypes = {

};
