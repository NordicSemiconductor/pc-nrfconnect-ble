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
import { confirmUserUUIDsExist } from './lib/utils/uuid_definitions';

import './resources/css/styles.less';

/* eslint react/prop-types: 0 */

export default {
    decorateNavMenu: NavMenu => (
        props => (
            <NavMenu
                {...props}
                selectedItemId={props.selectedItemId < 0 ? 0 : props.selectedItemId}
                menuItems={[
                    { id: 0, text: 'Connection Map', iconClass: 'icon-columns' },
                    { id: 1, text: 'Server Setup', iconClass: 'icon-indent-right' },
                ]}
            />
        )
    ),
    decorateMainView: MainView => (
        props => (
            <MainView>
                <SelectedView {...props} />
                <BLEEventDialog />
            </MainView>
        )
    ),
    mapMainViewState: (state, props) => {
        const { selectedItemId } = state.core.navMenu;
        return {
            ...props,
            viewId: selectedItemId > 0 ? selectedItemId : 0,
        };
    },
    decorateSidePanel: SidePanel => (
        props => (
            <SidePanel>
                <DiscoveredDevices {...props} />
            </SidePanel>
        )
    ),
    mapSidePanelDispatch: (dispatch, props) => ({
        ...props,
        ...bindActionCreators(DiscoveryActions, dispatch),
        ...bindActionCreators(AdapterActions, dispatch),
    }),
    reduceApp: reducers,
    middleware: store => next => action => {
        if (!action) {
            return;
        }
        if (action.type === 'DEVICE_SELECTED') {
            const { device } = action;
            logger.info('Validating connectivity firmware for device with serial number ' +
                `${device.serialNumber}...`);
        }
        if (action.type === 'DEVICE_SETUP_COMPLETE') {
            logger.info('Connectivity firmware is valid.');
            store.dispatch(AdapterActions.initAdapter(action.device));
        }
        if (action.type === 'DEVICE_DESELECTED') {
            store.dispatch(AdapterActions.closeAdapter())
                .then(() => logger.info('Device closed.'));
        }
        next(action);
    },
    onInit: () => {
        __webpack_public_path__ = path.join(getAppDir(), 'dist/'); // eslint-disable-line
    },
    onReady: () => {
        confirmUserUUIDsExist(getUserDataDir());
    },
    config: {
        selectorTraits: {
            jlink: true,
            nordicUsb: true,
            serialport: true,
        },
        deviceSetup: FirmwareRegistry.getDeviceSetup(),
    },
};
