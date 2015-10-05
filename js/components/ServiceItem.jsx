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

import CharacteristicItem from './CharacteristicItem';
import AddNewItem from './AddNewItem.jsx';

import {Properties} from '../gattDatabases';

import { BlueWhiteBlinkMixin } from '../utils/Effects.jsx';

//import _ from 'underscore';


var ServiceItem = React.createClass({
    mixins: [BlueWhiteBlinkMixin],
    getInitialState: function() {
        return {
            expanded: false
        };
    },
    componentWillReceiveProps: function(nextProps) {
        if (this.props.selected === nextProps.selected && nextProps.selected === this.props.item) {
            this.setState({ expanded: nextProps.selected.expanded });
        }
    },
    _onContentClick: function(e) {
        e.stopPropagation();

        if (this.props.onSelected) {
            this.props.onSelected(this.props.item);
        }
    },
    _onExpandAreaClick(e) {
        if (this.props.characteristics.length === 0 && !this.props.addNew) {
            return;
        }

        e.stopPropagation();
        this.setState({expanded: !this.state.expanded});
    },
    _childChanged: function() {
        if (!this.state.expanded) {
            this.blink();
        }
    },
    componentWillUpdate: function(nextProps, nextState) {
        nextProps.item.expanded = nextState.expanded;
    },
    _addCharacteristic: function() {
        var handle = Math.random(); //just need a unique value until a real handle is assigned by the driver
        var characteristic = {"handle": handle,"uuid":"","name":"New characteristic","descriptors":[],"properties":new Properties(0x0A),"valueHandle":3,"characteristicUuid":"","value":""};
        characteristic.parent = this.props.item;
        this.props.item.characteristics.push(characteristic);
        if (this.props.onSelected) {
            this.props.onSelected(characteristic);
        } else {
            this.forceUpdate();
        }
    },
    /*
    //This speeds things up 2x, but breaks notifications:
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
    },/**/
    render: function() {
        var expandIcon = this.state.expanded ? 'icon-down-dir' : 'icon-right-dir';
        var iconStyle = this.props.characteristics.length === 0 && !this.props.addNew ? { display: 'none' } : {};
        var selected = this.props.item === this.props.selected;
        var backgroundColor = selected
            ? 'rgb(179,225,245)'
            : `rgb(${this.state.backgroundColor.r}, ${this.state.backgroundColor.g}, ${this.state.backgroundColor.b})`;
        return (
            <div>
                <div className="service-item" style={{ backgroundColor: backgroundColor }}  onClick={this._onContentClick}>
                    <div className="expand-area" onClick={this._onExpandAreaClick}>
                        <div className="bar1" />
                        <div className="icon-wrap"><i className={"icon-slim " + expandIcon} style={iconStyle}></i></div>
                    </div>
                    <div className="content-wrap">
                        <div className="content">
                            <div className="service-name truncate-text" title={'[' + this.props.item.handle + '] ' + this.props.name}>{this.props.name}</div>
                        </div>
                    </div>
                </div>
                <div style={{display: this.state.expanded ? 'block' : 'none'}}>
                    {this.props.characteristics.map((characteristic, j) =>
                        <CharacteristicItem name={characteristic.name} value={characteristic.value} item={characteristic}
                            selected={this.props.selected} onSelected={this.props.onSelected} descriptors={characteristic.descriptors}
                            onChange={this._childChanged} key={j} addNew={this.props.addNew} selectOnClick={this.props.selectOnClick}
                            connectionHandle={this.props.connectionHandle} />
                    )}
                    {this.props.addNew ? <AddNewItem text="New characteristic" id={"add-btn-" + this.props.item.handle} selected={this.props.selected} onClick={this._addCharacteristic} bars={2} /> : null}
                </div>
            </div>
        );
    }
});

module.exports = ServiceItem;
