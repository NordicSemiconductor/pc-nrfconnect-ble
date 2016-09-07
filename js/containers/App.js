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

import * as AppActions from '../actions/appActions';
import * as AdvertisingActions from '../actions/advertisingActions';
import * as ErrorActions from '../actions/errorDialogActions';

import DeviceDetailsContainer from './DeviceDetails';
import ServerSetup from './ServerSetup';

import NavBar from '../components/navbar';
import BLEEventDialog from '../containers/BLEEventDialog';
import ErrorDialog from '../containers/ErrorDialog';

import LogViewer from './LogViewer';
import DiscoveredDevices from './DiscoveredDevices';
import ConnectionMap from './ConnectionMap';

import { findAdapters } from '../actions/adapterActions';

import KeymapManager from 'atom-keymap';

const keymaps = new KeymapManager();
import {remote} from 'electron';
import fs from 'fs';

let toggleAdvertisingHandle;
let toggleDebugHandle;

class AppContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            windowHeight: window.innerHeight,
        };

        keymaps.defaultTarget = document.body;

        // Pass all the window's keydown events to the KeymapManager
        document.addEventListener('keydown', event => {
            keymaps.handleKeyboardEvent(event);
        });

        const keymapFile = remote.getGlobal('keymap');

        if (fs.existsSync(keymapFile)) {
            keymaps.loadKeymap(keymapFile);
        } else {
            keymaps.add('core', {
                body: {
                    'alt-1': 'core:connection-map',
                    'alt-2': 'core:server-setup',
                    'alt-a': 'core:toggle-advertising',
                    'alt-c': 'core:clear-scan',
                    'alt-p': 'core:select-adapter',
                    'alt-s': 'core:toggle-scan',
                    down:   'core:move-down',
                    up:     'core:move-up',
                    left:   'core:move-left',
                    right:  'core:move-right',
                    'ctrl-alt-d': 'core:toggle-debug',
                },
            });
        }

        // These shall always be added
        keymaps.add('core', {
            'body .native-key-bindings': {
                left: 'native!',
                right: 'native!',
                up: 'native!',
                down: 'native!',
            },
        });

        this._registerKeyboardShortcuts();
    }

    _registerKeyboardShortcuts() {
        // Setup keyboard shortcut callbacks
        //
        // Since we move between the different "tabs" we have to
        // remove the listeners and add them again so that the correct instance
        // of this class is associated with the callback registered on window.

        this.toggleAdvertising = () => {
            const { toggleAdvertising } = this.props;
            toggleAdvertising();
        };

        if (toggleAdvertisingHandle) {
            window.removeEventListener('core:toggle-advertising', toggleAdvertisingHandle);
        }

        window.addEventListener('core:toggle-advertising', this.toggleAdvertising);
        toggleAdvertisingHandle = this.toggleAdvertising;

        this.toggleDebug = () => {
            const { toggleDebug } = this.props;
            toggleDebug();
        };

        if (toggleDebugHandle) {
            window.removeEventListener('core:toggle-debug', toggleDebugHandle);
            toggleDebugHandle = undefined;
        }

        window.addEventListener('core:toggle-debug', this.toggleDebug);
        toggleDebugHandle = this.toggleDebug;
    }

    componentWillMount() {
        (function () {
            const throttle = function (type, name, obj) {
                let running = false;
                const object = obj || window;
                const func = () => {
                    if (running) {
                        return;
                    }

                    running = true;
                    requestAnimationFrame(function () {
                        object.dispatchEvent(new CustomEvent(name));
                        running = false;
                    });
                };

                object.addEventListener(type, func);
            };

            throttle('resize', 'optimizedResize');
        })();

        // handle event
        window.addEventListener('optimizedResize', () => {
            this.setState({ windowHeight: window.innerHeight }); //document.documentElement.clientHeight;
        });
    }

    componentDidMount() {
        // Trigger things off by starting to get adapters
        store.dispatch(findAdapters());
    }

    render() {
        const {
            selectedMainView,
            selectMainView,
        } = this.props;
        const topBarHeight = 55;
        const layoutStyle = {
            height: this.state.windowHeight - topBarHeight,
        };
        const mainAreaHeight = layoutStyle.height - 189;

        const active = selectedMainView === 'ConnectionMap' ? <DeviceDetailsContainer style={{ height: mainAreaHeight }}/>
                     : selectedMainView === 'ServerSetup'   ? <ServerSetup style={{ height: mainAreaHeight }}/>
                     : null;

        return (
            <div id='main-area-wrapper'>
                <NavBar onChangeMainView={view => selectMainView(view)} view={selectedMainView} ref='navBar' />
                <div className='main-layout' style={layoutStyle}>
                    <div>
                        <div>
                            {active}
                        </div>
                        <div>
                            <LogViewer/>
                        </div>
                    </div>
                    <div>
                        <DiscoveredDevices/>
                    </div>
                </div>
                <BLEEventDialog/>
                <ErrorDialog/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { app } = state;

    return {
        selectedMainView: app.selectedMainView,
    };
}

function mapDispatchToProps(dispatch) {
    let retval = Object.assign(
            {},
            bindActionCreators(AppActions, dispatch),
            bindActionCreators(AdvertisingActions, dispatch),
            bindActionCreators(ErrorActions, dispatch)
    );

    return retval;
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AppContainer);

AppContainer.propTypes = {
    selectedMainView: PropTypes.string.isRequired,
    selectMainView: PropTypes.func.isRequired,
};
