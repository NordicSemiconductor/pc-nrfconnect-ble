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
import Component from 'react-pure-render/component';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ConnectedDevice from '../components/ConnectedDevice';
import CentralDevice from '../components/CentralDevice';

import * as AdapterActions from '../actions/adapterActions';
import * as AdvertisingActions from '../actions/advertisingActions';
import * as BLEEventActions from '../actions/bleEventActions';

class ConnectionMap extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            adapter,
            connectedDevices,
            disconnectFromDevice,
            pairWithDevice,
            createUserInitiatedConnParamsUpdateEvent,
            showSetupDialog,
            toggleAdvertising,
            autoConnUpdate,
            toggleAutoConnUpdate,
        } = this.props;

        let central;
        let deviceNodes = [];

        if (adapter !== null && adapter.state.available && connectedDevices !== null) {
            const name = adapter.state.name;
            const address = adapter.state.address;

            central = (<CentralDevice id={adapter.instanceId + '_cmap'}
                name={name}
                address={address}
                advertising={adapter.state.advertising}
                onShowSetupDialog={showSetupDialog}
                onToggleAdvertising={toggleAdvertising}
                autoConnUpdate={autoConnUpdate}
                onToggleAutoConnUpdate={toggleAutoConnUpdate} />);

            connectedDevices.forEach((device, instanceId) => {
                deviceNodes.push(<ConnectedDevice id={instanceId + '_cmap'}
                    sourceId={adapter.instanceId + '_cmap'}
                    key={instanceId}
                    device={device}
                    layout='horizontal'
                    onDisconnect={() => disconnectFromDevice(device)}
                    onPair={() => pairWithDevice(device)}
                    onConnectionParamsUpdate={device => createUserInitiatedConnParamsUpdateEvent(device)}/>);
            });
        }

        return (
            <div id='diagramContainer' style={this.props.style} >
                {central}
                <div className='padded-column' style={{position: 'absolute', top: '20px', left: '400px'}}>
                    {deviceNodes}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const {
        adapter,
        advertising,
    } = state;

    const selectedAdapter = adapter.getIn(['adapters', adapter.selectedAdapter]);

    if (selectedAdapter === undefined) {
        return {
            adapter: null,
            connectedDevices: null,
            advertising: advertising,
            autoConnUpdate: adapter.autoConnUpdate,
        };
    } else {
        return {
            adapter: selectedAdapter,
            connectedDevices: selectedAdapter.connectedDevices,
            advertising: advertising,
            autoConnUpdate: adapter.autoConnUpdate,
        };
    }
}

function mapDispatchToProps(dispatch) {
    const retval = Object.assign(
        {},
        bindActionCreators(AdapterActions, dispatch),
        bindActionCreators(AdvertisingActions, dispatch),
        bindActionCreators(BLEEventActions, dispatch)
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
    advertising: PropTypes.object.isRequired,
    disconnectFromDevice: PropTypes.func.isRequired,
    pairWithDevice: PropTypes.func.isRequired,
    createUserInitiatedConnParamsUpdateEvent: PropTypes.func.isRequired,
    showSetupDialog: PropTypes.func.isRequired,
    toggleAdvertising: PropTypes.func.isRequired,
    setAdvertisingData: PropTypes.func.isRequired,
    toggleAutoConnUpdate: PropTypes.func.isRequired,
};
