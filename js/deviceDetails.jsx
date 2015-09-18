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
import AddNewItem from './components/AddNewItem.jsx';

import { BlueWhiteBlinkMixin } from './utils/Effects.jsx';
import HexOnlyEditableField from './components/HexOnlyEditableField.jsx';
import logger from './logging';

var ServiceItem = React.createClass({
    mixins: [BlueWhiteBlinkMixin],
    getInitialState: function() {
        return {
            expanded: false
        };
    },
    _toggleExpanded: function() {
        this.setState({expanded: !this.state.expanded});
    },
    _childChanged: function() {
        if (!this.state.expanded) {
            this.blink();
        }
    },
    render: function() {
        var expandIcon = this.state.expanded ? 'icon-down-dir' : 'icon-right-dir';
        var iconStyle = this.props.characteristics.length === 0 ? { display: 'none' } : {};
        var backgroundColor = `rgb(${Math.floor(this.state.backgroundColor.r)}, ${Math.floor(this.state.backgroundColor.g)}, ${Math.floor(this.state.backgroundColor.b)})`;
        return (
            <div>
                <div className="service-item" style={{ backgroundColor: backgroundColor }}>
                    <div className="bar1"></div>
                    <div className="content-wrap" onClick={this._toggleExpanded}>
                        <div className="icon-wrap"><i className={"icon-slim " + expandIcon} style={iconStyle}></i></div>
                        <div className="content">
                            <div className="service-name truncate-text" >{this.props.serviceData.name}</div>
                        </div>
                    </div>
                </div>
                <Collapse timeout={0} ref="coll" in={this.state.expanded}>
                    <div>
                        {this.props.characteristics.map((characteristic, j) =>
                            <CharacteristicItem name={characteristic.name} value={characteristic.value} 
                                descriptors={characteristic.descriptors} onChange={this._childChanged} key={j} />
                        )}
                    </div>
                </Collapse>
            </div>
        );
    }
});

var DescriptorItem = React.createClass({
    mixins: [BlueWhiteBlinkMixin],
    getInitialState: function() {
        return {};
    },
    componentWillReceiveProps: function(nextProps) {
        if (this.props.value !== nextProps.value) {
            if (this.props.onChange) {
                this.props.onChange()
            }
            this.blink();
        }
    },
    render: function() {
        var backgroundColor = `rgb(${Math.floor(this.state.backgroundColor.r)}, ${Math.floor(this.state.backgroundColor.g)}, ${Math.floor(this.state.backgroundColor.b)})`;
         return (
            <div className="descriptor-item" style={{ backgroundColor: backgroundColor }}>
                <div className="bar1"></div>
                <div className="bar2"></div>
                <div className="bar3"></div>
                <div className="content-wrap">
                    <div className="content">
                        <div className="truncate-text">{this.props.name}</div>
                        <HexOnlyEditableField value={this.props.value} insideSelector=".device-details-view" />
                    </div>
                </div>
            </div>
        );
    }
});

var CharacteristicItem = React.createClass({
    mixins: [BlueWhiteBlinkMixin],
    getInitialState: function() {
        return {
            expanded: false
        };
    },
    componentWillReceiveProps: function(nextProps) {
        if (this.props.value !== nextProps.value) {
            if (this.props.onChange) {
                this.props.onChange();
            }
            this.blink();
        }
    },
    _toggleExpanded: function() {
        this.setState({expanded: !this.state.expanded});
    },
    _childChanged: function() {
        if (this.props.onChange) {
            this.props.onChange();
        }
        if (!this.state.expanded) {
            this.blink();
        }
    },
    render: function() {
        var expandIcon = this.state.expanded ? 'icon-down-dir' : 'icon-right-dir';
        var iconStyle = this.props.descriptors.length === 0 ? { display: 'none' } : {};
        var backgroundColor = `rgb(${Math.floor(this.state.backgroundColor.r)}, ${Math.floor(this.state.backgroundColor.g)}, ${Math.floor(this.state.backgroundColor.b)})`;
        return (
        <div>
            <div className="characteristic-item" style={{ backgroundColor: backgroundColor }} ref="item">
                <div className="bar1"></div>
                <div className="bar2"></div>
                <div className="content-wrap" onClick={this._toggleExpanded}>
                    <div className="icon-wrap"><i className={"icon-slim " + expandIcon} style={iconStyle}></i></div>
                    <div className="content">
                        <div className="truncate-text">{this.props.name}</div>
                        <HexOnlyEditableField value={this.props.value} insideSelector=".device-details-view" />
                        </div>
                    </div>
                </div>
            <Collapse timeout={0} ref="coll" in={this.state.expanded}>
                <div>
                    {this.props.descriptors.map((descriptor, k) =>
                        <DescriptorItem name={descriptor.name} value={descriptor.value} key={k} onChange={this._childChanged}/>
                    )}
                </div>
            </Collapse>
        </div>
        );
    }
});

var DeviceDetailsContainer = React.createClass({
    mixins: [Reflux.connect(nodeStore), Reflux.connect(connectionStore)],

    render: function() {
        var elemWidth = 250;
        var detailNodes = this.state.graph.map((node, i) => {
            var deviceAddress = this.state.graph[i].deviceId;
            var deviceServices = this.state.deviceAddressToServicesMap[deviceAddress];
            return <DeviceDetailsView services={deviceServices} node={node} device={node.device} isEnumeratingServices = {this.state.isEnumeratingServices}
                                      containerHeight={this.props.style.height} key={i}/>

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
        logger.silly(this.props.services);
        var services = [];
        if (this.props.services) {
            return (
                <div className="device-details-view" id={this.props.node.id + '_details'} style={this.props.style}>
                    <ConnectedDevice device={this.props.device} node={this.props.node} sourceId="central_details" id={this.props.node.id+ '_details'} layout="vertical"/>
                    <div className="service-items-wrap">
                        {this.props.services.map((service, i) =>
                            <ServiceItem serviceData={service} key={i} characteristics={service.characteristics} />
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
