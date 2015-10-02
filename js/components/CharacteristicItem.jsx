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

import DescriptorItem from './DescriptorItem';
import AddNewItem from './AddNewItem.jsx';
import HexOnlyEditableField from './HexOnlyEditableField.jsx';

import bleDriverActions from '../actions/bleDriverActions';

import { BlueWhiteBlinkMixin } from '../utils/Effects.jsx';


var CharacteristicItem = React.createClass({
    mixins: [BlueWhiteBlinkMixin],
    getInitialState: function() {
        return {
            expanded: false,
            notifying: false
        };
    },
    componentWillReceiveProps: function(nextProps) {
        if (this.props.value !== nextProps.value) {
            if (this.props.onChange) {
                this.props.onChange();
            }
            this.blink();
        }

        if (this.props.selected === nextProps.selected && nextProps.selected === this.props.item) {
            this.setState({ expanded: nextProps.selected.expanded })
        }
    },
    componentWillUpdate: function(nextProps, nextState) {
        nextProps.item.expanded = nextState.expanded;
    },
    _onClick: function(e) {
        e.stopPropagation();

        if (this.props.onSelected) {
            this.props.onSelected(this.props.item);
        }
    },
    _onExpandAreaClick(e) {
        if (this.props.descriptors.length === 0) {
            return;
        }

        e.stopPropagation();
        this.setState({expanded: !this.state.expanded});
    },
    _onToggleNotify: function(e) {
        e.stopPropagation();
        this.setState({notifying: !this.state.notifying});
        if (this.props.item.properties.notify) {
            console.log('Toggle notify on handle ' + this.props.item.handle);
        } else { //must have indicate property
            console.log('Toggle indicate on handle ' + this.props.item.handle);
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
        const handle = Math.random(); //just need a unique value until a real handle is assigned by the driver
        const descriptor = {"handle":handle,"uuid":"","name":"New descriptor","value":""};
        descriptor.parent = this.props.item;
        this.props.item.descriptors.push(descriptor);
        if (this.props.onSelected) {
            this.props.onSelected(descriptor);
        } else {
            this.forceUpdate();
        }
    },
    _onWrite: function(value) {
        bleDriverActions.writeRequest(this.props.connectionHandle, this.props.item.valueHandle, value);
    },
    render: function() {
        const expandIcon = this.state.expanded ? 'icon-down-dir' : 'icon-right-dir';
        const iconStyle = this.props.descriptors.length === 0 && !this.props.addNew  ? { display: 'none' } : {};
        const notifyIcon = this.state.notifying ? 'icon-stop' : 'icon-play';
        const notifyIconStyle = this.props.item.properties.notify || this.props.item.properties.indicate ? {} : {display: 'none'};
        const selected = this.props.item === this.props.selected;
        const backgroundColor = selected
            ? 'rgb(179,225,245)'
            : `rgb(${Math.floor(this.state.backgroundColor.r)}, ${Math.floor(this.state.backgroundColor.g)}, ${Math.floor(this.state.backgroundColor.b)})`;

        return (
        <div>
            {/*Conditionally render first div for performance. We always have to render DescriptorItems, for right-arrow-key expansion to work.*/}
            {!this.props.item.parent.expanded ? null : <div className="characteristic-item" style={{ backgroundColor: backgroundColor }} onClick={this._onClick} ref="item">
                <div className="expand-area" onClick={this._onExpandAreaClick}>
                    <div className="bar1" />
                    <div className="bar2" />
                    <div className="icon-wrap"><i className={"icon-slim " + expandIcon} style={iconStyle}></i></div>
                </div>
                <div className="content-wrap">
                    <div className="content">
                        <div className="btn btn-primary btn-xs btn-nordic btn-notify" title="Toggle notifications" style={notifyIconStyle} onClick={this._onToggleNotify}><i className={notifyIcon}></i></div>
                        <div>
                            <div className="truncate-text" title={'[' + this.props.item.handle + '] ' + this.props.name}>{this.props.name}</div>
                            <div className="flag-line">
                                {(this.props.item.properties.getProperties()).map(function(property, index) {
                                    return (<div key={index} className="device-flag">{property}</div>)
                                })}
                            </div>
                        </div>
                        <HexOnlyEditableField value={this.props.value} insideSelector=".characteristic-item" onSaveChanges={this._onWrite} showReadButton={selected}/>
                    </div>
                </div>
            </div>}
            <div style={{display: this.state.expanded ? 'block' : 'none'}}>
                {this.props.descriptors.map((descriptor, k) =>
                    <DescriptorItem key={k} name={descriptor.name} value={descriptor.value} onChange={this._childChanged}
                        item={descriptor} selected={this.props.selected} onSelected={this.props.onSelected}  selectOnClick={this.props.selectOnClick}
                        connectionHandle={this.props.connectionHandle} />
                )}
                {this.props.addNew ? <AddNewItem text="New descriptor" id={"add-btn-" + this.props.item.handle} selected={this.props.selected} onClick={this._addDescriptor} bars={3} /> : null}
            </div>
        </div>
        );
    }
});

module.exports = CharacteristicItem;
