/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { DropdownButton, MenuItem } from 'react-bootstrap';

import * as AdapterActions from '../actions/adapterActions';
import * as FirmwareUpdateActions from '../actions/firmwareUpdateActions';
import ConfirmationDialog from '../components/ConfirmationDialog';

import uuidV4 from 'uuid-v4';

class AdapterSelector extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    focusOnComPorts() {
        const dropDown = ReactDOM.findDOMNode(this.refs.comPortDropdown);
        dropDown.firstChild.focus();
        dropDown.firstChild.click();
    }

    componentDidMount() {
        window.addEventListener('core:select-adapter', function () {
            this.focusOnComPorts();
        }.bind(this));
    }

    compareAdapterNodes(nodeA, nodeB) {
        if (!nodeA.props.eventKey || !nodeB.props.eventKey) { return 0; }

        const portA = nodeA.props.eventKey;
        const portB = nodeB.props.eventKey;

        // Trick: COM1 and COM10 sorts equally with regular sort, use length to differentiate them
        if (portA.length > portB.length) { return 1; }

        if (portA.length < portB.length) { return -1; }

        // Use regulart text comparison on names of equal length
        if (portA > portB) {
            return 1;
        } else if (portA < portB) {
            return -1;
        } else {
            return 0;
        }
    }

    createUpdateText(foundVersion, latestVersion) {
        let updateText;

        if (foundVersion) {
            updateText = `Detected firmware version ${foundVersion}.`;
        } else {
            updateText = `No connectivity firmware was detected.`;
        }

        updateText += ` Do you want to update to version ${latestVersion}?`;

        return updateText;
    }

    render() {
        const {
            adapters,
            adapterStatus,
            adapterIndicator,
        } = this.props.adapter;

        const {
            programAdapter,
            closeAdapter,
            firmwareUpdate,
            continueOpenDevice,
            updateFirmware,
        } = this.props;

        const {
            showingUpdateDialog,
            showProgress,
            foundVersion,
            latestVersion,
        } = firmwareUpdate;

        const adapterNodes = [];

        adapters.forEach((adapter, i) => {
            const { port, serialNumber } = adapter.state;
            const portDescription = [];
            portDescription.push(<div className='serialPort' key={uuidV4()}>{port}</div>);

            // Remove leading zeros and truncate long (DAPLINK) serial numbers
            const cleanSerial = serialNumber ? serialNumber.replace(/^0+/, '').substring(0, 10) : serialNumber;

            if (cleanSerial) {
                portDescription.push(<div className='serialSerialnumber' key={uuidV4()}>{cleanSerial}</div>);
            } else {
                portDescription.push(<div className='serialSerialnumber' key={uuidV4()}>&nbsp;</div>);
            }

            adapterNodes.push(<MenuItem className='btn-primary' eventKey={port} onSelect={() => programAdapter(port)} key={i}>{portDescription}</MenuItem>);
        });

        adapterNodes.sort(this.compareAdapterNodes);

        const selectedAdapter = this.props.adapter.api.selectedAdapter;

        if (selectedAdapter) {
            adapterNodes.push(<MenuItem className='btn-primary' onSelect={() => closeAdapter(selectedAdapter)} key={uuidV4()}>Close Adapter</MenuItem>);
        }

        return (
            <span title='Select serial port (Alt+P)'>
                <div className='padded-row'>
                    <DropdownButton id='navbar-dropdown' className='btn-primary btn-nordic' title={adapterStatus} ref='comPortDropdown'>
                        {adapterNodes}
                    </DropdownButton>
                    <div className={'indicator ' + adapterIndicator}></div>
                </div>
                <ConfirmationDialog show={showingUpdateDialog}
                                    onOk={updateFirmware}
                                    onCancel={continueOpenDevice}
                                    showProgress={showProgress}
                                    text={this.createUpdateText(foundVersion, latestVersion)}/>
            </span>
        );
    }
}

function mapStateToProps(state) {
    const { adapter, firmwareUpdate } = state;

    return {
        adapter: adapter,
        adapterStatus: adapter.adapterStatus,
        adapterIndicator: adapter.adapterIndicator,
        adapters: adapter.adapters,
        firmwareUpdate: firmwareUpdate,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
            {},
            bindActionCreators(AdapterActions, dispatch),
            bindActionCreators(FirmwareUpdateActions, dispatch)
        );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps)(AdapterSelector);

AdapterSelector.propTypes = {
    adapters: PropTypes.object.isRequired,
    adapterStatus: PropTypes.string.isRequired,
    openAdapter: PropTypes.func.isRequired,
    programAdapter: PropTypes.func.isRequired,
    closeAdapter: PropTypes.func.isRequired,
    firmwareUpdate: PropTypes.object.isRequired,
};
