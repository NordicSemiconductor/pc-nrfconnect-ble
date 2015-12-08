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

import * as AppActions from '../actions/appActions';
import DeviceDetailsContainer from './DeviceDetails';
import ServerSetup from './ServerSetup';

import NavBar from '../components/navbar.jsx';
import BLEEventDialog from '../containers/BLEEventDialog';

import LogViewer from './LogViewer';
import DiscoveredDevices from './DiscoveredDevices';
import ConnectionMap from './ConnectionMap';

import { findAdapters } from '../actions/adapterActions';

import KeymapManager from 'atom-keymap';

const keymaps = new KeymapManager();

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

        keymaps.add('core', {
            'body': {
                'alt-1': 'core:connection-map',
                'alt-2': 'core:device-details',
                'alt-3': 'core:server-setup',
                'alt-c': 'core:clear-log',
                'alt-s': 'core:toggle-scan',
                'alt-p': 'core:select-adapter',
                'down' : 'core:move-down',
                'up'   : 'core:move-up',
                'left' : 'core:move-left',
                'right': 'core:move-right',
            }
        });
    }

    componentWillMount() {
        (function() {
            const throttle = function(type, name, obj) {
                let running = false;
                const object = obj || window;
                const func = () => {
                    if (running) {
                        return;
                    }

                    running = true;
                    requestAnimationFrame(function() {
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
            this.setState({windowHeight: window.innerHeight}); //document.documentElement.clientHeight;
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

        const active = selectedMainView === 'ConnectionMap' ? <ConnectionMap style={{height: mainAreaHeight}}/>
                     : selectedMainView === 'DeviceDetails' ? <DeviceDetailsContainer style={{height: mainAreaHeight}}/>
                     : selectedMainView === 'ServerSetup'   ? <ServerSetup style={{height: mainAreaHeight}}/>
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
            bindActionCreators(AppActions, dispatch)
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
