'use strict';

var React = require('react');
var dagre = require('dagre');
var Reflux = require('reflux');
var nodeStore = require('./stores/bleNodeStore');

var driverStore = require('./stores/bleDriverStore');
var connectionActions = require('./actions/connectionActions');
var {ConnectedDevice} = require('./discoveredDevicesContainer.jsx');
var CentralDevice = require('./components/CentralDevice.jsx');
var bs = require('react-bootstrap');
var Popover = bs.Popover;
var OverlayTrigger = bs.OverlayTrigger;

var _ = require('underscore');




var BleNodeContainer = React.createClass({
    mixins: [Reflux.listenTo(nodeStore, "onGraphChanged"), Reflux.connect(driverStore)],

    getInitialState: function() {
        this.wasMounted = false;
    },
    componentDidMount: function() {
        jsPlumb.setContainer(React.findDOMNode(this));


        this.wasMounted = true;
    },
    onGraphChanged: function(newGraph, change){
        this.setState({graph: newGraph}); // Must be done before connection is made since connection target is created by render
        jsPlumb.detachEveryConnection();
        for (var i = 0; i < this.state.graph.length; i++) {
            var node = this.state.graph[i];
            if (node.id === 'central') {
                continue;
            }
            var overlayId= "connection" + node.id;
            var connectionParameters = {
                source: 'central',
                target: node.id,
                anchor: ["Left", "Right"],
                endpoint:"Blank",
                connector:[ "Flowchart", { stub: [10, 10], gap: 0, cornerRadius: 0, alwaysRespectStubs: false }],
                overlays:[["Custom", {
                    create:function(component) {
                        return $('<span><div id="' + overlayId + '"/></span>');
                    },
                    location:0.85,
                    id:"customOverlay"
                }]]
            };
            
            if (node.connectionLost) {
                var element = document.getElementById(node.id);
                element.id = element.id+ '_disconnected';
                element.style.opacity = 0.5;
            }
           /* var connection = jsPlumb.connect(connectionParameters);
            
            this.setState({graph: newGraph}, function() {
                  React.render(<ConnectionOverlay device={change.device} connection={change.connection}/>, document.getElementById(overlayId));
            });*/
        }
/*
        if (change.remove) {
            jsPlumb.remove(change.nodeId);
            jsPlumb.repaintEverything(); // solves connection line chaos
        } else if (change.remove === false){
            var overlayId= "connection" + change.nodeId;
            var connectionParameters = {
                source: 'central',
                target: change.nodeId,
                anchor: ["Left", "Right"],
                endpoint:"Blank",
                connector:[ "Flowchart", { stub: [10, 10], gap: 0, cornerRadius: 0, alwaysRespectStubs: false }],
                overlays:[["Custom", {
                    create:function(component) {
                        return $('<span><div id="' + overlayId + '"/></span>');
                    },
                    location:0.8,
                    id:"customOverlay"
                }]]
            };

            var connection = jsPlumb.connect(connectionParameters);

            this.setState({graph: newGraph}, function() {
                  React.render(<ConnectionOverlay device={change.device} connection={change.connection}/>, document.getElementById(overlayId));
            });
        } else {
            var element = document.getElementById(change.nodeId);
            element.id = element.id+ '_disconnected';
            element.style.opacity = 0.5;
        }
        */
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
    },
    componentDidUpdate: function() {
        jsPlumb.repaintEverything(); // solves connection line chaos
    }
});

module.exports = BleNodeContainer;
