'use strict';

var React = require('react');
var Reflux = require('reflux');
var driverStore = require('./stores/bleDriverStore');
var DiscoveryActions = require('./actions/discoveryActions');
var discoveryStore = require('./stores/discoveryStore');

var buttonStyle= {
    marginTop: '10px'
};

var DiscoveryButton = React.createClass({
    mixins: [Reflux.connect(driverStore, "driverStore"), Reflux.connect(discoveryStore, "discoveryStore")],
    buttonClicked: function(){
        if (this.state.discoveryStore.scanInProgress) {
            DiscoveryActions.stopScan();
        } else {
            DiscoveryActions.startScan();
        }

    },

    render: function() {
        var labelString = this.state.discoveryStore.scanInProgress ? 'Stop scan' : 'Start scan';
        return (
            <button type="button" className="btn btn-default btn-sm" disabled= {!this.state.driverStore.connectedToDriver} onClick={this.buttonClicked} style={buttonStyle}>{labelString}</button> 
        );
    }
});

module.exports = DiscoveryButton;