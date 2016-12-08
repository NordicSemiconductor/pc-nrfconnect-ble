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

import * as DeviceDetailsActions from '../../actions/deviceDetailsActions';
import * as AdapterActions from '../../actions/mesh/meshAdapterActions';

import DeviceDetailsView from '../../components/mesh/MeshDeviceDetails';
import { traverseItems } from './../../common/treeViewKeyNavigation';

class DeviceDetailsContainer extends Component {
    constructor(props) {
        super(props);
    }

    _selectNextComponent(backward) {
        const {
            deviceDetails,
            selectedComponent,
            selectComponent,
        } = this.props;
        let foundCurrent = false;

        for (let item of traverseItems(deviceDetails, true, backward)) {
            if (selectedComponent === null) {
                if (item !== null) {
                    selectComponent(item.instanceId);
                    return;
                }
            }

            if (item.instanceId === selectedComponent) {
                foundCurrent = true;
            } else if (foundCurrent) {
                selectComponent(item.instanceId);
                return;
            }
        }
    }


    render() {
        const {
            adapterState,
            selectedComponent,
            connectedDevices,
            deviceDetails,
            selectComponent,
            openAdapter,
            generalMesh,
            expandSlot,
            getHandleValue,
            enableHandle,
            expandSlotValues,
            initValues,
            firmwareVersion,
            startBroadcast,
            radioReset,
            initDevice,
            isInitialized,
            toggleVisibilityHandleTable,
            isHandleTableVisible,
            isBroadcasting,
        } = this.props;

        if (!adapterState) {
            return (<div className='device-details-container' style={this.props.style} >
                <span className="spinner">
                    <i className="icon-arrows-cw"></i>
                </span>
            </div>);
        }

        return (
            <div className='device-details-container' >
                <div >
                    <DeviceDetailsView
                        firmwareVersion={firmwareVersion}
                        initDevice={(channel, min, adr) => { initDevice(channel, min, adr); } }
                        initValues={initValues}
                        isInitialized={isInitialized}
                        generalMesh={(handle, message) => { generalMesh(handle, message); } }
                        expandSlotValues={expandSlotValues}
                        getHandleValue={getHandleValue}
                        enableHandle={enableHandle}
                        serialNumber={adapterState.serialNumber}
                        style={this.props.style}
                        expandSlot={(value) => { expandSlot(value); } }
                        startBroadcast={(value) => { startBroadcast(value); } }
                        radioReset={radioReset}
                        toggleVisibilityHandleTable={toggleVisibilityHandleTable}
                        isHandleTableVisible={isHandleTableVisible}
                        isBroadcasting={isBroadcasting}
                        />
                    <div />
                </div>

            </div>
        );
    }
}

function mapStateToProps(state) {
    const {
        adapter,
        meshMain,
    } = state;
    const isHandleTableVisible = (meshMain.get('isHandleTableVisible') !== undefined) ? meshMain.get('isHandleTableVisible') : false;
    const selectedAdapter = adapter.getIn(['adapters', adapter.selectedAdapter]);
    const expandSlotValue0 = (meshMain.getIn(['expandSlot', 0]) !== undefined) ? meshMain.getIn(['expandSlot', 0]) : false;
    const expandSlotValue1 = (meshMain.getIn(['expandSlot', 1]) !== undefined) ? meshMain.getIn(['expandSlot', 1]) : false;
    const expandSlotValue2 = (meshMain.getIn(['expandSlot', 2]) !== undefined) ? meshMain.getIn(['expandSlot', 2]) : false;
    const expandSlotValue3 = (meshMain.getIn(['expandSlot', 3]) !== undefined) ? meshMain.getIn(['expandSlot', 3]) : false;
    const expandSlotValue4 = (meshMain.getIn(['expandSlot', 4]) !== undefined) ? meshMain.getIn(['expandSlot', 4]) : false;
    const initValues = meshMain.get('initValues');
    const firmwareVersion = meshMain.get('firmwareVersion');
    const isInitialized = meshMain.get('isInitialized');
    const isBroadcasting = meshMain.get('isBroadcasting')
    let expandSlotValues = List.of(expandSlotValue0, expandSlotValue1, expandSlotValue2, expandSlotValue3, expandSlotValue4);

    if (!selectedAdapter) {
        return {};
    }

    return {
        initValues: initValues,
        isBroadcasting: isBroadcasting,
        isHandleTableVisible: isHandleTableVisible,
        isInitialized: isInitialized,
        expandSlotValues: expandSlotValues,
        firmwareVersion: firmwareVersion,
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
        bindActionCreators(AdapterActions, dispatch),
    );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DeviceDetailsContainer);

DeviceDetailsContainer.propTypes = {
    adapterState: PropTypes.object,
    connectedDevices: PropTypes.object,
    deviceDetails: PropTypes.object,
    selectedComponent: PropTypes.string,
};
