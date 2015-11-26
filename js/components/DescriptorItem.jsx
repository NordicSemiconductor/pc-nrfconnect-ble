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

import React from 'react';

import Component from 'react-pure-render/component';

import HexOnlyEditableField from './HexOnlyEditableField.jsx';
import { BlueWhiteBlinkMixin } from '../utils/Effects.jsx';

export default class DescriptorItem extends Component {
    //mixins: [BlueWhiteBlinkMixin],
    constructor(props) {
        super(props);
    }

    _onContentClick(e) {
        e.stopPropagation();
        if (this.props.onSelectAttribute) {
            this.props.onSelectAttribute(this.props.item);
        }
    }

    _onWrite(value) {
        // bleDriverActions.writeRequest(this.props.connectionHandle, this.props.item.valueHandle, value);
    }

    render() {
        const {
            item,
            selected,
            addNew,
            selectOnClick,
        } = this.props;
        const {
            instanceId,
            handle,
            name,
            value,
        } = item;

        const itemIsSelected = item === selected;
        const backgroundColor = itemIsSelected
            ? 'rgb(179,225,245)'
            : 'white';
        return (
            <div className="descriptor-item" style={{ backgroundColor: backgroundColor }} onClick={this._onContentClick.bind(this)}>
                <div className="bar1" />
                <div className="bar2" />
                <div className="bar3" />
                <div className="content-wrap">
                    <div className="content">
                        <div className="truncate-text" title={'[' + handle + '] ' + name}>{name}</div>
                        <HexOnlyEditableField value={value} insideSelector=".descriptor-item" onSaveChanges={this._onWrite} showReadButton={itemIsSelected} />
                    </div>
                </div>
            </div>
        );
    }
}
