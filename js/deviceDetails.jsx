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
import AddNewItem from './components/AddNewItem.jsx';
import HexOnlyEditableField from './components/HexOnlyEditableField.jsx';

import { BlueWhiteBlinkMixin } from './utils/Effects.jsx';
import KeyNavigation from './common/TreeViewKeyNavigationMixin.jsx';
import logger from './logging';
import _ from 'underscore';

var ServiceItem = React.createClass({
    mixins: [BlueWhiteBlinkMixin],
    getInitialState: function() {
        return {
            expanded: false
        };
    },
    _onClick: function() {
        //if selectOnClick is true, clicks are used for both expansion and selection.
        //in this case, dont collapse children unless the item is selected. 
        //this seems like a good tradeoff between letting the user know something is there,
        //and avoiding unwanted expansions/collapses when user wants to select.
        var isSelected = this.props.item === this.props.selected;
        var delayExpansion = this.props.selectOnClick && !isSelected && this.state.expanded;
        if (!delayExpansion) {
            this.setState({expanded: !this.state.expanded});
        }
        
        if (this.props.onSelected) {
            this.props.onSelected(this.props.item);
        }
    },
    _childChanged: function() {
        if (!this.state.expanded) {
            this.blink();
        }
    },
    _childNeedsVisibility: function() {
        if (!this.state.expanded) {
            this.setState({ expanded: true });
        }
    },
    componentWillUpdate: function(nextProps, nextState) {
        nextProps.item.expanded = nextState.expanded;
    },
    _addCharacteristic: function() {
        var characteristic = {"handle":2,"uuid":"","name":"New characteristic","descriptors":[],"properties":{"broadcast":0,"read":2,"writeWithoutResponse":0,"write":8,"notify":0,"indicate":0,"authenticatedSignedWrites":0,"extendedProperties":0},"valueHandle":3,"characteristicUuid":"","value":""};
        this.props.item.characteristics.push(characteristic);
        if (this.props.onSelected) {
            this.props.onSelected(characteristic);
        } else {
            this.forceUpdate();
        }
    },
    /*
    This speeds things up 2x, but breaks notifications:
    shouldComponentUpdate: function(nextProps, nextState) {
        //on key navigation, props.selected changes on every keypress, but this only affects
        //the selected node and whatever subtree contains props.selected.
        //We should avoid redrawing unless affected.
        for (var prop in nextProps) {
            if (prop === "selected") {
                //if selected is this.item, or is a child node of it, we need to update
                //if this.item or a child was selected last time, we also need to update
                var selected = nextProps[prop];
                var prevSelected = this.props.selected;
                if (this.props.item === selected  || this.props.item === prevSelected) return true;
                for (var i = 0; i < this.props.characteristics.length; i++) {
                    var characteristic = this.props.characteristics[i];
                    if (characteristic === selected || characteristic === prevSelected) return true;
                    if (characteristic.descriptors.includes(selected) || characteristic.descriptors.includes(prevSelected)) return true;
                }
            } else {
                if (!_.isEqual(nextProps[prop], this.props[prop])) return true;
            }
        }
        var changed = !_.isEqual(nextState, this.state);
        return changed;
    },*/
    render: function() {
        var expandIcon = this.state.expanded ? 'icon-down-dir' : 'icon-right-dir';
        var iconStyle = this.props.characteristics.length === 0 && !this.props.addNew ? { display: 'none' } : {};
        var selected = this.props.item === this.props.selected;
        var backgroundColor = selected
            ? 'rgb(179,225,245)'
            : `rgb(${Math.floor(this.state.backgroundColor.r)}, ${Math.floor(this.state.backgroundColor.g)}, ${Math.floor(this.state.backgroundColor.b)})`;
        return (
            <div>
                <div className="service-item" style={{ backgroundColor: backgroundColor }}>
                    <div className="bar1"></div>
                    <div className="content-wrap" onClick={this._onClick}>
                        <div className="icon-wrap"><i className={"icon-slim " + expandIcon} style={iconStyle}></i></div>
                        <div className="content">
                            <div className="service-name truncate-text" >{this.props.name}</div>
                        </div>
                    </div>
                </div>
                <div style={{display: this.state.expanded ? 'block' : 'none'}}>
                    {this.props.characteristics.map((characteristic, j) =>
                        <CharacteristicItem name={characteristic.name} value={characteristic.value} onRequestVisibility={this._childNeedsVisibility}
                            item={characteristic} selected={this.props.selected} onSelected={this.props.onSelected}
                            descriptors={characteristic.descriptors} onChange={this._childChanged} key={j} addNew={this.props.addNew} selectOnClick={this.props.selectOnClick}/>
                    )}
                    {this.props.addNew ? <AddNewItem text="New characteristic" id={"add-btn-" + this.props.item.id} selected={this.props.selected} onRequestVisibility={this._childNeedsVisibility} onClick={this._addCharacteristic} bars={2} /> : null}
                </div>
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
        //if we're selected through keyboard navigation, we need to make sure we're visible
        if (this.props.selected !== nextProps.selected && nextProps.selected === this.props.item) {
            this.props.onRequestVisibility();
        }
    },
    _onClick: function() {
        if (this.props.onSelected) {
            this.props.onSelected(this.props.item);
        }
    },
    render: function() {
        var selected = this.props.item === this.props.selected;
        var backgroundColor = selected
            ? 'rgb(179,225,245)'
            : `rgb(${Math.floor(this.state.backgroundColor.r)}, ${Math.floor(this.state.backgroundColor.g)}, ${Math.floor(this.state.backgroundColor.b)})`;
        return (
            <div className={"descriptor-item" + (selected ? " selected" : "")} style={{ backgroundColor: backgroundColor }} onClick={this._onClick}>
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
        //if we're selected through keyboard navigation, we need to make sure we're visible
        if (this.props.selected !== nextProps.selected && nextProps.selected === this.props.item) {
            this.props.onRequestVisibility();
        }
    },
    _childNeedsVisibility: function() {
        if (!this.state.expanded) {
            this.setState({ expanded: true });
        }
        this.props.onRequestVisibility();
    },
    componentWillUpdate: function(nextProps, nextState) {
        nextProps.item.expanded = nextState.expanded;
    },
    _onClick: function() {
        //if selectOnClick is true, clicks are used for both expansion and selection.
        //in this case, dont collapse children unless the item is selected. 
        //this seems like a good tradeoff between letting the user know something is there,
        //and avoiding unwanted expansions/collapses when user wants to select.
        var isSelected = this.props.item === this.props.selected;
        var delayExpansion = this.props.selectOnClick && !isSelected && this.state.expanded;
        if (!delayExpansion) {
            this.setState({expanded: !this.state.expanded});
        }

        if (this.props.onSelected) {
            this.props.onSelected(this.props.item);
        }
    },
    _childChanged: function() {
        if (this.props.onChange) {
            this.props.onChange();
        }
        if (!this.state.expanded) {
            this.blink();
        }
    },
    _addDescriptor: function() {
        var descriptor = {"handle":0,"uuid":"","name":"New descriptor","value":""};
        this.props.item.descriptors.push(descriptor);
        if (this.props.onSelected) {
            this.props.onSelected(descriptor);
        } else {
            this.forceUpdate();
        }
    },
    render: function() {
        var expandIcon = this.state.expanded ? 'icon-down-dir' : 'icon-right-dir';
        var iconStyle = this.props.descriptors.length === 0 && !this.props.addNew  ? { display: 'none' } : {};
        var selected = this.props.item === this.props.selected;
        var backgroundColor = selected
            ? 'rgb(179,225,245)'
            : `rgb(${Math.floor(this.state.backgroundColor.r)}, ${Math.floor(this.state.backgroundColor.g)}, ${Math.floor(this.state.backgroundColor.b)})`;
        return (
        <div>
            <div className="characteristic-item" style={{ backgroundColor: backgroundColor }} ref="item">
                <div className="bar1"></div>
                <div className="bar2"></div>
                <div className="content-wrap" onClick={this._onClick}>
                    <div className="icon-wrap"><i className={"icon-slim " + expandIcon} style={iconStyle}></i></div>
                    <div className="content">
                        <div className="truncate-text">{this.props.name}</div>
                        <HexOnlyEditableField value={this.props.value} insideSelector=".device-details-view" />
                    </div>
                </div>
            </div>
            <div style={{display: this.state.expanded ? 'block' : 'none'}}>
                {this.props.descriptors.map((descriptor, k) =>
                    <DescriptorItem name={descriptor.name} value={descriptor.value} onChange={this._childChanged} onRequestVisibility={this._childNeedsVisibility}
                        item={descriptor} selected={this.props.selected} onSelected={this.props.onSelected}  selectOnClick={this.props.selectOnClick} key={k} />
                )}
                {this.props.addNew ? <AddNewItem text="New descriptor" id={"add-btn-" + this.props.item.id} selected={this.props.selected} onRequestVisibility={this._childNeedsVisibility} onClick={this._addDescriptor} bars={3} /> : null}
            </div>
        </div>
        );
    }
});

var DeviceDetailsContainer = React.createClass({
    mixins: [Reflux.connect(nodeStore), Reflux.connect(connectionStore), KeyNavigation.mixin('allServices')],
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
            return <DeviceDetailsView services={deviceServices} selected={this.state.selected} node={node} device={node.device}
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
                            <ServiceItem name={service.name} key={i} characteristics={service.characteristics} item={service} selected={this.props.selected} selectOnClick={false}/>
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
module.exports = { DeviceDetailsContainer, ServiceItem };
