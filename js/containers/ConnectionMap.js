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
            graph,
            adapter,
            disconnectFromDevice,
            bondWithDevice,
            updateDeviceConnectionParameters,
        } = this.props;

        let central;
        let connectedDevices = [];

        if (adapter !== null && adapter.state.available && graph !== null) {
            for (let i = 0; i < graph.size; i++) {
                let connectedDeviceCounter = 0;
                const node = graph.get(i);

                if (node.id === 'central') {
                    central = (<CentralDevice id={node.id} name={adapter.state.name} address={adapter.state.address.address} />);
                } else {
                    connectedDeviceCounter++;
                    connectedDevices.push(<ConnectedDevice id={node.id} sourceId="central" key={i} node={node} layout="horizontal" onDisconnect={() => disconnectFromDevice(node.device)} />);
                }
            }
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
            graph: null,
        };
    } else {
        return {
            adapter: selectedAdapter,
            graph: selectedAdapter.graph,
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
    graph: PropTypes.object,
    adapter: PropTypes.object,
    disconnectFromDevice: PropTypes.func.isRequired,
    bondWithDevice: PropTypes.func.isRequired,
    updateDeviceConnectionParameters: PropTypes.func.isRequired,
};
