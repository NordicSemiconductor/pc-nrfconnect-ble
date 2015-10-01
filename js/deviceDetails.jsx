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

import driverStore from './stores/bleDriverStore';
import connectionStore from './stores/connectionStore';
import nodeStore from './stores/bleNodeStore';

import ConnectedDevice from './components/ConnectedDevice.jsx';
import CentralDevice from './components/CentralDevice.jsx';

import KeyNavigation from './common/TreeViewKeyNavigationMixin.jsx';
import logger from './logging';

import ServiceItem from './components/ServiceItem';


var DeviceDetailsContainer = React.createClass({
    mixins: [Reflux.connect(nodeStore), Reflux.connect(connectionStore), KeyNavigation.mixin('allServices')],
    _onSelected(selected) {
        this.setState({ selected: selected });
    },
    componentWillMount: function() {
        this.componentWillUpdate();
    },
    componentWillUpdate: function() {
        this.allServices = [];
        this.state.graph.map((node, i) => {
            var deviceServices = this.state.deviceAddressToServicesMap[node.deviceId];
            if (deviceServices) {
                this.allServices.push(...deviceServices);
            }
        });
    },

    render: function() {
        var elemWidth = 250;
        var detailNodes = this.state.graph.map((node, i) => {
            var deviceServices = this.state.deviceAddressToServicesMap[node.deviceId];
            return <DeviceDetailsView services={deviceServices} selected={this.state.selected} onSelected={this._onSelected} node={node} device={node.device}
                                       isEnumeratingServices={this.state.isEnumeratingServices} containerHeight={this.props.style.height} key={i}/>

        });
        var perNode = (20 + elemWidth);
        var width = (perNode * detailNodes.length);
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
        var services = [];
        if (this.props.services) {
            return (
                <div className="device-details-view" id={this.props.node.id + '_details'} style={this.props.style}>
                    <ConnectedDevice device={this.props.device} node={this.props.node} sourceId="central_details" id={this.props.node.id+ '_details'} layout="vertical"/>
                    <div className="service-items-wrap">
                        {this.props.services.map((service, i) =>
                            <ServiceItem name={service.name} key={i} characteristics={service.characteristics} item={service} selected={this.props.selected} onSelected={this.props.onSelected} selectOnClick={true}/>
                        )}
                    </div>
                </div>
            );
        } else if (this.props.node.id === 'central' && this.state.connectedToDriver){
            return (
                <CentralDevice id="central_details" name={this.state.centralName} address={this.state.centralAddress.address} position={centralPosition}/>
            );
        } else if (this.props.isEnumeratingServices) {
            return (
                <div className="device-details-view" id={this.props.node.id + '_details'} style={this.props.style}>
                    <ConnectedDevice device={this.props.device} node={this.props.node} sourceId={'central_details'} id ={this.props.node.id + '_details'} layout="vertical"/>
                    <div className="service-items-wrap device-body text-small">
                        <div style={{textAlign:'center'}}>Enumerating services...</div>
                        <img className="spinner center-block" src="resources/ajax-loader.gif" height="32" width="32"/>
                    </div>
                </div>
            );
        } else {return <div/>}
    }
});

module.exports = DeviceDetailsContainer;
