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

import path from 'path';
import React from 'react';
import { bindActionCreators } from 'redux';
import reducers from './lib/reducers';
import * as DiscoveryActions from './lib/actions/discoveryActions';
import * as AdapterActions from './lib/actions/adapterActions';
import * as AppActions from './lib/actions/appActions';
import * as FirmwareActions from './lib/actions/firmwareActions';
import MainViewContainer from './lib/containers/MainView';
import BLEEventDialog from './lib/containers/BLEEventDialog';
import DiscoveredDevices from './lib/containers/DiscoveredDevices';
import { initializeApp } from './lib/actions/coreActionsHack';
import { confirmUserUUIDsExist } from './lib/utils/uuid_definitions';

import './resources/css/styles.less';

/* eslint react/prop-types: 0 */

export default {
    config: {
        firmwareUseBLE: true,
    },
    decorateNavMenu: NavMenu => (
        props => (
            <NavMenu
                {...props}
                menuItems={[
                    { id: 'ConnectionMap', text: 'Connection Map', iconClass: 'icon-columns' },
                    { id: 'ServerSetup', text: 'Server Setup', iconClass: 'icon-indent-right' },
                ]}
            />
        )
    ),
    mapNavMenuDispatch: (dispatch, props) => ({
        ...props,
        onItemSelected: item => dispatch(AppActions.selectMainView(item)),
    }),
    decorateMainView: MainView => (
        props => (
            <MainView>
                <MainViewContainer {...props} />
                <BLEEventDialog />
            </MainView>
        )
    ),
    decorateSidePanel: SidePanel => (
        props => (
            <SidePanel>
                <DiscoveredDevices
                    {...props}
                    discoveryOptions={{ expanded: true }}
                    discoveredDevices={[]}
                    isAdapterAvailable
                    isScanning={false}
                    adapterIsConnecting={false}
                />
            </SidePanel>
        )
    ),
    mapSidePanelDispatch: (dispatch, props) => ({
        ...props,
        ...bindActionCreators(DiscoveryActions, dispatch),
        ...bindActionCreators(AdapterActions, dispatch),
    }),
    mapSerialPortSelectorState: (state, props) => ({
        portIndicatorStatus: state.app.adapter.selectedAdapterIndex ? 'on' : 'off',
        ...props,
    }),
    reduceApp: reducers,
    middleware: store => next => action => {
        if (!action) {
            return;
        }
        if (action.type === 'SERIAL_PORT_SELECTED') {
            const { port } = action;
            store.dispatch(FirmwareActions.validateFirmware(port.serialNumber, {
                onValid: version => store.dispatch(
                    AdapterActions.openAdapter(action.port, version),
                ),
                onInvalid: () => store.dispatch({ type: 'FIRMWARE_DIALOG_SHOW', port }),
            }));
        }
        if (action.type === 'SERIAL_PORT_DESELECTED') {
            store.dispatch(AdapterActions.closeAdapter());
        }
        if (action.type === 'FIRMWARE_DIALOG_UPDATE_REQUESTED') {
            const { port } = action;
            store.dispatch(FirmwareActions.programFirmware(port.serialNumber, {
                onSuccess: version => {
                    store.dispatch(AdapterActions.openAdapter(action.port, version));
                    store.dispatch({ type: 'FIRMWARE_DIALOG_HIDE' });
                },
                onFailure: () => {
                    store.dispatch({ type: 'FIRMWARE_DIALOG_HIDE' });
                    store.dispatch({ type: 'SERIAL_PORT_DESELECTED' });
                },
            }));
        }
        next(action);
    },
    onInit: (dispatch, getState, { core }) => {
        __webpack_public_path__ = path.join(core.getAppDir(), 'dist/'); // eslint-disable-line
    },
    onReady: (dispatch, getState, api) => {
        initializeApp(api);
        confirmUserUUIDsExist(api.core.getUserDataDir());
        dispatch(AdapterActions.findAdapters());
    },
};
