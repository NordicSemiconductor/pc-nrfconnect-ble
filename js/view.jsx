'use strict';

import React from 'react';
import mui from 'material-ui';

import Reflux from 'reflux';
import BleNode from './node.jsx';
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
import DiscoveryView from './discoveryView.jsx';

import NavBar from './navbar.jsx';

var Tabs = mui.Tabs,
  Tab = mui.Tab,
  Styles = mui.Styles,
  DropDownMenu = mui.DropDownMenu,
  Toolbar = mui.Toolbar,
  ToolbarTitle = mui.ToolbarTitle,
  ToolbarGroup = mui.ToolbarGroup,
  ToolbarSeparator = mui.ToolbarSeparator,
  RaisedButton = mui.RaisedButton,
  Colors = mui.Styles.Colors,
  DropDownIcon = mui.DropDownIcon,
  AppBar = mui.AppBar,
  Paper = mui.Paper;

var ThemeManager = new mui.Styles.ThemeManager();

let { Typography } = Styles;
var ColorManipulator = mui.Utils.ColorManipulator;


var MainView = React.createClass({
  mixins: [Reflux.connect(bleTargetStore, "discoveredBleTargets", "chosen_port"),
           Reflux.connect(discoveryStore, "discoveryStore")],

  getInitialState: function() {
        return {isShowingDiscoverySlideIn: false};
  },
  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },
  componentWillMount: function() {
    ThemeManager.setPalette({
      primary1Color: Colors.lightBlue500,
      primary2Color: Colors.lightBlue200,
      primary3Color: Colors.blue100,
      accent1Color: Colors.blue500,
      accent2Color: Colors.blue700,
      accent3Color: Colors.blue100,
      canvasColor: Colors.red
    });
  },
  _onStartScanClick: function() {
    logger.debug("StartScanClick!");
  },
  _onBleTargetChange: function(evt, index, obj) {
    this.state.chosen_port = obj.text;
    logger.info(`Opening serial port: ${this.state.chosen_port}`);
    this._onOpen();
  },
  _onOpen: function() {

    logger.debug(this.state.chosen_port);

    driverActions.connectToDriver(this.state.chosen_port);
  },
  _onShowDiscoveryView: function() {
    if (this.state.isShowingDiscoverySlideIn) {
        this.refs.theDiscoveryView.hide();
        this.setState({isShowingDiscoverySlideIn: false});
    } else {
        this.refs.theDiscoveryView.show();
            this.setState({isShowingDiscoverySlideIn: true});
    }
  },
  _onConnect: function() {
    logger.info("Connecting");
    DiscoveryActions.connectToDevice({'address': 'C0:D4:94:D7:39:22', 'type': 'BLE_GAP_ADDR_TYPE_RANDOM_STATIC'});
  },
  render: function(){
    var self = this;
    var discoveryButtonBackgroundColor;
    var discoveryButtonStyle = {
        color: 'white', margin: '0px 10px'
    };

    return (
      <div>
        <NavBar />
        <Toolbar>

          <ToolbarGroup key={1} float="right">
            <RaisedButton ref="showDiscoveryButton" primary={true} label="Discovery" onClick={this._onShowDiscoveryView}>
                <i className="fa fa-wifi" style={{color: 'white', float: 'left', margin: '10px 5px 10px 15px'}}></i>
            </RaisedButton>

          </ToolbarGroup>
        </Toolbar>

        <Tabs>
          <Tab label="Connection Map" >
              <div id="scan_comp">
                <p>
                  <BleNode/>
                </p>
              </div>
          </Tab>

          <Tab label="Device Details" >
            <DeviceDetails/>
          </Tab>

          <Tab label="Log">
              <Log/>
          </Tab>
        </Tabs>

        <DiscoveryView ref="theDiscoveryView" alignment="right">
           <DiscoveredDevicesContainer />
        </DiscoveryView>

      </div>
    );
  },
  _onActive: function(tab){
  this.context.router.transitionTo(tab.props.route);
}
});

module.exports = MainView;
