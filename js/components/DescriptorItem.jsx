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

import HexOnlyEditableField from './HexOnlyEditableField';
import { Effects } from '../utils/Effects';
import * as Colors from '../utils/colorDefinitions';

export default class DescriptorItem extends Component {
    constructor(props) {
        super(props);
        this.backgroundColor = Colors.getColor(Colors.WHITE);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.item.value !== nextProps.item.value) {
            if (this.props.onChange) {
                this.props.onChange();
            };

            this._blink();
        }
    }

    _blink() {
        if (this.animation) {
            this.animation.stop();
        }

        const fromColor = Colors.getColor(Colors.SOFT_BLUE);
        const toColor = Colors.getColor(Colors.WHITE);
        this.animation = Effects.blink(this, 'backgroundColor', fromColor, toColor);
    }

    _selectComponent() {
        if (this.props.onSelectAttribute) {
            this.props.onSelectAttribute(this.props.item);
        }
    }

    _onContentClick(e) {
        e.stopPropagation();
        this._selectComponent();
    }

    _onWrite(value) {
        this.props.onWrite(this.props.item, value);
    }

    _onRead() {
        this.props.onRead(this.props.item);
    }

    render() {
        const {
            item,
            selected,
        } = this.props;
        const {
            instanceId,
            handle,
            name,
            value,
            errorMessage,
        } = item;

        const itemIsSelected = instanceId === selected;
        const errorText = errorMessage ? errorMessage : '';
        const hideErrorClass = (errorText === '') ? 'hide' : '';
        const backgroundColor = itemIsSelected
            ? 'rgb(179,225,245)'
            : `rgb(${Math.floor(this.backgroundColor.r)}, ${Math.floor(this.backgroundColor.g)}, ${Math.floor(this.backgroundColor.b)})`;

        return (
            <div className='descriptor-item' style={{ backgroundColor: backgroundColor }} onClick={e => this._onContentClick(e)}>
                <div className='bar1' />
                <div className='bar2' />
                <div className='bar3' />
                <div className='content-wrap'>
                    <div className='content'>
                        <div className='truncate-text' title={'[' + handle + '] ' + name}>{name}</div>
                        <HexOnlyEditableField value={value.toArray()}
                                              onWrite={value => this._onWrite(value)}
                                              onRead={() => this._onRead()}
                                              showReadButton={itemIsSelected}
                                              selectParent={() => this._selectComponent()} />
                        <div className={'error-label ' + hideErrorClass}>{errorText}</div>
                    </div>
                </div>
            </div>
        );
    }
}
