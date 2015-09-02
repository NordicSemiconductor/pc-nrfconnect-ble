'use strict';

import React from 'react';
import Reflux from 'reflux';

import bleTargetStore from './stores/bleTargetStore';
import bleDriverStore from './stores/bleDriverStore';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import driverActions from './actions/bleDriverActions.js';

var ComPortSelector = React.createClass({
    getInitialState: function(){
     //   return bleTargetStore.getInitialState();
    },
    onMenuItemSelect: function(theEvent, port) {
        driverActions.connectToDriver(port);
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
            return (<MenuItem eventKey={portName} onSelect={this.onMenuItemSelect}>{portName}</MenuItem>);
        }, this);
        return (
            <DropdownButton title={dropdownTitle}>
                {menuItems}
            </DropdownButton>
        );        
    }
});

function renderDropdownButton (title, i) {

}

var NavBar = React.createClass({
    render: function() {
        return (
            <div className="nav-bar">
                <div className="nav-bar-element">
                    <ComPortSelector/>
                </div>
                <div className="nav-bar-element">
                    dsfdsf
                </div>
                <div className="nav-bar-element">
                    dsfdsf
                </div>
            </div>
        );
    }
});

module.exports = NavBar;
