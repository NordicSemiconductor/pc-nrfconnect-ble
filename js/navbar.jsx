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

import React from 'react';
import Reflux from 'reflux';

import adapterStore from './stores/adapterStore';
import adapterActions from './actions/adapterActions';
import {DropdownButton, MenuItem} from 'react-bootstrap';


var ComPortSelector = React.createClass({
    mixins: [Reflux.connect(adapterStore, 'adapterState')],

    componentWillMount: function() {
        this.currentPort = 'None';
    },

    onMenuItemSelect: function(theEvent, port) {
        if (this.state.adapterState.connected && this.currentPort !== 'None') {
            adapterActions.disconnect();
            this.currentPort = 'None';
        }

        if (port !== 'None') {
            adapterActions.connect(port);
            this.currentPort = port;
        }
    },

    _getTitle: function() {
        if (this.state.adapterState.connected && !this.state.adapterState.error) {
            return this.state.adapterState.adapterState.port;
        } else if (!this.state.adapterState.connected && this.state.adapterState.error) {
            return 'Error connecting';
        } else {
            return 'Select com port';
        }
    },

    focusOnComPorts: function() {
        var dropDown = React.findDOMNode(this.refs.comPortDropdown);
        dropDown.firstChild.click();
    },

    render: function() {

        var dropdownTitle = this._getTitle();
        var menuItems = this.state.adapterState.discoveredAdapters.map(function(portName, i){
            return (<MenuItem className='btn-primary' eventKey={portName} onSelect={this.onMenuItemSelect} key={i}>{portName}</MenuItem>);
        }, this);
        return (
            <span title='Select com port (Alt+P)'>
                <DropdownButton id='navbar-dropdown' className='btn-primary btn-nordic' title={dropdownTitle} ref='comPortDropdown'>
                    {menuItems}
                </DropdownButton>
            </span>
        );
    }
});



var NavBar = React.createClass({

    mixins: [Reflux.connect(adapterStore, 'adapterState')],

    getInitialState: function() {
        this.activeStyle = {
            boxShadow: 'inset 0 5px 10px #133e40',
        };
        this.passiveStyle = {};
        this.adapterState = { connected: false };
        /*return{
            activeTab: this.props.view
        }*/
    },

    _onViewChange: function(newView){
        this.props.onChangeMainView(newView);
        this.props.view = newView;
    },

    _getClassForTabButton: function(itemName) {
        return 'btn btn-primary btn-nordic padded-row' + (this.props.view === itemName ? ' active' : '');
    },

    _getClassForIndicatorState: function() {
        if (this.state.adapterState.error) {
            return 'error';
        }

        if (this.state.adapterState.connected) {
            return 'on';
        }

        return 'off';
    },

    focusOnComPorts: function() {
        this.refs.comPortSelector.focusOnComPorts();
    },

    render: function() {
        return (
            <div className="nav-bar">
                <div>
                    <img className="nordic-logo" src="resources/NordicS_neg_ol.png" />
                </div>
                <div className="nav-section">
                    <div className="padded-row">
                        <ComPortSelector ref="comPortSelector"/>
                        <div className={"indicator " + this._getClassForIndicatorState()}></div>
                    </div>
                </div>
                <div className="nav-section bl padded-row">
                    <button title="Connection map (Alt+1)" onClick={this._onViewChange.bind(this, 'ConnectionMap')} className={this._getClassForTabButton('ConnectionMap')}>
                        <span className="icon-sitemap icon-rotate-270" />
                        <span>Connection map</span>
                    </button>
                    <button title="Device details (Alt+2)" onClick={this._onViewChange.bind(this, 'DeviceDetails')}  className={this._getClassForTabButton('DeviceDetails')}>
                        <span className="icon-columns" />
                        <span>Device details</span>
                    </button>
                    <button onClick={this._onViewChange.bind(this, 'ServerSetup')}  className={this._getClassForTabButton('ServerSetup')}>
                        <span className="icon-indent-right" />
                        <span>Server setup</span>
                    </button>
                </div>
            </div>
        );
    }
});

module.exports = NavBar;
