'use strict';

import logger from './logging';

var react = require('react');
var Reflux = require('reflux');
var connectionStore = require('./stores/connectionStore');

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
            expanded: true // See UGLY HACK below in componentDidMount
        };
    },
    componentWillMount: function() {
        this.expandPubsubToken = pubsub.subscribe('expanded', this._heightChanged);
        this.contractPubsubToken = pubsub.subscribe('contracted', this._heightChanged);
    },
    componentWillUnMount: function() {
        pubsub.unsubscripe(this.expandPubsubToken);
        pubsub.unsubscripe(this.contractPubsubToken);
    },
    _toggleExpanded: function(){
        this.setState({expanded: !this.state.expanded});
    },
    _updateHeight: function() {
        this.height = this.getDOMNode().offsetHeight;
    },
    _heightChanged: function(){
        this.height= this.getDOMNode().offsetHeight;
        this.setState({});
    },
    componentDidMount: function() {
        this._updateHeight();
        // UGLY HACK to make the Descriptor's hierarchy div show on first expand
        // Race condition:
        // If descriptor child is not done setting it's height by the time this timeout fires, there will be no hierarchy bar for it.
        var that = this;
        setTimeout(function() {
            that.setState({expanded: false});
        }, 1000);
    },
    render: function() {
        var expandIcon = this.state.expanded ? 'icon-down-dir' : 'icon-right-dir';
        var iconPadding = this.state.expanded ? '0px' :'3px';

        return (
            <div>
                <div className="panel panel-default" style={{marginBottom: '0px'}}>
                    <div style={{backgroundColor: '#B3E1F5', height: this.height, width: '10px', float: 'left'}}/>
                    <div onClick={this._toggleExpanded} className="panel-heading" style={{backgroundColor: 'white', padding: '5px 8px'}}>
                        <i className={"icon-slim " + expandIcon} style={{paddingRight: iconPadding}}></i>
                        <span style={{marginLeft: '5px'}}>{this.props.serviceData.name}</span>
                    </div>
                    <Collapse onEntered={this._heightChanged} onExited={this._heightChanged} timeout={0} ref="coll" className="panel-body" in={this.state.expanded}>
                        {this.props.children}
                    </Collapse>
                </div>
            </div>
        );
    }
});

var DescriptorItem = React.createClass({
    componentWillUpdate: function() {
        this.height = React.findDOMNode(this).offsetHeight;
    },
    render: function() {
         return (
            <div className="panel panel-default" style={{marginBottom: '0px'}}>
                <div style={{backgroundColor: '#009CDE', height: this.height, width: '10px', float: 'left'}}/>
                <div className="panel-heading" style={{fontSize: '11px', marginLeft: '10px', backgroundColor: 'white', padding: '5px 8px'}}>
                    <span>{this.props.descriptorData.name}</span>
                    <div style={{color: 'grey', fontSize: '12px'}}>
                        <span style={{marginLeft: '13px'}}>{this.props.descriptorData.value}</span>
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
    _expanded: function() {
        this.height= this.getDOMNode().offsetHeight;
        this.setState({});
        pubsub.publish('expanded');
    },
    _contracted: function() {
        this.height= this.getDOMNode().offsetHeight;
        this.setState({});
        pubsub.publish('contracted');
    },
    componentDidMount: function() {
        this.height = React.findDOMNode(this).offsetHeight;
    },
    render: function() {
        var expandIcon = this.state.expanded ? 'icon-down-dir' : 'icon-right-dir';
        var iconPadding = this.state.expanded ? '0px' :'3px';
        return (
        <div >
            <div className="panel panel-default" style={{marginBottom: '0px'}}>
                <div style={{backgroundColor: '#66C4EB', height: this.height, width: '10px', float: 'left'}}/>
                <div className="panel-heading" style={{fontSize: '11px', marginLeft: '10px', backgroundColor: 'white', padding: '5px 8px'}} onClick={this._toggleExpanded}>
                    <i className={"icon-slim " + expandIcon} style={{paddingRight: iconPadding}}></i>
                    <span>{this.props.characteristicData.name}</span>
                    <div style={{color: 'grey', fontSize: '12px'}}>
                        <span style={{marginLeft: '13px'}}>{this.props.characteristicData.value}</span>
                    </div>
                </div>
            <Collapse  onEntered={this._expanded} onExited={this._contracted} timeout={0} ref="coll" className="panel-body" in= {this.state.expanded}>
                {this.props.children}
            </Collapse>
            </div>
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
        this.setState({graph: newGraph});
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
        this.plumb.repaintEverything();
    },
    render: function() {
        var detailNodes = [];
        // TODO: Use flexbox for positioning elements?
        for(var i = 0; i<this.state.graph.length; i++) {
            var nodeId = this.state.graph[i].id;
            var deviceAddress = this.state.graph[i].deviceId;
            var deviceServices = this.state.deviceAddressToServicesMap[deviceAddress];
            var xPos = i*200 + "px";
            detailNodes.push(<DeviceDetailsView services={deviceServices} plumb={this.plumb} nodeId={nodeId+ '_details'}  key={i}/>)
        }
        return (<div className="device-details-container" style={this.props.style}>{detailNodes}</div>)
    },
    componentDidUpdate: function() {
         this.plumb.repaintEverything();
    }
});

var DeviceDetailsView = React.createClass({
    componentDidMount: function() {
        var that = this;
    },
    render: function() {
        logger.silly(this.props.services);
        var services = [];
        if (this.props.services) {
            services = this.props.services.map(function(service, i){
                return (
                    <ServiceItem serviceData={service} key={i}>
                    <div>
                        {service.characteristics.map(function(characteristic, j){
                            return (
                                <CharacteristicItem characteristicData={characteristic} key={j}>
                                <div>
                                    {characteristic.descriptors.map(function(descriptor, k) {
                                        return (
                                            <DescriptorItem descriptorData={descriptor} key={k}/>
                                        )
                                    }
                                    )}
                                </div>
                                </CharacteristicItem>
                            )
                        }
                        )}
                    </div>
                    </ServiceItem>

                );
            });
            return (
                <div className="device-details-view" id={this.props.nodeId} style={this.props.style}>
                    {services}
                </div>
        );
        } else {
            return (
                <CentralDevice name="dummy"/>
            );
        }
    }
});
module.exports = DeviceDetailsContainer;
