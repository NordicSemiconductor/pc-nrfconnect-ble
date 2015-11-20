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

import DeviceDetailsView from '../components/deviceDetails';

class DeviceDetailsContainer extends Component {
    constructor(props) {
        super(props);
    }

    _onSelectedComponent(selectedComponent) {
        const {selectComponent} = this.props;
        selectComponent(selectedComponent);
    }

    render() {
        const {
            selectedComponent,
            devices,
            adapterState,
            selectComponent,
        } = this.props;
        const elemWidth = 250;
        const detailNodes = [];

        console.log(adapterState);

        if (!adapterState) {
            return;
        }

        detailNodes.push(<DeviceDetailsView key={0}
                                            selectedComponent={this.props.selectedComponent}
                                            onSelectedComponent={this._onSelectedComponent}
                                            node={adapterState}
                                            containerHeight={this.props.style.height}
                                            />
        );

        devices.forEach((value, key) => {
            console.log(value);
            console.log(key);
        });
            /*
            if (node.id === 'central') {
                return <DeviceDetailsView key={i}
                                          selectedComponent={this.props.selectedComponent}
                                          onSelectedComponent={this._onSelectedComponent}
                                          node={node}
                                          device={node.device}
                                          containerHeight={this.props.style.height}
                                          />;
            } else {
                //TODO: check if there is some database present?
                if (true) {
                    var deviceGattDatabase = this.state.gattDatabases.getGattDatabase(node.device.connection.conn_handle);
                    return <DeviceDetailsView key={i}
                                              selectedComponent={this.props.selectedComponent}
                                              onSelectedComponent={this._onSelectedComponent}
                                              node={node}
                                              device={node.device}
                                              containerHeight={this.props.style.height}
                                              isEnumeratingServices={this.state.isEnumeratingServices}
                                              gattDatabase={deviceGattDatabase}
                                              />;
                }
            }
            */

        var perNode = (20 + elemWidth);
        var width = (perNode * detailNodes.length);
        return (<div className="device-details-container" style={this.props.style}>
                    <div style={{width: width}}>
                        {detailNodes}
                    </div>
                </div>);
    }
}

function mapStateToProps(state) {
    const {
        deviceDetails,
        adapter,
    } = state;

    const selectedAdapter = adapter.adapters[adapter.selectedAdapter];

    return {
        adapterState: selectedAdapter.state,
        selectedComponent: deviceDetails.selectedComponent,
        connectedDevices: selectedAdapter.connectedDevices,
        deviceServers: deviceDetails.deviceServers,
    };
};

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
            {},
            bindActionCreators(DeviceDetailsActions, dispatch),
        );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DeviceDetailsContainer);

DeviceDetailsContainer.propTypes = {
    adapterState: PropTypes.object,
    selectedComponent: PropTypes.object,
    connectedDevices: PropTypes.object,
    deviceServers: PropTypes.object,
    selectComponent: PropTypes.func.isRequired,
};
