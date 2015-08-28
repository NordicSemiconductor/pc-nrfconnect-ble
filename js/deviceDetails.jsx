'use strict';

var react = require('react');
var reflux = require('reflux');
var connectionStore = require('./stores/connectionStore');
var deviceStore = require('./stores/deviceStore');

var pubsub = require('pubsub-js');

var bs = require('react-bootstrap');

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

var deviceDetailsStyle = {
    boxShadow: "0px 0px 4px 0px #777A89",
    width: '300px',
    position: 'absolute',
    left: '40px',
    top: '20px'
};

var listItemStyle = {
    border: "grey solid thin",
    paddingLeft: "0px"
};

var ServiceItem = React.createClass({
    getInitialState: function() {
        return {
            expanded: true // See UGLY HACK below in componentDidMount
        };

    },
    componentWillMount: function() {
        this.expandPubsubToken = pubsub.subscribe('expanded', this._expanded.bind(this));
        this.contractPubsubToken = pubsub.subscribe('contracted', this._expanded.bind(this));
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
    _expanded: function(){
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
        var expandIcon = this.state.expanded ? 'fa-caret-down' : 'fa-caret-right';
        var iconPadding = this.state.expanded ? '0px' :'3px';
        
        return (
            <div>
                <div className="panel panel-default" style={{marginBottom: '0px'}}>
                    <div style={{backgroundColor: '#B3E1F5', height: this.height, width: '10px', float: 'left'}}/>
                    <div onClick={this._toggleExpanded} className="panel-heading" style={{backgroundColor: 'white', padding: '5px 8px'}}>
                        <i className={"fa " + expandIcon} style={{paddingRight: iconPadding}}></i>
                        <span style={{marginLeft: '5px'}}>{this.props.serviceData.name}</span>
                        <span style={{float: 'right'}}>{this.props.serviceData.value}</span>
                        <div style={{color: 'grey', fontSize: '12px'}}>
                            <span style={{marginLeft: '13px'}}>{this.props.serviceData.uuid}</span><span style={{float: 'right'}}>0x180f</span>
                        </div>
                    </div>
                    <Collapse onEntered={this._expanded.bind(this)} onExited={this._expanded.bind(this)} timeout="0" ref="coll" className="panel-body" in={this.state.expanded}>
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
                    <span>Client Characteristic config</span>
                    <span style={{float: 'right'}}> 300sec</span>
                    <div style={{color: 'grey', fontSize: '12px'}}>
                        <span style={{marginLeft: '13px'}}>0xffaabb</span><span style={{float: 'right'}}>0x180f</span>
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
        console.log('height in didmount: ', this.height);
    },
    componentWillUpdate: function() {
        this.height = React.findDOMNode(this).offsetHeight;
    },
    componentDidUpdate: function() {
        this.height = React.findDOMNode(this).offsetHeight;
        console.log('the height is ',this.height);

    },
    render: function() {
        var expandIcon = this.state.expanded ? 'fa-caret-down' : 'fa-caret-right';
        var iconPadding = this.state.expanded ? '0px' :'3px';
        return (
        <div >
            <div className="panel panel-default" style={{marginBottom: '0px'}}>
                <div style={{backgroundColor: '#66C4EB', height: this.height, width: '10px', float: 'left'}}/>
                <div className="panel-heading" style={{fontSize: '11px', marginLeft: '10px', backgroundColor: 'white', padding: '5px 8px'}} onClick={this._toggleExpanded}>
                    
                    <i className={"fa " + expandIcon} style={{paddingRight: iconPadding}}></i>
                    <span>{this.props.characteristicData.name}</span>
                    <span style={{float: 'right'}}>{this.props.characteristicData.value}</span>
                    <div style={{color: 'grey', fontSize: '12px'}}>
                        <span style={{marginLeft: '13px'}}>{this.props.characteristicData.uuid}</span><span style={{float: 'right'}}>0x180f</span>
                    </div>

                </div>
            <Collapse  onEntered={this._expanded} onExited={this._contracted} timeout="0" ref="coll" className="panel-body" in= {this.state.expanded}>
                <div>
                    <DescriptorItem/>
                </div>
            </Collapse>
            </div>
        </div>
        );
    }
});



var DeviceDetailsView = React.createClass({
    render: function() {
        var services = dummyData.map(function(service){
            return (
                <ServiceItem serviceData={service}>
                    <div>
                    {service.characteristics.map(function(characteristic){
                        return (
                            <CharacteristicItem characteristicData={characteristic}/>
                        )
                    }
                    )}
                    </div>
                </ServiceItem>
            );
        });
        return (
            <div style={{width: '220px', top: '20px', left: '20px', position: 'relative'}}>
                {services}
            </div>
          );
    }
});
module.exports = DeviceDetailsView;