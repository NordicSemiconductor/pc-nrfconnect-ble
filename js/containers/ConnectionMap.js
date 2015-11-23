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

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ConnectedDevice from '../components/ConnectedDevice';
import CentralDevice from '../components/CentralDevice';

import * as AdapterActions from '../actions/adapterActions';

class ConnectionMap extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            adapter,
            connectedDevices,
            disconnectFromDevice,
            bondWithDevice,
            updateDeviceConnectionParameters,
        } = this.props;

        let central;
        let deviceNodes = [];

        if (adapter !== null && adapter.get('state').available && connectedDevices !== null) {
            let name = adapter.getIn(['state', 'name']);
            let address = adapter.getIn(['state', 'address']);

            if (!name) {
                name = '<Unkown name>';
            }

            if (!address) {
                address = '<Unkown address>';
            }

            central = (<CentralDevice id={adapter.instanceId + '_cmap'} name={name} address={address} />);

            connectedDevices.forEach((device, instanceId) => {
                deviceNodes.push(<ConnectedDevice id={instanceId + '_cmap'} sourceId={adapter.instanceId + '_cmap'} key={instanceId} device={device} layout="horizontal" onDisconnect={() => disconnectFromDevice(device)} />);
            });
        }

        return (
            <div id="diagramContainer" style={this.props.style} >
                {central}
                <div className="padded-column" style={{position: 'absolute', top: '20px', left: '400px'}}>
                    {connectedDevices}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { adapter } = state;

    const selectedAdapter = adapter.adapters[adapter.selectedAdapter];

    if (selectedAdapter === undefined) {
        return {
            adapter: null,
            connectedDevices: null,
        };
    } else {
        return {
            adapter: selectedAdapter,
            connectedDevices: selectedAdapter.connectedDevices,
        };
    }
}

function mapDispatchToProps(dispatch) {
    const retval = Object.assign(
        {},
        bindActionCreators(AdapterActions, dispatch)
    );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ConnectionMap);

ConnectionMap.propTypes = {
    connectedDevices: PropTypes.object,
    adapter: PropTypes.object,
    disconnectFromDevice: PropTypes.func.isRequired,
    bondWithDevice: PropTypes.func.isRequired,
    updateDeviceConnectionParameters: PropTypes.func.isRequired,
};
