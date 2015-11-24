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

// import hotkey from 'react-hotkey';

import DeviceDetailsContainer from './DeviceDetails';
//import ConnectionUpdateRequestModal from './components/ConnectionUpdateRequestModal.jsx';
// import ServerSetup from '../components/ServerSetup';

import NavBar from '../components/navbar.jsx';
import BLEEventDialog from '../containers/BLEEventDialog';

import LogViewer from './LogViewer';
import DiscoveredDevices from './DiscoveredDevices';
import ConnectionMap from './ConnectionMap';

import { findAdapters } from '../actions/adapterActions';

class AppContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            windowHeight: window.innerHeight,
        };
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

        // hotkey.activate('keydown');
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
            <div id="main-area-wrapper">
                <NavBar onChangeMainView={(view) => selectMainView(view)} view={selectedMainView} ref="navBar" />
                <div className="main-layout" style={layoutStyle}>
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
