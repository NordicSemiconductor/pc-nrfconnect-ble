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

'use strict';

import React, { PropTypes } from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import KeymapManager from 'atom-keymap';
// import fs from 'fs';
// import { remote } from 'electron';

import '../../resources/css/styles.less';

import * as AppActions from '../actions/appActions';
import * as AdvertisingActions from '../actions/advertisingActions';
import * as ErrorActions from '../actions/errorDialogActions';

import DeviceDetailsContainer from './DeviceDetails';
import ServerSetup from './ServerSetup';

// const keymaps = new KeymapManager();

let toggleAdvertisingHandle;
let toggleDebugHandle;

class MainViewContainer extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            windowHeight: window.innerHeight,
        };

        // keymaps.defaultTarget = document.body;
        //
        // Pass all the window's keydown events to the KeymapManager
        // document.addEventListener('keydown', event => {
        //     keymaps.handleKeyboardEvent(event);
        // });
        //
        // const keymapFile = remote.getGlobal('keymap');
        //
        // if (fs.existsSync(keymapFile)) {
        //     keymaps.loadKeymap(keymapFile);
        // } else {
        //     keymaps.add('core', {
        //         body: {
        //             'alt-1': 'core:connection-map',
        //             'alt-2': 'core:server-setup',
        //             'alt-a': 'core:toggle-advertising',
        //             'alt-c': 'core:clear-scan',
        //             'alt-p': 'core:select-adapter',
        //             'alt-s': 'core:toggle-scan',
        //             down:   'core:move-down',
        //             up:     'core:move-up',
        //             left:   'core:move-left',
        //             right:  'core:move-right',
        //             'ctrl-alt-d': 'core:toggle-debug',
        //         },
        //     });
        // }
        //
        // // These shall always be added
        // keymaps.add('core', {
        //     'body .native-key-bindings': {
        //         left: 'native!',
        //         right: 'native!',
        //         up: 'native!',
        //         down: 'native!',
        //     },
        // });

        this.LregisterKeyboardShortcuts();
    }

    componentWillMount() {
        (() => {
            const throttle = (type, name, obj) => {
                let running = false;
                const object = obj || window;
                const func = () => {
                    if (running) {
                        return;
                    }

                    running = true;
                    requestAnimationFrame(() => {
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
            // document.documentElement.clientHeight;
            this.setState({ windowHeight: window.innerHeight });
        });
    }

    LregisterKeyboardShortcuts() {
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

    render() {
        const {
            selectedMainView,
        } = this.props;
        const topBarHeight = 55;
        const layoutStyle = {
            height: this.state.windowHeight - topBarHeight,
        };
        const mainAreaHeight = layoutStyle.height - 189;

        if (selectedMainView === 'ConnectionMap') {
            return (
                <DeviceDetailsContainer style={{ height: mainAreaHeight }} />
            );
        }
        if (selectedMainView === 'ServerSetup') {
            return (
                <ServerSetup style={{ height: mainAreaHeight }} />
            );
        }
        return null;
    }
}

function mapStateToProps(state) {
    const { selectedMainView } = state.app.app;
    return { selectedMainView };
}

function mapDispatchToProps(dispatch) {
    return Object.assign(
        bindActionCreators(AppActions, dispatch),
        bindActionCreators(AdvertisingActions, dispatch),
        bindActionCreators(ErrorActions, dispatch),
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(MainViewContainer);

MainViewContainer.propTypes = {
    selectedMainView: PropTypes.string.isRequired,
    toggleAdvertising: PropTypes.func.isRequired,
    toggleDebug: PropTypes.func,
};

MainViewContainer.defaultProps = {
    toggleDebug: null,
};
