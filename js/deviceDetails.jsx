'use strict';

import logger from './logging';

var react = require('react');
var Reflux = require('reflux');
var connectionStore = require('./stores/connectionStore');
var ConnectedDevice = require('./components/ConnectedDevice.jsx');

var nodeStore = require('./stores/bleNodeStore');
var pubsub = require('pubsub-js');

var bs = require('react-bootstrap');
import CentralDevice from './components/CentralDevice.jsx';
var Panel = bs.Panel;
var PanelGroup = bs.PanelGroup;
var Collapse = bs.Collapse;

var dummyData = [
    {
        "handle": 1,
        "uuid": "0x1809",
        "name": "Health Thermometer",
        "value": '57%',
        "characteristics": [
        {
            "name": "Temperature",
            "uuid": "0x2A1D",
            "value": "37,5C",
            "descriptors": []
        },
        {
            "name": "Measurement Interval",
            "uuid": "0x2A1D",
            "value": "300 sec",
            "descriptors": [
            {
                "name": "Client Characteristic Configuration",
                "uuid": "0x0028",
                "value": "300 sec"
            }]
        }]
    },
    {
        "handle": 2,
        "uuid": "0x1800",
        "name": "Generic Access",
        "value": '56%',
        characteristics: []

    }
];

var ServiceItem = React.createClass({
    getInitialState: function() {
        return {
            expanded: false
        };
    },
    _toggleExpanded: function(){
        this.setState({expanded: !this.state.expanded});
    },
    render: function() {
        var expandIcon = this.state.expanded ? 'icon-down-dir' : 'icon-right-dir';
        var iconStyle = React.Children.count(this.props.children) === 0 ? { display: 'none' } : {};
        return (
            <div>
                <div className="service-item">
                    <div className="bar1"></div>
                    <div className="content-wrap" onClick={this._toggleExpanded}>
                        <div className="icon-wrap"><i className={"icon-slim " + expandIcon} style={iconStyle}></i></div>
                        <div className="content">
                            <span>{this.props.serviceData.name}</span>
                        </div>
                    </div>
                </div>
                <Collapse timeout={0} ref="coll" in={this.state.expanded}>
                    <div>
                        {this.props.children}
                    </div>
                </Collapse>
            </div>
        );
    }
});

var DescriptorItem = React.createClass({
    render: function() {
         return (
            <div className="descriptor-item">
                <div className="bar1"></div>
                <div className="bar2"></div>
                <div className="bar3"></div>
                <div className="content-wrap">
                    <div className="content">
                        <span>{this.props.descriptorData.name}</span>
                        <div className="text-subtle">
                            <span>{this.props.descriptorData.value}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var CharacteristicItem = React.createClass({
    getInitialState: function() {
        return {
            expanded: false
        };
    },
    _toggleExpanded: function() {
        this.setState({expanded: !this.state.expanded});
    },
    render: function() {
        var expandIcon = this.state.expanded ? 'icon-down-dir' : 'icon-right-dir';
        var iconStyle = React.Children.count(this.props.children) === 0 ? { display: 'none' } : {};
        return (
        <div>
            <div className="characteristic-item">
                <div className="bar1"></div>
                <div className="bar2"></div>
                <div className="content-wrap" onClick={this._toggleExpanded}>
                    <div className="icon-wrap"><i className={"icon-slim " + expandIcon} style={iconStyle}></i></div>
                    <div className="content">
                        <span>{this.props.characteristicData.name}</span>
                        <div className="text-subtle">
                            <span>{this.props.characteristicData.value}</span>
                        </div>
                    </div>
                </div>
            </div>
            <Collapse timeout={0} ref="coll" in={this.state.expanded}>
                <div>
                    {this.props.children}
                </div>
            </Collapse>
        </div>
        );
    }
});

var DeviceDetailsContainer = React.createClass({
    mixins: [Reflux.listenTo(nodeStore, "onGraphChanged"), Reflux.connect(connectionStore)],
    componentWillMount: function() {
        this.plumb = jsPlumb.getInstance();
    },
    componentDidMount: function() {
        this.plumb.setContainer(React.findDOMNode(this));
    },
    getInitialState: function(){
        return nodeStore.getInitialState();
    },
    onGraphChanged: function(newGraph, change) {
        if (change.remove) {
            this.plumb.remove(change.nodeId+'_details');
            this.plumb.repaintEverything();
        }
/*        this.setState({graph: newGraph});
        this.plumb.detachEveryConnection();
        var central = this.state.graph.find(function(node){
            return node.id ==='central';
        });
        for(var i = 0; i< central.ancestorOf.length; i++) {
            var connectionParameters = {
                source: 'central_details',
                target: central.ancestorOf[i]+ "_details",
                anchor: "Top",
                endpoint:"Blank",
                connector:[ "Flowchart", { stub: [10, 10], gap: 0, cornerRadius: 0.5, alwaysRespectStubs: false }],
            };
            var connection = this.plumb.connect(connectionParameters);
        }
        this.plumb.repaintEverything();*/
    },
    _drawGraph: function() {
        this.plumb.detachEveryConnection();
        var central = this.state.graph.find(function(node){
            return node.id === 'central';
        });
        for(var i = 0; i< central.ancestorOf.length; i++) {
            var connectionParameters = {
                source: 'central_details',
                target: central.ancestorOf[i]+ "_details",
                anchor: "Top",
                endpoint:"Blank",
                connector:[ "Flowchart", { stub: [10, 10], gap: 0, cornerRadius: 0.5, alwaysRespectStubs: false }],
            };
            var connection = this.plumb.connect(connectionParameters);
        }
        this.plumb.repaintEverything();
    },
    render: function() {
        var margin = 5;
        var elemWidth = 250;
        var buffer = 30;
        var detailNodes = this.state.graph.map((node, i) => {
            var deviceAddress = this.state.graph[i].deviceId;
            var deviceServices = this.state.deviceAddressToServicesMap[deviceAddress];
            return <DeviceDetailsView services={deviceServices} plumb={this.plumb} node={node} device={node.device} 
                                    containerHeight={this.props.style.height} style={{margin: margin}} key={i}/>
        });
        var perNode = (margin * 2) + elemWidth;
        var width = (perNode * detailNodes.length) + buffer;
        return (<div className="device-details-container" style={this.props.style}><div style={{width: width}}>{detailNodes}</div></div>);

    },
    componentDidUpdate: function() {
        //this._drawGraph();
    }
});

var DeviceDetailsView = React.createClass({
    render: function() {
        var centralPosition = {
            x: 0,
            y: 0
        };
        logger.silly(this.props.services);
        var services = [];
        var topBoxHeight = 105;
        if (this.props.services) {
            return (
                <div className="device-details-view" id={this.props.node.id + '_details'} style={this.props.style}>
                    <ConnectedDevice device={this.props.device} node={this.props.node} sourceId="central_details" id={this.props.node.id+ '_details'} parentId="device_details"/>
                    <div className="service-items-wrap" style={{maxHeight: this.props.containerHeight - topBoxHeight - 50}}>
                        {this.props.services.map(function(service, i) {
                            return (<ServiceItem serviceData={service} key={i}>
                                {service.characteristics.map(function(characteristic, j) {
                                    return (<CharacteristicItem characteristicData={characteristic} key={j}>
                                        {characteristic.descriptors.map(function(descriptor, k) {
                                            return (
                                                <DescriptorItem descriptorData={descriptor} key={k}/>
                                            )
                                        })}
                                    </CharacteristicItem>)
                                })}
                            </ServiceItem>)
                        })}
                    </div>
                </div>
            );
        } else if (this.props.node.id === 'central'){
            return (
                <CentralDevice id="central_details" name="dummy" position={centralPosition}/>
            );
        } else {return <div/>}
    }
});
module.exports = DeviceDetailsContainer;
