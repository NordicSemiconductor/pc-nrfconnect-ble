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
import { FirmwareRegistry } from 'pc-ble-driver-js';
import { logger, getAppDir, getUserDataDir } from 'nrfconnect/core';
import reducers from './lib/reducers';
import * as DiscoveryActions from './lib/actions/discoveryActions';
import * as AdapterActions from './lib/actions/adapterActions';
import SelectedView from './lib/components/SelectedView';
import BLEEventDialog from './lib/containers/BLEEventDialog';
import DiscoveredDevices from './lib/containers/DiscoveredDevices';
import {
    confirmUserUUIDsExist,
    populateUuids,
} from './lib/utils/uuid_definitions';

import './resources/css/styles.scss';

/* eslint react/prop-types: 0 */

let globalDispatch;

export default {
    decorateNavMenu: NavMenu => ({ selectedItemId, ...restProps }) => (
        <NavMenu
            {...restProps}
            selectedItemId={selectedItemId < 0 ? 0 : selectedItemId}
            menuItems={[
                { id: 0, text: 'Connection Map', iconClass: 'mdi mdi-sitemap' },
                {
                    id: 1,
                    text: 'Server Setup',
                    iconClass: 'mdi mdi-format-indent-increase',
                },
            ]}
        />
    ),
    decorateMainView: MainView => props => (
        <MainView>
            <SelectedView {...props} />
            <BLEEventDialog />
        </MainView>
    ),
    mapMainViewState: (state, props) => {
        const { selectedItemId } = state.core.navMenu;
        return {
            ...props,
            viewId: selectedItemId > 0 ? selectedItemId : 0,
        };
    },
    decorateSidePanel: SidePanel => props => (
        <SidePanel>
            <DiscoveredDevices {...props} />
        </SidePanel>
    ),
    mapSidePanelDispatch: (dispatch, props) => ({
        ...props,
        ...bindActionCreators(DiscoveryActions, dispatch),
        ...bindActionCreators(AdapterActions, dispatch),
    }),
    mapDeviceSelectorState: (state, props) => ({
        portIndicatorStatus:
            state.app.adapter.selectedAdapter !== null ? 'on' : 'off',
        ...props,
    }),
    reduceApp: reducers,
    middleware: store => next => action => {
        if (!action) {
            return;
        }
        if (action.type === 'DEVICE_SETUP_COMPLETE') {
            logger.info('Device setup completed');
            store.dispatch(AdapterActions.initAdapter(action.device));
        }
        if (action.type === 'DEVICE_SETUP_ERROR') {
            if (action.error.message.includes('No firmware defined')) {
                logger.info(
                    `Connected to device with serial number: ${action.device.serialNumber} ` +
                        `and family: ${
                            action.device.deviceInfo.family || 'Unknown'
                        } `
                );
                logger.debug(
                    'Note: no pre-compiled firmware is available for the selected device. ' +
                        'You may still use the app if you have programmed the device ' +
                        'with a compatible connectivity firmware.'
                );
                store.dispatch(AdapterActions.initAdapter(action.device));
            } else {
                logger.error(`Failed to setup device: ${action.error.message}`);
            }
        }
        if (action.type === 'DEVICE_DESELECTED') {
            store
                .dispatch(AdapterActions.closeAdapter())
                .then(() => logger.info('Device closed.'));
        }
        next(action);
    },
    onInit: dispatch => {
        __webpack_public_path__ = path.join(getAppDir(), 'dist/'); // eslint-disable-line
        globalDispatch = dispatch;
    },
    onReady: () => {
        confirmUserUUIDsExist(getUserDataDir());
        populateUuids();
    },
    config: {
        selectorTraits: {
            jlink: true,
            nordicUsb: true,
            serialport: true,
        },
        deviceSetup: {
            ...FirmwareRegistry.getDeviceSetup(),
            allowCustomDevice: true,
        },
        releaseCurrentDevice: () =>
            globalDispatch(AdapterActions.closeAdapter()),
    },
};
