'use strict';

var React = require('react');
var Reflux = require('reflux');
var mui = require('material-ui');
var driverStore = require('./stores/bleDriverStore');
var DiscoveryActions = require('./actions/discoveryActions');
var discoveryStore = require('./stores/discoveryStore');

var RaisedButton = mui.RaisedButton;

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
            <RaisedButton primary={true} disabled= {!this.state.driverStore.connectedToDriver} label={labelString} onClick={this.buttonClicked} style={buttonStyle}/> 
        );
    }
});

module.exports = DiscoveryButton;