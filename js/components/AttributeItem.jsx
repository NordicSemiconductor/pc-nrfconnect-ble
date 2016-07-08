/* Copyright (c) 2016 Nordic Semiconductor. All Rights Reserved.
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

import EnumeratingAttributes from './EnumeratingAttributes';

import Component from 'react-pure-render/component';

import AddNewItem from './AddNewItem';
import { Effects } from '../utils/Effects';
import * as Colors from '../utils/colorDefinitions';

import { getInstanceIds } from '../utils/api';
import { toHexString } from '../utils/stringUtil';

export default class AttributeItem extends Component {
    constructor(props) {
        super(props);
        this.backgroundColor = Colors.getColor(Colors.WHITE);
        this.bars = 0;
        this.expandable = true;
        this.attributeType = '';
        this.childAttributeType = '';
    }

    _onContentClick(e) {
        e.stopPropagation();
        if (this.props.onSelectAttribute) {
            this.props.onSelectAttribute(this.props.item.instanceId);
        }
    }

    _onExpandAreaClick(e) {
        e.stopPropagation();
        this.props.onSetAttributeExpanded(this.props.item, !this.props.item.expanded);
    }

    _childChanged() {
        if (!this.props.item.expanded) {
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

    renderChildren() {
        return null;
    }

    renderName() {
        const {
            item,
        } = this.props;

        const {
            handle,
            uuid,
            name,
        } = item;

        const handleText = handle ? ('Handle: 0x' + toHexString(handle) + ', ') : '';
        return <div className={this.attributeType + '-name truncate-text'} title={handleText + 'UUID: ' + uuid}>{name}</div>;
    }

    renderContent(children) {
        return (
            <div className='content'>
                {this.renderName()}
                {children}
            </div>
        );
    }

    getChildren() {
        const {
            item,
        } = this.props;

        const {
            expanded,
            children,
            discoveringChildren,
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

        const childrenList = this.getChildren();

        const expandIcon = expanded ? 'icon-down-dir' : 'icon-right-dir';
        const iconStyle = !this.expandable || (children && children.size === 0 && !addNew) ? { display: 'none' } : {};
        const itemIsSelected = item.instanceId === selected;

        const backgroundClass = itemIsSelected ?
            'brand-background' : //@bar1-color
            `backgroundColor: rgb(${Math.floor(this.backgroundColor.r)}, ${Math.floor(this.backgroundColor.g)}, ${Math.floor(this.backgroundColor.b)})`;

        const content = this.renderContent(null);

        return (
            <div>
                <div className={this.attributeType + '-item ' + backgroundClass} onClick={e => this._onContentClick(e)}>
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
                            key={'add-new-' + this.attributeType}
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
