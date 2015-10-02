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

import HexOnlyEditableField from './HexOnlyEditableField.jsx';

import bleDriverActions from '../actions/bleDriverActions';

import { BlueWhiteBlinkMixin } from '../utils/Effects.jsx';


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
    _onClick: function() {
        if (this.props.onSelected) {
            this.props.onSelected(this.props.item);
        }
    },
    _onWrite: function(value) {
        bleDriverActions.writeRequest(this.props.connectionHandle, this.props.item.valueHandle, value);
    },
    render: function() {
        var hidden = !this.props.item.parent.expanded && !this.props.item.parent.parent.expanded;
        if (hidden) {
            return null;
        }
        var selected = this.props.item === this.props.selected;
        var backgroundColor = selected
            ? 'rgb(179,225,245)'
            : `rgb(${Math.floor(this.state.backgroundColor.r)}, ${Math.floor(this.state.backgroundColor.g)}, ${Math.floor(this.state.backgroundColor.b)})`;
        return (
            <div className="descriptor-item" style={{ backgroundColor: backgroundColor }} onClick={this._onClick}>
                <div className="bar1" />
                <div className="bar2" />
                <div className="bar3" />
                <div className="content-wrap">
                    <div className="content">
                        <div className="truncate-text" title={'[' + this.props.item.handle + '] ' + this.props.name}>{this.props.name}</div>
                        <HexOnlyEditableField value={this.props.value} insideSelector=".descriptor-item" onSaveChanges={this._onWrite} showReadButton={selected} />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = DescriptorItem;
