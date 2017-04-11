/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

import React from 'react';

import EnumeratingAttributes from './EnumeratingAttributes';

import AddNewItem from './AddNewItem';
import { Effects } from '../utils/Effects';
import * as Colors from '../utils/colorDefinitions';

import { getInstanceIds } from '../utils/api';
import { toHexString } from '../utils/stringUtil';

export const CCCD_UUID = '2902';

export default class AttributeItem extends React.PureComponent {
    constructor(props) {
        super(props);
        this.backgroundColor = Colors.getColor('brand-base');
        this.bars = 0;
        this.expandable = true;
        this.attributeType = 'attribute';
        this.childAttributeType = 'service';
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.item.value !== nextProps.item.value) {
            if (this.props.onChange) {
                this.props.onChange();
            }

            this._blink();
        }
    }

    componentWillUnmount() {
        if (!this.animation) {
            return;
        }

        this.animation.stop();
    }

    _onContentClick(e) {
        e.stopPropagation();
        this._selectComponent();
    }

    _onExpandAreaClick(e) {
        e.stopPropagation();
        this.props.onSetAttributeExpanded(this.props.item, !this.props.item.expanded);
    }

    _childChanged() {
        if (this.props.onChange) {
            this.props.onChange();
        }

        if (!this.props.item.expanded) {
            this._blink();
        }
    }

    _blink() {
        if (this.animation) {
            this.animation.stop();
        }

        const fromColor = Colors.getColor('brand-primary');
        const toColor = Colors.getColor('brand-base');
        this.animation = Effects.blink(this, 'backgroundColor', fromColor, toColor);
    }

    _selectComponent() {
        if (this.props.onSelectAttribute) {
            this.props.onSelectAttribute(this.props.item.instanceId);
        }
    }

    onAddAttribute(item) {
        const {
            onAddCharacteristic,
            onAddDescriptor,
        } = this.props;

        if (this.attributeType === 'service') {
            onAddCharacteristic(item);
        } else if (this.attributeType === 'characteristic') {
            onAddDescriptor(item);
        }
    }

    _isLocalAttribute() {
        const instanceIds = getInstanceIds(this.props.item.instanceId);
        return instanceIds.device === 'local.server';
    }

    _isCCCDAttribute(uuid) {
        return uuid === CCCD_UUID;
    }

    _onWrite(value) {
        this.props.onWrite(this.props.item, value);
    }

    _onRead() {
        this.props.onRead(this.props.item);
    }

    renderChildren() {
        return null;
    }

    renderName() {
        const {
            item,
        } = this.props;

        const {
            handle,
            valueHandle,
            uuid,
            name,
        } = item;

        let handleText = '';
        if (handle) {
            handleText = `Handle: 0x${toHexString(handle)}, `;
        } else if (valueHandle) {
            handleText = `Value handle: 0x${toHexString(valueHandle)}, `;
        }

        return <div className={this.attributeType + '-name truncate-text'} title={handleText + 'UUID: ' + uuid}>{name}</div>;
    }

    renderError() {
        const {
            item,
        } = this.props;

        const {
            errorMessage,
        } = item;

        const errorText = errorMessage ? errorMessage : '';
        const hideErrorClass = (errorText === '') ? 'hide' : '';

        return <div className={'error-label ' + hideErrorClass}>{errorText}</div>;
    }

    renderContent(children) {
        return null;
    }

    getChildren() {
        const {
            item,
        } = this.props;

        const {
            expanded,
            discoveringChildren,
            children,
        } = item;

        const childrenList = [];

        if (discoveringChildren) {
            childrenList.push(<EnumeratingAttributes key={'enumerating-' + this.childAttributeType} bars={this.bars + 1} />);
        } else if (children && expanded) {
            childrenList.push(this.renderChildren());
        }

        return childrenList;
    }

    render() {
        const {
            item,
            selected,
            addNew,
        } = this.props;

        const {
            instanceId,
            expanded,
            children,
        } = item;

        const barList = [];

        for (let i = 0; i < this.bars; i++) {
            barList.push(<div key={'bar' + (i + 1)} className={'bar' + (i + 1)} />);
        }

        const content = this.renderContent(null);
        const childrenList = this.getChildren();

        const expandIcon = expanded ? 'icon-down-dir' : 'icon-right-dir';
        const iconStyle = !this.expandable || (children && children.size === 0 && !addNew) ? { display: 'none' } : {};
        const itemIsSelected = item.instanceId === selected;

        const backgroundClass = itemIsSelected ?
            'brand-background' :
            'neutral-background';//@bar1-color

        const backgroundColor = itemIsSelected ?
            '' :
            `rgb(${Math.floor(this.backgroundColor.r)}, ${Math.floor(this.backgroundColor.g)}, ${Math.floor(this.backgroundColor.b)})`;

        return (
            <div>
                <div className={this.attributeType + '-item ' + backgroundClass} style={{ backgroundColor }} onClick={e => this._onContentClick(e)}>
                    <div className='expand-area' onClick={e => this._onExpandAreaClick(e)}>
                        {barList}
                        <div className='icon-wrap'>
                            <i className={'icon-slim ' + expandIcon} style={iconStyle} />
                        </div>
                    </div>
                    <div className='content-wrap'>
                        {content}
                    </div>
                </div>
                <div style={{ display: expanded ? 'block' : 'none' }}>
                    {childrenList}
                    { addNew ?
                        <AddNewItem
                            key={'add-new-' + this.childAttributeType}
                            text={'New ' + this.childAttributeType}
                            id={'add-btn-' + instanceId}
                            parentInstanceId={instanceId}
                            selected={selected}
                            onClick={() => this.onAddAttribute(item)}
                            bars={this.bars + 1} /> :
                        null
                    }
                </div>
            </div>
        );
    }
}
