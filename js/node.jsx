'use strict';

var React = require('react');
var dagre = require('dagre');
var Reflux = require('reflux');
var nodeStore = require('./stores/bleNodeStore');
var deviceStore = require('./stores/deviceStore');
var driverStore = require('./stores/bleDriverStore');
var connectionStore = require('./stores/connectionStore');
var connectionActions = require('./actions/connectionActions');
var DiscoveredDevice = require('./discoveredDevicesContainer.jsx').DiscoveredDevice;
var mui = require('material-ui');
var RaisedButton = mui.RaisedButton;
var Card = mui.Card;
var CardTitle= mui.CardTitle;
var _ = require('underscore');
var BleNodeContainer = React.createClass({

    mixins: [Reflux.listenTo(nodeStore, "onGraphChanged"), Reflux.connect(driverStore)],
    componentWillMount: function() {
        this.nodeIdToConnectionMap = {};
    },

    onGraphChanged: function(newGraph, change){
        this.setState({graph: newGraph}); // Must be done before connection is made since connection target is created by render
        if (change.remove) {
            jsPlumb.remove(change.nodeId);
            delete this.nodeIdToConnectionMap[change.nodeId];
        } else {
            var connectionParameters = {
                source: 'central',
                target: change.nodeId,
                anchor:[ "Continuous", { faces:["top","bottom"] }],
                endpoint:"Blank",
                connector:[ "Flowchart", { stub: [10, 10], gap: 0, cornerRadius: 0, alwaysRespectStubs: false }],
                overlays:[["Custom", {
                    create:function(component) {
                        return $('<span><span class="fa-stack fa-lg" style="font-size: 15px;"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-link fa-stack-1x fa-inverse"></i></span></span>');
                    },
                    location:0.5,
                    id:"customOverlay"
                }]]
            };
            var connection = jsPlumb.connect(connectionParameters);
            this.nodeIdToConnectionMap[change.nodeId] = connection;
            //this.setState({graph: newGraph});
        }
        

        this.autoLayout();

        console.log('onAddnode');
    },
    getInitialState: function(){
        return nodeStore.getInitialState();
    },
    autoLayout: function() {
        var nodes = $('.node');
        var edges = jsPlumb.getConnections();

        var dag = new dagre.graphlib.Graph();
        dag.setGraph({});
        dag.setDefaultEdgeLabel(function(){return{};});
        for(var i = 0; i < nodes.length; i++) {
            var n = $(nodes[i]);
            //console.log(n);
            dag.setNode(n.attr('id'), {width: n.width(), height: n.height()});
        }
        for(var i = 0; i < edges.length; i++) {
            var c = edges[i];
            //console.log(c);
            dag.setEdge(c.source.id, c.target.id);
        }
        dag.rankdir = 'TB';
        dag.nodeSep = 200;
        dagre.layout(dag, {rankdir: 'TB', ranksep: 200});
        dag.nodes().forEach(function(v) {
            if (v !== "undefined") {
                $("#" + v).css("left", dag.node(v).x + "px");
                $("#" + v).css("top", dag.node(v).y + "px");
            }
        });
        jsPlumb.repaintEverything();
    },

    render: function(){
        
        var plumbNodes = [];
        
        for (var i = 0; i < this.state.graph.length; i++) {
            var connection = this.nodeIdToConnectionMap[this.state.graph[i].id];
            plumbNodes.push(<BleNode key={i} nodeId={this.state.graph[i].id} device={this.state.graph[i].device} connection={connection} centralName = {this.state.centralName} centralAddress = {this.state.centralAddress}/>);
        }

        return (
            <div id="diagramContainer" style={{position: 'absolute'}} >
                {plumbNodes}
            </div>
    );
  }
});

var BleCentral = React.createClass({
    mixins: [Reflux.connect(driverStore)],
    componentDidMount: function(){
        var that = this;
        jsPlumb.bind("ready", function(){
            jsPlumb.draggable(that.props.nodeId);
        });
    },
    render: function(){
        
    }
});

var BleNode = React.createClass({
    getInitialState: function(){
        return {isShowingConnectionSlideIn: false};
    },
    componentDidMount: function(){
        var that = this;
        jsPlumb.bind("ready", function(){
            jsPlumb.draggable(that.props.nodeId);
        });
        console.log('BleNode did mount');
        this.didAddConnectionEventHandler = false;
    },
    toggleShowConnectionDetails: function() {
        this.showConnectionDetails = !this.showConnectionDetails;
    },
    _onToggleConnectionView: function() {
        console.log('_onShowConnectionView');
        this.setState({isShowingConnectionSlideIn: !this.state.isShowingConnectionSlideIn});
    
    }, 
    _disconnect: function() {
        console.log('disconnect');
        connectionActions.disconnectFromDevice(this.props.device.peer_addr.address);
    },
    render: function() {
        
            var self = this;
            var connectionViewStyle = {
                display: 'none',
                width: '150px',
                height: '200px',
                position: 'absolute',
                left: '150px',
                boxShadow: "0px 0px 4px 0px #777A89",
            };
            if (this.props.connection && !this.didAddConnectionEventHandler) {
                this.props.connection.bind('click', this._onToggleConnectionView);
                this.didAddConnectionEventHandler = true;
                console.log('added event handler');
            }

            connectionViewStyle.display = this.state.isShowingConnectionSlideIn ? 'inline-block': 'none';

            return (
          <div key={this.props.nodeId} id={this.props.nodeId} className="item node" style={{position: 'absolute', width: '150px', height: '200px'}}>
            <div style={connectionViewStyle}>
               <RaisedButton onClick={this._disconnect} label="Disconnect..."/>
            </div>
             <DiscoveredDevice
                                    standalone={true}
                                    star={false}
                                    bonded={false}
                                    device= {this.props.device}
                                />
            
          </div>
          );
        
  }
});



module.exports = BleNodeContainer;
