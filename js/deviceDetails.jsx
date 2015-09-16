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

import react from 'react';
import Reflux from 'reflux';

import {Collapse} from 'react-bootstrap';

import driverStore from './stores/bleDriverStore';
import connectionStore from './stores/connectionStore';
import nodeStore from './stores/bleNodeStore';

import ConnectedDevice from './components/ConnectedDevice.jsx';
import CentralDevice from './components/CentralDevice.jsx';
import logger from './logging';

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
    mixins: [Reflux.connect(nodeStore), Reflux.connect(connectionStore)],
    
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
    }
});

var DeviceDetailsView = React.createClass({
    mixins: [Reflux.connect(driverStore)],
    render: function() {
        var centralPosition = {
            x: 0,
            y: 0
        };
        logger.silly(this.props.services);
        var services = [];
        if (this.props.services) {
            return (
                <div className="device-details-view" id={this.props.node.id + '_details'} style={this.props.style}>
                    <ConnectedDevice device={this.props.device} node={this.props.node} sourceId="central_details" id={this.props.node.id+ '_details'} layout="vertical"/>
                    <div className="service-items-wrap">
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
        } else if (this.props.node.id === 'central' && this.state.connectedToDriver){
            return (
                <CentralDevice id="central_details" name={this.state.centralName} address={this.state.centralAddress.address} position={centralPosition}/>
            );
        } else {return <div/>}
    }
});
module.exports = DeviceDetailsContainer;
