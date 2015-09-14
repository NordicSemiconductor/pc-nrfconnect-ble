'use strict';

var React = require('react');

var Reflux = require('reflux');
var nodeStore = require('./stores/bleNodeStore');
var driverStore = require('./stores/bleDriverStore');

var ConnectedDevice = require('./components/ConnectedDevice.jsx');
var CentralDevice = require('./components/CentralDevice.jsx');


var BleNodeContainer = React.createClass({
    mixins: [Reflux.listenTo(nodeStore, "onGraphChanged"), Reflux.connect(driverStore)],

    onGraphChanged: function(newGraph, change){
        this.setState({graph: newGraph}); // Must be done before connection is made since connection target is created by render
    },
    getInitialState: function(){
        return nodeStore.getInitialState();
    },
    render: function(){
        
        var plumbNodes = [];
        var centralPosition = {
            x: 10,
            y: 200,
        };
        var connectedToCentral = this.state.centralName !== null && Object.keys(this.state.centralAddress).length !== 0;
        var central;
        var nodePositions = [];
        if (connectedToCentral) {
            for (var i = 0; i < this.state.graph.length; i++) {
                var connectedDeviceCounter = 0;
                var node = this.state.graph[i];
                if (node.id === 'central') {
                    central = (<CentralDevice id={node.id} name={this.state.centralName} address={this.state.centralAddress.address} position={centralPosition}/>)
                } else {
                    var nodePosition = {
                        x: centralPosition.x + 250,
                        y: connectedDeviceCounter* 200
                    };
                    nodePositions.push(nodePosition);
                    connectedDeviceCounter++;
                    
                    plumbNodes.push(<ConnectedDevice id={node.id} sourceId='central' parentId='diagramContainer' key={i} node={node} device={this.state.graph[i].device} position={nodePosition}/>);
                }
            }
        }

        return (
            <div id="diagramContainer" style={this.props.style} >
                {central}
                <div style={{width: '300px',position: 'absolute', top: '10px', left: '400px'}}>
                {plumbNodes}
            </div>
            </div>
        );
    }
});

module.exports = BleNodeContainer;
