'use strict';

import React from 'react';
import Reflux from 'reflux';

import bleTargetStore from './stores/bleTargetStore';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import driverActions from './actions/bleDriverActions.js';

var ComPortSelector = React.createClass({
    getInitialState: function(){
        var targets = bleTargetStore.getInitialState();
        return {discoveredBleTargets: targets.discoveredBleTargets || []};
    },
    onMenuItemSelect: function(theEvent, port) {
        driverActions.connectToDriver(port);
    },
    mixins: [Reflux.connect(bleTargetStore)],
    render: function() {

        var menuItems = this.state.discoveredBleTargets.map(function(portName, i){
            return (<MenuItem eventKey={portName} onSelect={this.onMenuItemSelect}>{portName}</MenuItem>);
        }, this);
        return (
            <DropdownButton title="Select com port">
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
