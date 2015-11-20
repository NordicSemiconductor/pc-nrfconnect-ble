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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as DiscoveryActions from '../actions/discoveryActions';
import * as AdapterActions from '../actions/adapterActions';

import DiscoveryButton from '../components/discoveryButton';
import DiscoveredDevice from '../components/discoveredDevice';

class DiscoveredDevices extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            discoveredDevices,
            isScanning,
            adapterIsConnecting,
            isAdapterAvailable,
            clearDevicesList,
            toggleScan,
            connectToDevice,
            cancelConnect,
        } = this.props;

        const progressStyle = {
            visibility: isScanning ? 'visible' : 'hidden',
        };

        return (
            <div id="discoveredDevicesContainer">
                <div>
                    <h4>
                        Discovered devices
                        <img className="spinner" src="resources/ajax-loader.gif" height="16" width="16" style={progressStyle} />
                    </h4>
                </div>

                <div className="padded-row">
                    <DiscoveryButton scanInProgress={isScanning} adapterIsConnecting={adapterIsConnecting} isAdapterAvailable={isAdapterAvailable} onScanClicked={() => toggleScan()} />
                    <button title="Clear list (Alt+C)" onClick={() => clearDevicesList()} type="button" className="btn btn-primary btn-sm btn-nordic padded-row">
                        <span className="icon-trash" />Clear
                    </button>
                </div>

                <div style={{paddingTop: '0px'}}>
                    {   discoveredDevices.map((device, address) => {
                            return (
                                <DiscoveredDevice key={ 'dev-' + address }
                                    device={device}
                                    standalone={false}
                                    adapterIsConnecting={adapterIsConnecting}
                                    isConnecting={device.isConnecting}
                                    onConnect={(device) => connectToDevice(device)}
                                    onCancelConnect={() => cancelConnect()} />
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
        selectedAdapter = adapter.adapters[adapter.selectedAdapter];

        if (selectedAdapter && selectedAdapter.state) {
            adapterIsConnecting = selectedAdapter.state.connecting || false;
            scanning = selectedAdapter.state.scanning || false;
            adapterAvailable = selectedAdapter.state.available || false;
        }
    }

    return {
        discoveredDevices: discovery.devices,
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
