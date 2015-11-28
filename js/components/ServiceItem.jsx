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

import EnumeratingAttributes from './EnumeratingAttributes.jsx';
import CharacteristicItem from './CharacteristicItem';
import AddNewItem from './AddNewItem.jsx';

import { BlueWhiteBlinkMixin } from '../utils/Effects.jsx';

//import _ from 'underscore';

export default class ServiceItem extends Component {
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

    _onExpandAreaClick(e) {
        e.stopPropagation();
        this.props.onToggleAttributeExpanded(this.props.item);
    }

    _childChanged() {
        if (!this.props.item.expanded) {
            console.log('Service BLINKED!');
            //this.blink();
        }
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
            childrenList.push(<EnumeratingAttributes bars={2} />);
        } else if (children) {
            children.forEach(characteristic => {
                childrenList.push(<CharacteristicItem key={characteristic.instanceId}
                                                      item={characteristic}
                                                      selectOnClick={selectOnClick}
                                                      selected={selected}
                                                      onSelectAttribute={this.props.onSelectAttribute}
                                                      onToggleAttributeExpanded={this.props.onToggleAttributeExpanded}
                                                      onChange={this._childChanged}
                                                      addNew={addNew} />
                );
            });
        }

        const expandIcon = expanded ? 'icon-down-dir' : 'icon-right-dir';
        const iconStyle = children && children.size === 0 && !addNew ? { display: 'none' } : {};
        const itemIsSelected = item === selected;
        const backgroundColor = itemIsSelected
            ? 'rgb(179,225,245)'
            : 'white';
        return (
            <div>
                <div className='service-item' style={{ backgroundColor: backgroundColor }}  onClick={this._onContentClick.bind(this)}>
                    <div className='expand-area' onClick={this._onExpandAreaClick.bind(this)}>
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
                    {addNew ? <AddNewItem text='New characteristic' id={'add-btn-' + instanceId} selected={selected} onClick={this._addCharacteristic} bars={2} /> : null}
                </div>
            </div>
        );
    }
}
