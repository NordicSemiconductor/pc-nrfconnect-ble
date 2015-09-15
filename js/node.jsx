'use strict';

var React = require('react');

var Reflux = require('reflux');
var nodeStore = require('./stores/bleNodeStore');
var driverStore = require('./stores/bleDriverStore');

var ConnectedDevice = require('./components/ConnectedDevice.jsx');
var CentralDevice = require('./components/CentralDevice.jsx');


var BleNodeContainer = React.createClass({
    mixins: [Reflux.connect(nodeStore), Reflux.connect(driverStore)],

    render: function(){

        var plumbNodes = [];
        var central;
        if (this.state.connectedToDriver) {
            for (var i = 0; i < this.state.graph.length; i++) {
                var connectedDeviceCounter = 0;
                var node = this.state.graph[i];
                if (node.id === 'central') {
                    central = (<CentralDevice id={node.id} name={this.state.centralName} address={this.state.centralAddress.address} />)
                } else {
                    connectedDeviceCounter++;
                    plumbNodes.push(<ConnectedDevice id={node.id} sourceId='central' parentId='diagramContainer' key={i} node={node} drawConnector device={this.state.graph[i].device} />);
                }
            }
        }
        return (
            <div id="diagramContainer" style={this.props.style} >
                {central}
                <div className="padded-column" style={{position: 'absolute', top: '20px', left: '400px'}}>
                    {plumbNodes}
                </div>
            </div>
        );
    }
});

module.exports = BleNodeContainer;
