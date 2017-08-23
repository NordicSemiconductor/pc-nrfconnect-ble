/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Checkbox } from 'react-bootstrap';
import { OrderedMap } from 'immutable';

import { DiscoveryOptions } from '../reducers/discoveryReducer';

import * as DiscoveryActions from '../actions/discoveryActions';
import * as AdapterActions from '../actions/adapterActions';

import DiscoveryButton from '../components/DiscoveryButton';
import DiscoveredDevice from '../components/DiscoveredDevice';
import TextInput from '../components/input/TextInput';
import Spinner from '../components/Spinner';

import withHotkey from '../utils/withHotkey';

class DiscoveredDevices extends React.PureComponent {
    constructor(props) {
        super(props);

        const { toggleScan, clearDevicesList } = this.props;
        window.addEventListener('core:toggle-scan', toggleScan);
        window.addEventListener('core:clear-scan', clearDevicesList);

        this.handleFilterChange = this.handleFilterChange.bind(this);
        this.handleSortByRssiCheckedChange = this.handleCheckedChange.bind(this, 'sortByRssi');
    }

    handleCheckedChange(property, e) {
        this.discoveryOptions[property] = e.target.checked;
        this.props.setDiscoveryOptions(this.discoveryOptions);
    }

    handleFilterChange(e) {
        this.discoveryOptions.filterString = e.target.value;
        this.props.setDiscoveryOptions(this.discoveryOptions);
    }

    handleOptionsExpanded() {
        this.props.toggleOptionsExpanded();
    }

    render() {
        const {
            discoveredDevices,
            discoveryOptions,
            isScanning,
            adapterIsConnecting,
            isAdapterAvailable,
            clearDevicesList,
            toggleScan,
            connectToDevice,
            cancelConnect,
            toggleExpanded,
            toggleOptionsExpanded,
            bindHotkey,
        } = this.props;

        bindHotkey('alt+c', clearDevicesList);

        this.discoveryOptions = this.props.discoveryOptions.toJS();

        const dirIcon = discoveryOptions.expanded ? 'icon-down-dir' : 'icon-right-dir';

        const discoveryOptionsDiv = discoveryOptions.expanded ? (
            <div className="discovery-options">
                <Checkbox
                    className="adv-label"
                    defaultChecked={discoveryOptions.sortByRssi}
                    onChange={this.handleSortByRssiCheckedChange}
                >
                    Sort by signal strength
                </Checkbox>
                <TextInput
                    inline
                    title="Filter list by device name or address"
                    label="Filter:"
                    className="adv-value"
                    value={discoveryOptions.filterString}
                    onChange={this.handleFilterChange}
                    labelClassName=""
                    wrapperClassName=""
                    placeholder="Device name or address"
                />
            </div>
        ) : null;

        return (
            <div id="discoveredDevicesContainer">
                <div>
                    <h4>
                        Discovered devices
                        <Spinner visible={isScanning} />
                    </h4>
                </div>

                <div className="padded-row">
                    <DiscoveryButton
                        scanInProgress={isScanning}
                        adapterIsConnecting={adapterIsConnecting}
                        isAdapterAvailable={isAdapterAvailable}
                        onScanClicked={toggleScan}
                    />
                    <button
                        title="Clear list (Alt+C)"
                        onClick={clearDevicesList}
                        type="button"
                        className="btn btn-primary btn-sm btn-nordic padded-row"
                    >
                        <span className="icon-trash" />Clear
                    </button>
                    <div className="discovery-options-expand">
                        <span onClick={toggleOptionsExpanded} role="button" tabIndex={0}>
                            <i className={dirIcon} />Options
                        </span>
                        {discoveryOptionsDiv}
                    </div>

                </div>

                <div style={{ paddingTop: '0px' }}>
                    {
                        discoveredDevices.valueSeq().map((device, address) => {
                            const key = `${address}`;
                            return (
                                <DiscoveredDevice
                                    key={key}
                                    device={device}
                                    standalone={false}
                                    adapterIsConnecting={adapterIsConnecting}
                                    isConnecting={device.isConnecting}
                                    onConnect={connectToDevice}
                                    onCancelConnect={cancelConnect}
                                    onToggleExpanded={toggleExpanded}
                                />
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { discovery, adapter } = state.app;

    let selectedAdapter = null;
    let adapterIsConnecting = false;
    let scanning = false;
    let adapterAvailable = false;

    if (adapter.selectedAdapterIndex !== null) {
        selectedAdapter = adapter.getIn(['adapters', adapter.selectedAdapterIndex]);

        if (selectedAdapter && selectedAdapter.state) {
            adapterIsConnecting = selectedAdapter.state.connecting || false;
            scanning = selectedAdapter.state.scanning || false;
            adapterAvailable = selectedAdapter.state.available || false;
        }
    }

    return {
        discoveredDevices: discovery.devices,
        discoveryOptions: discovery.options,
        adapterIsConnecting,
        isScanning: scanning,
        isAdapterAvailable: adapterAvailable,
    };
}

function mapDispatchToProps(dispatch) {
    const retval = Object.assign(
            {},
            bindActionCreators(DiscoveryActions, dispatch),
            bindActionCreators(AdapterActions, dispatch),
        );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withHotkey(DiscoveredDevices));

DiscoveredDevices.propTypes = {
    discoveredDevices: PropTypes.instanceOf(OrderedMap),
    isAdapterAvailable: PropTypes.bool,
    isScanning: PropTypes.bool,
    adapterIsConnecting: PropTypes.bool,
    clearDevicesList: PropTypes.func.isRequired,
    toggleScan: PropTypes.func.isRequired,
    connectToDevice: PropTypes.func.isRequired,
    cancelConnect: PropTypes.func.isRequired,
    bindHotkey: PropTypes.func.isRequired,
    setDiscoveryOptions: PropTypes.func.isRequired,
    toggleOptionsExpanded: PropTypes.func.isRequired,
    toggleExpanded: PropTypes.func.isRequired,
    discoveryOptions: PropTypes.instanceOf(DiscoveryOptions),
};

DiscoveredDevices.defaultProps = {
    discoveryOptions: { expanded: true },
    discoveredDevices: [],
    isAdapterAvailable: true,
    isScanning: false,
    adapterIsConnecting: false,
};
