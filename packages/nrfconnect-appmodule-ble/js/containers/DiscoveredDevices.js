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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as DiscoveryActions from '../actions/discoveryActions';
import * as AdapterActions from '../actions/adapterActions';

import DiscoveryButton from '../components/discoveryButton';
import DiscoveredDevice from '../components/DiscoveredDevice';
import { TextInput, Spinner } from 'nrfconnect-core';
import spinnerImage from 'nrfconnect-core/resources/ajax-loader.gif';
import { FormGroup, Checkbox } from 'react-bootstrap';

class DiscoveredDevices extends React.PureComponent {
    constructor(props) {
        super(props);

        const { toggleScan, clearDevicesList } = this.props;
        window.addEventListener('core:toggle-scan', () => { toggleScan(); });
        window.addEventListener('core:clear-scan', () => { clearDevicesList(); });
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
        } = this.props;

        this.discoveryOptions = this.props.discoveryOptions.toJS();

        const dirIcon = discoveryOptions.expanded ? 'icon-down-dir' : 'icon-right-dir';

        const discoveryOptionsDiv = discoveryOptions.expanded ?
            <div className='discovery-options'>
                <Checkbox className='adv-label'
                    defaultChecked={discoveryOptions.sortByRssi}
                    onChange={e => this.handleCheckedChange('sortByRssi', e)}>
                    Sort by signal strength
                </Checkbox>
                <TextInput inline title='Filter list by device name or address' label='Filter:' className='adv-value'
                           defaultValue={discoveryOptions.filterString} onChange={e => this.handleFilterChange(e)}
                           labelClassName='' wrapperClassName='' placeholder='Device name or address' />
            </div> : '';

        return (
            <div id='discoveredDevicesContainer'>
                <div>
                    <h4>
                        Discovered devices
                        <Spinner image={spinnerImage} visible={isScanning} />
                    </h4>
                </div>

                <div className='padded-row'>
                    <DiscoveryButton scanInProgress={isScanning} adapterIsConnecting={adapterIsConnecting} isAdapterAvailable={isAdapterAvailable} onScanClicked={() => toggleScan()} />
                    <button title='Clear list (Alt+C)' onClick={() => clearDevicesList()} type='button' className='btn btn-primary btn-sm btn-nordic padded-row'>
                        <span className='icon-trash' />Clear
                    </button>
                    <div className='discovery-options-expand' >
                        <span onClick={toggleOptionsExpanded}><i className={dirIcon} />Options</span>
                        {discoveryOptionsDiv}
                    </div>

                </div>

                <div style={{paddingTop: '0px'}}>
                    {   discoveredDevices.map((device, address) =>
                        {
                            return (
                                <DiscoveredDevice key={address}
                                    device={device}
                                    standalone={false}
                                    adapterIsConnecting={adapterIsConnecting}
                                    isConnecting={device.isConnecting}
                                    onConnect={device => connectToDevice(device)}
                                    onCancelConnect={() => cancelConnect()}
                                    onToggleExpanded={toggleExpanded} />
                            );
                        })
                    }
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { discovery, adapter } = state;

    let selectedAdapter = null;
    let adapterIsConnecting = false;
    let scanning = false;
    let adapterAvailable = false;

    if (adapter.selectedAdapter !== undefined && adapter.selectedAdapter !== null) {
        selectedAdapter = adapter.getIn(['adapters', adapter.selectedAdapter]);

        if (selectedAdapter && selectedAdapter.state) {
            adapterIsConnecting = selectedAdapter.state.connecting || false;
            scanning = selectedAdapter.state.scanning || false;
            adapterAvailable = selectedAdapter.state.available || false;
        }
    }

    return {
        discoveredDevices: discovery.devices,
        discoveryOptions: discovery.options,
        adapterIsConnecting: adapterIsConnecting,
        isScanning: scanning,
        isAdapterAvailable: adapterAvailable,
    };
}

function mapDispatchToProps(dispatch) {
    const retval = Object.assign(
            {},
            bindActionCreators(DiscoveryActions, dispatch),
            bindActionCreators(AdapterActions, dispatch)
        );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DiscoveredDevices);

DiscoveredDevices.propTypes = {
    discoveredDevices: PropTypes.object.isRequired,
    isAdapterAvailable: PropTypes.bool.isRequired,
    isScanning: PropTypes.bool.isRequired,
    adapterIsConnecting: PropTypes.bool.isRequired,
    clearDevicesList: PropTypes.func.isRequired,
    toggleScan: PropTypes.func.isRequired,
    connectToDevice: PropTypes.func.isRequired,
    cancelConnect: PropTypes.func.isRequired,
};
