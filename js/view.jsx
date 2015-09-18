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
import React from 'react';
import Reflux from 'reflux';
import hotkey from 'react-hotkey';

import BleNodeContainer from './node.jsx';
import { DeviceDetailsContainer } from './deviceDetails.jsx';
import ServerSetup from './components/ServerSetup.jsx';

import Log from './log.jsx';
import logger from './logging';

import { DiscoveredDevicesContainer } from './discoveredDevicesContainer.jsx';
import DiscoveryActions from './actions/discoveryActions';

import driverActions from './actions/bleDriverActions';
import bleTargetStore from './stores/bleTargetStore';
import discoveryStore from './stores/discoveryStore';
import logStore from './stores/logStore';

import logActions from './actions/logActions';

import NavBar from './navbar.jsx';


var MyView = React.createClass({
    mixins: [hotkey.Mixin('handleHotkey')],
    handleHotkey: function(e) {
        if(e.getModifierState('Control')) {
            switch(e.keyCode) {
                default:
                    logger.silly(`Ctrl pressed, keycode ${e.keyCode}.`);
                    break;
            }
        } else if (e.getModifierState('Alt')) {
            switch(e.keyCode) {
                case 49: // 1
                    this._onChangedMainView('ConnectionMap');
                    break;
                case 50: // 2
                    this._onChangedMainView('DeviceDetails');
                    break;
                case 67: // C
                    DiscoveryActions.clearItems();
                    break;
                case 83: // S
                    DiscoveryActions.toggleScan();
                    break;
                case 80: // P
                    this.refs.navBar.focusOnComPorts();
                    break;
                default:
                    logger.silly(`Alt pressed, keycode ${e.keyCode}.`);
                    break;
            }
        }
    },
    componentWillMount: function(){
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

        window.addEventListener("optimizedResize", function() {
            that.setState({windowHeight: $(window).height()}); //document.documentElement.clientHeight;
        });

        hotkey.activate();
    },
    getInitialState: function() {
        return {
            currentlyShowing: "ConnectionMap",
            windowHeight: $(window).height()
        };
    },
    _onChangedMainView: function(viewToShow) {
        logger.silly(`changed view to ${viewToShow}`);
        this.setState({currentlyShowing: viewToShow});
    },
    render: function() {
        var topBarHeight = 55;
        var layoutStyle = {
          height: this.state.windowHeight - topBarHeight
        };
        var mainAreaHeight = layoutStyle.height - 189;
        return (
            <div id="main-area-wrapper">
              <NavBar onChangeMainView={this._onChangedMainView} view={this.state.currentlyShowing} ref="navBar" />
              <div className="main-layout" style={layoutStyle}>
                <div>
                  <div>
                    <BleNodeContainer       style={{height: mainAreaHeight, display: this.state.currentlyShowing === 'ConnectionMap' ? 'block': 'none'}}/>
                    <DeviceDetailsContainer style={{height: mainAreaHeight, display: this.state.currentlyShowing === 'DeviceDetails' ? 'block': 'none'}}/>
                    <ServerSetup            style={{height: mainAreaHeight, display: this.state.currentlyShowing === 'ServerSetup'   ? 'block': 'none'}}/>
                  </div>
                  <div>
                    <Log/>
                  </div>
                </div>
                <div>
                  <DiscoveredDevicesContainer />
                </div>
              </div>
            </div>
        );
    }
});


module.exports = MyView;
