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

/* eslint react/forbid-prop-types: off */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as DeviceDetailsActions from '../actions/deviceDetailsActions';
import * as AdvertisingActions from '../actions/advertisingActions';
import * as AdapterActions from '../actions/adapterActions';
import * as BLEEventActions from '../actions/bleEventActions';
import * as SecurityActions from '../actions/securityActions';
import * as DfuActions from '../actions/dfuActions';

import DeviceDetailsView from '../components/DeviceDetails';
import DfuDialog from './DfuDialog';

import withHotkey from '../utils/withHotkey';
import { getInstanceIds } from '../utils/api';
import { traverseItems, findSelectedItem } from './../common/treeViewKeyNavigation';

class DeviceDetailsContainer extends React.PureComponent {
    constructor(props) {
        super(props);

        this.moveUp = () => this.selectNextComponent(true);
        this.moveDown = () => this.selectNextComponent(false);
        this.moveRight = () => this.expandComponent(true);
        this.moveLeft = () => this.expandComponent(false);
    }

    componentDidMount() {
        const { bindHotkey } = this.props;
        bindHotkey('up', this.moveUp);
        bindHotkey('down', this.moveDown);
        bindHotkey('left', this.moveLeft);
        bindHotkey('right', this.moveRight);
    }

    selectNextComponent(backward) {
        const { deviceDetails, selectedComponent, selectComponent } = this.props;
        let foundCurrent = false;

        // eslint-disable-next-line no-restricted-syntax
        for (const item of traverseItems(deviceDetails, true, backward)) {
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

    expandComponent(expand) {
        const {
            deviceDetails,
            selectedComponent,
            setAttributeExpanded,
            selectComponent,
        } = this.props;

        if (!selectedComponent) {
            return;
        }

        const itemInstanceIds = getInstanceIds(selectedComponent);
        if (expand && itemInstanceIds.descriptor) {
            return;
        }

        const item = findSelectedItem(deviceDetails, selectedComponent);

        if (item) {
            if (expand && item.children && !item.children.size) {
                return;
            }

            if (expand && item.expanded && item.children.size) {
                this.selectNextComponent(false);
                return;
            }

            if (!expand && !item.expanded) {
                if (itemInstanceIds.characteristic) {
                    selectComponent(selectedComponent.split('.').slice(0, -1).join('.'));
                }

                return;
            }

            setAttributeExpanded(item, expand);
        }
    }

    render() {
        const {
            adapterState,
            selectedComponent,
            connectedDevices,
            deviceDetails,
            selectComponent,
            setAttributeExpanded,
            readCharacteristic,
            writeCharacteristic,
            readDescriptor,
            writeDescriptor,
            showSetupDialog,
            toggleAdvertising,
            disconnectFromDevice,
            // pairWithDevice,
            createUserInitiatedConnParamsUpdateEvent,
            createUserInitiatedPairingEvent,
            toggleAutoConnUpdate,
            autoConnUpdate,
            showSecurityParamsDialog,
            toggleAutoAcceptPairing,
            deleteBondInfo,
            security,
            openCustomUuidFile,
            showDfuDialog,
        } = this.props;

        const elemWidth = 250;
        const detailDevices = [];

        if (!adapterState) {
            return <div className="device-details-container" style={this.props.style} />;
        }

        // Details for connected adapter
        detailDevices.push(
            <DeviceDetailsView
                key={adapterState.instanceId}
                device={adapterState}
                selected={selectedComponent}
                deviceDetails={deviceDetails}
                onSelectComponent={selectComponent}
                onSetAttributeExpanded={setAttributeExpanded}
                onReadCharacteristic={readCharacteristic}
                onWriteCharacteristic={writeCharacteristic}
                onReadDescriptor={readDescriptor}
                onWriteDescriptor={writeDescriptor}
                onShowAdvertisingSetupDialog={showSetupDialog}
                onToggleAdvertising={toggleAdvertising}
                onToggleAutoConnUpdate={toggleAutoConnUpdate}
                autoConnUpdate={autoConnUpdate}
                onShowSecurityParamsDialog={showSecurityParamsDialog}
                onToggleAutoAcceptPairing={toggleAutoAcceptPairing}
                onDeleteBondInfo={deleteBondInfo}
                security={security}
                onOpenCustomUuidFile={openCustomUuidFile}
            />,
        );

        // Details for connected devices
        connectedDevices.forEach(device => {
            detailDevices.push(
                <DeviceDetailsView
                    key={device.instanceId}
                    adapter={adapterState}
                    device={device}
                    selected={selectedComponent}
                    deviceDetails={deviceDetails}
                    onShowDfuDialog={showDfuDialog}
                    onSelectComponent={selectComponent}
                    onSetAttributeExpanded={setAttributeExpanded}
                    onReadCharacteristic={readCharacteristic}
                    onWriteCharacteristic={writeCharacteristic}
                    onReadDescriptor={readDescriptor}
                    onWriteDescriptor={writeDescriptor}
                    onDisconnectFromDevice={disconnectFromDevice}
                    onPairWithDevice={createUserInitiatedPairingEvent}
                    onUpdateDeviceConnectionParams={createUserInitiatedConnParamsUpdateEvent}
                />,
            );
        });

        const perDevice = (20 + elemWidth);
        const width = (perDevice * detailDevices.length);

        // TODO: Fix better solution to right padding of scroll area than div box with border
        return (
            <div>
                <div className="device-details-container" style={this.props.style}>
                    <div style={{ width }}>
                        {detailDevices}
                        <div style={{ borderColor: 'transparent', borderLeftWidth: '20px', borderRightWidth: '0px', borderStyle: 'solid' }} />
                    </div>
                </div>
                <DfuDialog />
            </div>
        );
    }
}

function mapStateToProps(state) {
    const {
        adapter,
    } = state.app;

    const selectedAdapter = adapter.getIn(['adapters', adapter.selectedAdapterIndex]);

    if (!selectedAdapter) {
        return {};
    }

    return {
        adapterState: selectedAdapter.state,
        selectedComponent: (selectedAdapter.deviceDetails
            && selectedAdapter.deviceDetails.selectedComponent),
        connectedDevices: selectedAdapter.connectedDevices,
        deviceDetails: selectedAdapter.deviceDetails,
        autoConnUpdate: adapter.autoConnUpdate,
        security: selectedAdapter.security,
    };
}

function mapDispatchToProps(dispatch) {
    const retval = Object.assign(
        {},
        bindActionCreators(DeviceDetailsActions, dispatch),
        bindActionCreators(AdvertisingActions, dispatch),
        bindActionCreators(AdapterActions, dispatch),
        bindActionCreators(BLEEventActions, dispatch),
        bindActionCreators(SecurityActions, dispatch),
        bindActionCreators(DfuActions, dispatch),
    );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withHotkey(DeviceDetailsContainer));

DeviceDetailsContainer.propTypes = {
    adapterState: PropTypes.object,
    selectedComponent: PropTypes.string,
    deviceDetails: PropTypes.object,
    connectedDevices: PropTypes.object,
    // deviceServers: PropTypes.object,
    readCharacteristic: PropTypes.func.isRequired,
    writeCharacteristic: PropTypes.func.isRequired,
    readDescriptor: PropTypes.func.isRequired,
    writeDescriptor: PropTypes.func.isRequired,
    createUserInitiatedConnParamsUpdateEvent: PropTypes.func.isRequired,
    createUserInitiatedPairingEvent: PropTypes.func.isRequired,
    security: PropTypes.object,
    toggleAutoAcceptPairing: PropTypes.func.isRequired,
    deleteBondInfo: PropTypes.func.isRequired,
    showSecurityParamsDialog: PropTypes.func.isRequired,
    openCustomUuidFile: PropTypes.func.isRequired,
    selectComponent: PropTypes.func.isRequired,
    setAttributeExpanded: PropTypes.func.isRequired,
    showSetupDialog: PropTypes.func.isRequired,
    toggleAdvertising: PropTypes.func.isRequired,
    disconnectFromDevice: PropTypes.func.isRequired,
    toggleAutoConnUpdate: PropTypes.func.isRequired,
    autoConnUpdate: PropTypes.bool,
    showDfuDialog: PropTypes.func.isRequired,
    style: PropTypes.object.isRequired,
    bindHotkey: PropTypes.func.isRequired,
};

DeviceDetailsContainer.defaultProps = {
    adapterState: null,
    selectedComponent: null,
    deviceDetails: null,
    connectedDevices: null,
    security: null,
    autoConnUpdate: false,
};
