'use strict';

var React = require('react');
var mui = require('material-ui');

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

var Reflux = require('reflux');

var BleNode = require('./node.jsx');
var DeviceDetails = require('./DeviceDetails.jsx');

var Log = require('./log.jsx');

var DiscoveredDevicesContainer = require('./discoveredDevicesContainer.jsx').DiscoveredDevicesContainer;
var DiscoveryActions = require('./actions/discoveryActions');

var driverActions = require('./actions/bleDriverActions');
var bleTargetStore = require('./stores/bleTargetStore');
var discoveryStore = require('./stores/discoveryStore');
var logStore = require('./stores/logStore');

var BleTargetActions = require('./actions/bleTargetActions');
var logActions = require('./actions/logActions');
var DiscoveryButton = require('./discoveryButton.jsx');
var DiscoveryView = require('./discoveryView.jsx');
let { Typography } = Styles;
var ColorManipulator = mui.Utils.ColorManipulator;


setTimeout(function() {
  BleTargetActions.startBleTargetDetect();
}, 1000);

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
    logActions.log('ui', 'INFO', "StartScanClick!");

  },
  _onBleTargetChange: function(evt, index, obj) {
    //console.log(evt + " " + index + " " + JSON.stringify(obj));
    this.state.chosen_port = obj.text;
    logActions.log('ui',' INFO', `Opening serial port: ${this.state.chosen_port}`);
    this._onOpen();
  },
  _onOpen: function() {
    console.log(this.state.chosen_port);

    driverActions.connectToDriver(this.state.chosen_port);
    logActions.open();

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
    logActions.log('ui', 'INFO', "Connecting");
    DiscoveryActions.connectToDevice({'address': 'C0:D4:94:D7:39:22', 'type': 'BLE_GAP_ADDR_TYPE_RANDOM_STATIC'});
  },
  render: function(){
    var self = this, targets = this.state.discoveredBleTargets.concat({payload: "22", text: "/dev/tty.usbmodem1d111"});
    var discoveryButtonBackgroundColor;
    var discoveryButtonStyle = {
        color: 'white', margin: '0px 10px'
    };

    //console.log("scan_in_progress: " + self.state.discoveryStore.scan_in_progress);
    return (
      <div>
        <Toolbar>
          <ToolbarGroup key={0} float="left">
          <DropDownMenu iconClassName="icon-expand_more"menuItems={targets} onChange={self._onBleTargetChange} />
<ToolbarSeparator/>
          </ToolbarGroup>

          <ToolbarGroup key={1} float="right">
            <DiscoveryButton/>
            <RaisedButton ref="showDiscoveryButton" primary={true} label="Discovery" onClick={this._onShowDiscoveryView}>
                <i className="fa fa-wifi" style={{color: 'white', float: 'left', margin: '10px 5px 10px 15px'}}></i>
            </RaisedButton>

          </ToolbarGroup>
        </Toolbar>

        <Tabs onChange={this._onChange}>
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
