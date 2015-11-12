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

import $ from 'jquery';
import React, { PropTypes } from 'react';
import Component from 'react-pure-render/component';

import Reflux from 'reflux';

// import hotkey from 'react-hotkey';

import BleNodeContainer from '../components/node';
import DeviceDetailsContainer from '../components/deviceDetails';
//import ConnectionUpdateRequestModal from './components/ConnectionUpdateRequestModal.jsx';
import EventViewer from '../components/EventViewer';
import ServerSetup from '../components/ServerSetup';

import Log from '../components/log';
import logger from '../logging';

import DiscoveredDevices from './DiscoveredDevices';

import logActions from '../actions/logActions';
import DiscoveryActions from '../actions/discoveryActions';
import driverActions from '../actions/bleDriverActions';

import NavBar from '../components/navbar.jsx';

import DevTools from '../containers/DevTools';

import { findAdapters } from '../actions/adapterActions';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentlyShowing: "ConnectionMap",
            windowHeight: window.innerHeight,
        };
    }

    componentWillMount() {
        var that = this;
        (function() {
            var throttle = function(type, name, obj) {
                var obj = obj || window;
                var running = false;
                var func = function() {
                    if (running) { return; }
                    running = true;
                    requestAnimationFrame(function() {
                        obj.dispatchEvent(new CustomEvent(name));
                        running = false;
                    });
                };
                obj.addEventListener(type, func);
            };

            throttle("resize", "optimizedResize");
        })();

        // handle event

        window.addEventListener("optimizedResize", () => {
            this.setState({windowHeight: window.innerHeight}); //document.documentElement.clientHeight;
        });

        // hotkey.activate('keydown');

    }

    componentDidMount() {
        // Trigger things off by starting to get adapters
        store.dispatch(findAdapters());
    }

    _onChangedMainView(viewToShow) {
        logger.silly(`changed view to ${viewToShow}`);
        this.setState({currentlyShowing: viewToShow});
    }

    render() {
        var topBarHeight = 55;
        var layoutStyle = {
          height: this.state.windowHeight - topBarHeight
        };
        var mainAreaHeight = layoutStyle.height - 189;

        var active = this.state.currentlyShowing === 'ConnectionMap' ? <BleNodeContainer style={{height: mainAreaHeight}}/>
                   : this.state.currentlyShowing === 'DeviceDetails' ? <DeviceDetailsContainer style={{height: mainAreaHeight}}/>
                   : this.state.currentlyShowing === 'ServerSetup'   ? <ServerSetup style={{height: mainAreaHeight}}/>
                   : null;
        return (
            <div id="main-area-wrapper">
                <NavBar onChangeMainView={this._onChangedMainView} view={this.state.currentlyShowing} ref="navBar" />
                <div className="main-layout" style={layoutStyle}>
                    <div>
                        <div>
                            {active}
                        </div>
                        <div>
                            <Log/>
                        </div>
                    </div>
                    <div>
                        <DiscoveredDevices/>
                    </div>
                    <EventViewer/>
                </div>
            </div>
        );
    }
}
