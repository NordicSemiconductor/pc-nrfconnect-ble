'use strict';

import React from 'react';
import Reflux from 'reflux';

import bleTargetStore from './stores/bleTargetStore';
import bleDriverStore from './stores/bleDriverStore';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import driverActions from './actions/bleDriverActions.js';

var ComPortSelector = React.createClass({
    componentWillMount: function() {
        this.currentPort = 'None';
    },
    onMenuItemSelect: function(theEvent, port) {
        if (this.state.driverState.connectedToDriver && this.currentPort !== 'None') {
            driverActions.disconnectFromDriver();
            this.currentPort = 'None';
        }
        if (port !== 'None') {
            driverActions.connectToDriver(port);
            this.currentPort = port;
        }
    },
    _getTitle: function() {
        if (this.state.driverState.connectedToDriver && !this.state.driverState.error) {
            return this.state.driverState.comPort;
        } else if(!this.state.driverState.connectedToDriver && this.state.driverState.error) {
            return 'Error connecting';
        } else {
            return "Select com port";
        }
    },
    mixins: [Reflux.connect(bleTargetStore), Reflux.connect(bleDriverStore, 'driverState')],
    render: function() {

        var dropdownTitle = this._getTitle();
        var menuItems = this.state.discoveredBleTargets.map(function(portName, i){
            return (<MenuItem className="btn-primary" eventKey={portName} onSelect={this.onMenuItemSelect} key={i}>{portName}</MenuItem>);
        }, this);
        return (
            <DropdownButton className="btn-primary btn-nordic padded-list-element" title={dropdownTitle}>
                {menuItems}
            </DropdownButton>
        );
    }
});



var NavBar = React.createClass({
    getInitialState: function(){
        this.activeStyle = {
            boxShadow: 'inset 0 5px 10px #133e40'
        };
        this.passiveStyle = {};
        this.driverState = { connectedToDriver: false };
        return{
            activeTab: 'ConnectionMap'
        }
    },
    _onViewChange: function(newView){
        this.props.onChangeMainView(newView);
        this.setState({activeTab: newView});
    },
    _getClassForTabButton: function(itemName) {
        return "btn btn-primary btn-nordic padded-list-element" + (this.state.activeTab === itemName ? " active" : "");
    },
    mixins: [Reflux.connect(bleDriverStore, 'driverState')],
    render: function() {
        return (
            <div className="nav-bar">
                <div className="nav-section">
                    <div className="padded-list">
                        <ComPortSelector/>
                        <div className={"padded-list-element " + this.state.driverState.connectedToDriver ? "indicator on" : "indicator off" }></div>
                    </div>
                </div>
                <div className="nav-section bl padded-list">
                    <button onClick={this._onViewChange.bind(this, 'ConnectionMap')} className={this._getClassForTabButton('ConnectionMap')}>
                        Connection map
                    </button>
                    <button onClick={this._onViewChange.bind(this, 'DeviceDetails')}  className={this._getClassForTabButton('DeviceDetails')}>
                        Device details
                    </button>
                </div>
            </div>
        );
    }
});

module.exports = NavBar;
