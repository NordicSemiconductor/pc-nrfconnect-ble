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

import EnumeratingAttributes from './EnumeratingAttributes';
import CharacteristicItem from './CharacteristicItem';
import AddNewItem from './AddNewItem';
import { Effects } from '../utils/Effects';
import * as Colors from '../utils/colorDefinitions';

export default class ServiceItem extends Component {
    constructor(props) {
        super(props);
        this.backgroundColor = Colors.getColor(Colors.WHITE);
    }

    _onContentClick(e) {
        e.stopPropagation();
        if (this.props.onSelectAttribute) {
            this.props.onSelectAttribute(this.props.item);
        }
    }

    _onExpandAreaClick(e) {
        e.stopPropagation();
        this.props.onToggleAttributeExpanded(this.props.item);
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

    _addCharacteristic() {
        // TODO: Add characteristic
        //this.props.onAddCharacteristic(this.props.item);
    }

    /*
    //This speeds things up 2x, but breaks notifications:
    shouldComponentUpdate: function(nextProps, nextState) {
        //on key navigation, props.selected changes on every keypress, but this only affects
        //the selected node and whatever subtree contains props.selected.
        //We should avoid redrawing unless affected.
        for (var prop in nextProps) {
            if (prop === 'selected') {
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
    render() {
        const {
            item,
            selected,
            addNew,
            selectOnClick,
            onSelectAttribute,
            onToggleAttributeExpanded,
            onReadCharacteristic,
            onWriteCharacteristic,
            onReadDescriptor,
            onWriteDescriptor,
        } = this.props;
        const {
            instanceId,
            handle,
            name,
            expanded,
            discoveringChildren,
            children,
        } = item;

        const childrenList = [];

        // TODO: Add addDescriptor action
        // addDescriptor={this.props.addDescriptor}
        if (discoveringChildren) {
            childrenList.push(<EnumeratingAttributes key={'enumerating-characteristics'} bars={2} />);
        } else if (children) {
            children.forEach(characteristic => {
                childrenList.push(<CharacteristicItem key={characteristic.instanceId}
                                                      item={characteristic}
                                                      selectOnClick={selectOnClick}
                                                      selected={selected}
                                                      onSelectAttribute={onSelectAttribute}
                                                      onToggleAttributeExpanded={onToggleAttributeExpanded}
                                                      onRead={onReadCharacteristic}
                                                      onWrite={onWriteCharacteristic}
                                                      onReadDescriptor={onReadDescriptor}
                                                      onWriteDescriptor={onWriteDescriptor}
                                                      onChange={() => this._childChanged()}
                                                      addNew={addNew} />
                );
            });
        }

        const expandIcon = expanded ? 'icon-down-dir' : 'icon-right-dir';
        const iconStyle = children && children.size === 0 && !addNew ? { display: 'none' } : {};
        const itemIsSelected = item.instanceId === selected;
        const backgroundColor = itemIsSelected
            ? 'rgb(179,225,245)'
            : `rgb(${Math.floor(this.backgroundColor.r)}, ${Math.floor(this.backgroundColor.g)}, ${Math.floor(this.backgroundColor.b)})`;

        return (
            <div>
                <div className='service-item' style={{ backgroundColor: backgroundColor }} onClick={e => this._onContentClick(e)}>
                    <div className='expand-area' onClick={e => this._onExpandAreaClick(e)}>
                        <div className='bar1' />
                        <div className='icon-wrap'><i className={'icon-slim ' + expandIcon} style={iconStyle}></i></div>
                    </div>
                    <div className='content-wrap'>
                        <div className='content'>
                            <div className='service-name truncate-text' title={'[' + handle + '] ' + name}>{name}</div>
                        </div>
                    </div>
                </div>
                <div style={{display: expanded ? 'block' : 'none'}}>
                    {childrenList}
                    {addNew ? <AddNewItem key='add-new-characteristic' text='New characteristic' id={'add-btn-' + instanceId} selected={selected} onClick={this._addCharacteristic} bars={2} /> : null}
                </div>
            </div>
        );
    }
}
