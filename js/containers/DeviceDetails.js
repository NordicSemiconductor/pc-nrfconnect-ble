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

import * as DeviceDetailsActions from '../actions/deviceDetailsActions';
import * as AdvertisingSetupActions from '../actions/advertisingSetupActions';
import * as AdapterActions from '../actions/adapterActions';

import DeviceDetailsView from '../components/deviceDetails';

class DeviceDetailsContainer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            adapterState,
            selectedComponent,
            connectedDevices,
            deviceDetails,
            selectComponent,
            toggleAttributeExpanded,
            readCharacteristic,
            writeCharacteristic,
            readDescriptor,
            writeDescriptor,
            showSetupDialog,
            toggleAdvertising,
            disconnectFromDevice,
            pairWithDevice,
            updateDeviceConnectionParams,
        } = this.props;
        const elemWidth = 250;
        const detailDevices = [];

        if (!adapterState) {
            return <div className='device-details-container' style={this.props.style} />;
        }

        // Adapter device
        detailDevices.push(<DeviceDetailsView key={adapterState.instanceId}
                                              device={adapterState}
                                              selected={selectedComponent}
                                              onSelectComponent={selectComponent}
                                              onToggleAttributeExpanded={toggleAttributeExpanded}
                                              onShowAdvertisingSetupDialog={showSetupDialog}
                                              onToggleAdvertising={toggleAdvertising}
                                              containerHeight={this.props.style.height}
                                              />
        );

        connectedDevices.forEach(device => {
            detailDevices.push(<DeviceDetailsView key={device.instanceId}
                                                  adapter = {adapterState}
                                                  device={device}
                                                  selected={selectedComponent}
                                                  deviceDetails={deviceDetails}
                                                  onSelectComponent={selectComponent}
                                                  onToggleAttributeExpanded={toggleAttributeExpanded}
                                                  onReadCharacteristic={readCharacteristic}
                                                  onWriteCharacteristic={writeCharacteristic}
                                                  onReadDescriptor={readDescriptor}
                                                  onWriteDescriptor={writeDescriptor}
                                                  onDisconnectFromDevice={disconnectFromDevice}
                                                  onPairWithDevice={pairWithDevice}
                                                  onUpdateDeviceConnectionParams={updateDeviceConnectionParams}
                                                  containerHeight={this.props.style.height}
                                                  />
            );
        });

        const perDevice = (20 + elemWidth);
        const width = (perDevice * detailDevices.length);
        return (<div className='device-details-container' style={this.props.style}>
                    <div style={{width: width}}>
                        {detailDevices}
                    </div>
                </div>);
    }
}

function mapStateToProps(state) {
    const selectedAdapter = state.adapter.adapters[state.adapter.selectedAdapter];

    if (!selectedAdapter) {
        return {};
    }

    return {
        adapterState: selectedAdapter.state,
        selectedComponent: selectedAdapter.deviceDetails && selectedAdapter.deviceDetails.selectedComponent,
        connectedDevices: selectedAdapter.connectedDevices,
        deviceDetails: selectedAdapter.deviceDetails,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
            {},
            bindActionCreators(DeviceDetailsActions, dispatch),
            bindActionCreators(AdvertisingSetupActions, dispatch),
            bindActionCreators(AdapterActions, dispatch)
        );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DeviceDetailsContainer);

DeviceDetailsContainer.propTypes = {
    adapterState: PropTypes.object,
    selectedComponent: PropTypes.string,
    connectedDevices: PropTypes.object,
    deviceServers: PropTypes.object,
    selectComponent: PropTypes.func.isRequired,
    readCharacteristic: PropTypes.func.isRequired,
    writeCharacteristic: PropTypes.func.isRequired,
    readDescriptor: PropTypes.func.isRequired,
    writeDescriptor: PropTypes.func.isRequired,
};
