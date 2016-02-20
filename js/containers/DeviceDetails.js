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
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as DeviceDetailsActions from '../actions/deviceDetailsActions';
import * as AdvertisingSetupActions from '../actions/advertisingSetupActions';
import * as AdapterActions from '../actions/adapterActions';
import * as BLEEventActions from '../actions/bleEventActions';

import DeviceDetailsView from '../components/deviceDetails';

import { getInstanceIds } from '../utils/api';
import { traverseItems, findSelectedItem } from './../common/treeViewKeyNavigation';

class DeviceDetailsContainer extends Component {
    constructor(props) {
        super(props);

        this.moveUp = () => this._selectNextComponent(true);
        this.moveDown = () => this._selectNextComponent(false);
        this.moveRight = () => this._expandComponent(true);
        this.moveLeft = () => this._expandComponent(false);
    }

    componentDidMount() {
        this._registerKeyboardShortcuts();
    }

    componentWillUnmount() {
        this._unregisterKeyboardShortcuts();
    }

    _registerKeyboardShortcuts() {
        window.addEventListener('core:move-down', this.moveDown);
        window.addEventListener('core:move-up', this.moveUp);
        window.addEventListener('core:move-right', this.moveRight);
        window.addEventListener('core:move-left', this.moveLeft);
    }

    _unregisterKeyboardShortcuts() {
        window.removeEventListener('core:move-down', this.moveDown);
        window.removeEventListener('core:move-up', this.moveUp);
        window.removeEventListener('core:move-right', this.moveRight);
        window.removeEventListener('core:move-left', this.moveLeft);
    }

    _selectNextComponent(backward) {
        const { deviceDetails, selectedComponent, selectComponent } = this.props;
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

    _expandComponent(expand) {
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
                this._selectNextComponent(false);
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
            pairWithDevice,
            createUserInitiatedConnParamsUpdateEvent,
            toggleAutoConnUpdate,
            autoConnUpdate,
        } = this.props;

        const elemWidth = 250;
        const detailDevices = [];

        if (!adapterState) {
            return <div className='device-details-container' style={this.props.style} />;
        }

        // Details for connected adapter
        detailDevices.push(<DeviceDetailsView key={adapterState.instanceId}
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
                                              containerHeight={this.props.style.height}
                                              onToggleAutoConnUpdate={toggleAutoConnUpdate}
                                              autoConnUpdate={autoConnUpdate}
                                              />
        );

        // Details for connected devices
        connectedDevices.forEach(device => {
            detailDevices.push(<DeviceDetailsView key={device.instanceId}
                                                  adapter = {adapterState}
                                                  device={device}
                                                  selected={selectedComponent}
                                                  deviceDetails={deviceDetails}
                                                  onSelectComponent={selectComponent}
                                                  onSetAttributeExpanded={setAttributeExpanded}
                                                  onReadCharacteristic={readCharacteristic}
                                                  onWriteCharacteristic={writeCharacteristic}
                                                  onReadDescriptor={readDescriptor}
                                                  onWriteDescriptor={writeDescriptor}
                                                  onDisconnectFromDevice={disconnectFromDevice}
                                                  onPairWithDevice={pairWithDevice}
                                                  onUpdateDeviceConnectionParams={createUserInitiatedConnParamsUpdateEvent}
                                                  containerHeight={this.props.style.height}
                                                  />
            );
        });

        const perDevice = (20 + elemWidth);
        const width = (perDevice * detailDevices.length);

        // TODO: Fix better solution to right padding of scroll area than div box with border
        return (<div className='device-details-container' style={this.props.style}>
                    <div style={{width: width}}>
                        {detailDevices}
                        <div style={{borderColor: 'transparent', borderLeftWidth: '20px', borderRightWidth: '0px', borderStyle: 'solid'}} />
                    </div>
                </div>);
    }
}

function mapStateToProps(state) {
    const {
        adapter
    } = state;

    const selectedAdapter = adapter.getIn(['adapters', adapter.selectedAdapter]);

    if (!selectedAdapter) {
        return {};
    }

    return {
        adapterState: selectedAdapter.state,
        selectedComponent: selectedAdapter.deviceDetails && selectedAdapter.deviceDetails.selectedComponent,
        connectedDevices: selectedAdapter.connectedDevices,
        deviceDetails: selectedAdapter.deviceDetails,
        autoConnUpdate: adapter.autoConnUpdate,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
            {},
            bindActionCreators(DeviceDetailsActions, dispatch),
            bindActionCreators(AdvertisingSetupActions, dispatch),
            bindActionCreators(AdapterActions, dispatch),
            bindActionCreators(BLEEventActions, dispatch)
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
    deviceDetails: PropTypes.object,
    connectedDevices: PropTypes.object,
    deviceServers: PropTypes.object,
    readCharacteristic: PropTypes.func.isRequired,
    writeCharacteristic: PropTypes.func.isRequired,
    readDescriptor: PropTypes.func.isRequired,
    writeDescriptor: PropTypes.func.isRequired,
    createUserInitiatedConnParamsUpdateEvent: PropTypes.func.isRequired,
};
