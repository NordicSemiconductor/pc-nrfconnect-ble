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
import DescriptorItem from './DescriptorItem';
import AddNewItem from './AddNewItem.jsx';
import HexOnlyEditableField from './HexOnlyEditableField.jsx';

import { BlueWhiteBlinkMixin } from '../utils/Effects.jsx';

export default class CharacteristicItem extends Component {
    //mixins: [BlueWhiteBlinkMixin],
    constructor(props) {
        super(props);
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

    _onExpandAreaClick(e) {
        e.stopPropagation();
        this.props.onToggleAttributeExpanded(this.props.item);
    }

    _onToggleNotify(e) {
        e.stopPropagation();
        this.props.onToggleCharacteristicNotification(this.props.item);
    }

    _childChanged() {
        if (this.props.onChange) {
            this.props.onChange();
        }

        if (!this.state.expanded) {
            console.log('Characteristic BLINKED!');
            //this.blink();
        }
    }

    _addDescriptor() {
        // TODO: Add descriptor
        //this.props.addDescriptor(this.props.item);
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
            addNew,
            selectOnClick,
            onSelectAttribute,
            onReadDescriptor,
            onWriteDescriptor,
        } = this.props;

        const {
            instanceId,
            handle,
            name,
            properties,
            value,
            expanded,
            notifying,
            discoveringChildren,
            children,
        } = item;

        const propertyList = [];

        properties.forEach((propertyValue, property) => {
            if (propertyValue) {
                propertyList.push(<div key={property} className="device-flag">{property}</div>);
            }
        });

        const childrenList = [];

        if (discoveringChildren) {
            childrenList.push(<EnumeratingAttributes key={'enumerating-descriptor'} bars={3} />);
        } else if (children) {
            children.forEach(descriptor => {
                childrenList.push(<DescriptorItem key={descriptor.instanceId}
                                                  item={descriptor}
                                                  selectOnClick={selectOnClick}
                                                  selected={selected}
                                                  onSelectAttribute={onSelectAttribute}
                                                  onChange={this._childChanged}
                                                  onRead={onReadDescriptor}
                                                  onWrite={onWriteDescriptor} />
                );
            });
        }

        const hasPossibleChildren = !(children && children.size === 0);
        const expandIconStyle = children && children.size === 0 && !addNew  ? {display: 'none'} : {};
        const expandIcon = expanded ? 'icon-down-dir' : 'icon-right-dir';
        const notifyIcon = notifying ? 'icon-stop' : 'icon-play';
        const notifyIconStyle = properties.notify || properties.indicate ? {} : {display: 'none'};
        const itemIsSelected = item.instanceId === selected;
        const backgroundColor = itemIsSelected
            ? 'rgb(179,225,245)'
            : 'white';

        return (
        <div>
            <div className="characteristic-item" style={{backgroundColor: backgroundColor}} onClick={e => this._onContentClick(e)} ref="item">
                <div className="expand-area" onClick={hasPossibleChildren ? e => this._onExpandAreaClick(e) : null}>
                    <div className="bar1" />
                    <div className="bar2" />
                    <div className="icon-wrap"><i className={"icon-slim " + expandIcon} style={expandIconStyle}></i></div>
                </div>
                <div className="content-wrap">
                    <div className="content">
                        <div className="btn btn-primary btn-xs btn-nordic btn-notify" title="Toggle notifications" style={notifyIconStyle} onClick={e => this._onToggleNotify(e)}><i className={notifyIcon}></i></div>
                        <div>
                            <div className="truncate-text" title={'[' + item.declarationHandle + '] ' + name}>{name}</div>
                            <div className="flag-line">
                                {propertyList}
                            </div>
                        </div>
                        <HexOnlyEditableField value={value.toArray()}
                                              onWrite={value => this._onWrite(value)}
                                              showReadButton={itemIsSelected}
                                              onRead={() => this._onRead()}
                                              selectParent={() => this._selectComponent()} />
                    </div>
                </div>
            </div>
            <div style={{display: expanded ? 'block' : 'none'}}>
                {childrenList}
                {addNew ? <AddNewItem key={'add-new-descriptor'}text="New descriptor" id={"add-btn-" + instanceId} selected={selected} onClick={this._addDescriptor} bars={3} /> : null}
            </div>
        </div>
        );
    }
}
