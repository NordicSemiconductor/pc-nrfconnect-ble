'use strict';

import React from 'react';
import Reflux from 'reflux';

import BleNodeContainer from './node.jsx';
import DeviceDetails from './DeviceDetails.jsx';

import Log from './log.jsx';
import logger from './logging';

var DiscoveredDevicesContainer = require('./discoveredDevicesContainer.jsx').DiscoveredDevicesContainer;
import DiscoveryActions from './actions/discoveryActions';

import driverActions from './actions/bleDriverActions';
import bleTargetStore from './stores/bleTargetStore';
import discoveryStore from './stores/discoveryStore';
import logStore from './stores/logStore';

import logActions from './actions/logActions';

import NavBar from './navbar.jsx';

var MyView = React.createClass({
    mixins: [],

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
            that.setState({mainViewMinHeight: $(window).height()}); //document.documentElement.clientHeight;
        });
    },
    getInitialState: function() {
        return {
            currentlyShowing: "ConnectionMap",
            mainViewMinHeight: $(window).height()
        };
    },
    _onChangedMainView: function(viewToShow) {
        logger.silly('changed View');
        this.setState({currentlyShowing: viewToShow});
    },
    render: function() {
        var topBarHeight = 55;
        var mainAreaStyle = {
          height: this.state.mainViewMinHeight - topBarHeight
        };
        return (
            <div id="main-area-wrapper">
              <NavBar onChangeMainView={this._onChangedMainView}/>
              <div className="main-layout" style={mainAreaStyle}>
                <div>
                  <div>

                    <BleNodeContainer style={{height: (mainAreaStyle.height - 272), display:  this.state.currentlyShowing === 'ConnectionMap' ? 'block': 'none'}}/>
                    <DeviceDetails style={{display: this.state.currentlyShowing === 'DeviceDetails' ? 'flex': 'none'}}/>

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
