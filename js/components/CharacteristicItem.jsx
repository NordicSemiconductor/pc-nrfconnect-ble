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
import DescriptorItem from './DescriptorItem';
import AddNewItem from './AddNewItem';
import HexOnlyEditableField from './HexOnlyEditableField';
import { Effects } from '../utils/Effects';
import { getInstanceIds } from '../utils/api';
import * as Colors from '../utils/colorDefinitions';

const NOTIFY = 1;
const INDICATE = 2;

const CCCD_UUID = '2902';

export default class CharacteristicItem extends Component {
    constructor(props) {
        super(props);
        this.cccdDescriptor;
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

    componentWillUnmount() {
        if (!this.animation) {
            return;
        }

        this.animation.stop();
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
            this.props.onSelectAttribute(this.props.item.instanceId);
        }
    }

    _onContentClick(e) {
        e.stopPropagation();
        this._selectComponent();
    }

    _onExpandAreaClick(e) {
        e.stopPropagation();
        this.props.onSetAttributeExpanded(this.props.item, !this.props.item.expanded);
    }

    _onToggleNotify(e) {
        e.stopPropagation();

        const isNotifying = this._isNotifying(this.cccdDescriptor);
        const hasNotifyProperty = this.props.item.properties.notify;
        const hasIndicateProperty = this.props.item.properties.indicate;

        if (this.cccdDescriptor === undefined) {
            return;
        }

        if (!hasNotifyProperty && !hasIndicateProperty) {
            return;
        }

        let cccdValue;
        if (!isNotifying) {
            if (hasNotifyProperty) {
                cccdValue = NOTIFY;
            } else {
                cccdValue = INDICATE;
            }
        } else {
            cccdValue = 0;
        }

        value = [cccdValue, 0];

        this.props.onWriteDescriptor(this.cccdDescriptor, value);
        //this.props.onToggleNotify(this.props.item);
    }

    _childChanged() {
        if (this.props.onChange) {
            this.props.onChange();
        }

        if (!this.props.item.expanded) {
            this._blink();
        }
    }

    _addDescriptor() {
        // TODO: Add descriptor
        //this.props.addDescriptor(this.props.item);
    }

    _onWrite(value) {
        this.props.onWrite(this.props.item, value);
    }



    _findCccdDescriptor(children) {
        if (!children) {
            return;
        }

        return children.find(child => child.uuid === CCCD_UUID);
    }

    _isLocalAttribute() {
        const instanceIds = getInstanceIds(this.props.item.instanceId);
        return instanceIds.device === 'local.server';
    }

    _isNotifying(cccdDescriptor) {
        if (!cccdDescriptor) {
            return false;
        }

        const valueArray = cccdDescriptor.value.toArray();

        if (valueArray.length < 2) {
            return false;
        }

        return ((valueArray[0] & (NOTIFY | INDICATE)) > 0);
    }

    render() {
        const {
            item,
            selected,
            addNew,
            selectOnClick,
            onAddDescriptor,
            onSelectAttribute,
            onReadDescriptor,
            onWriteDescriptor,
            onToggleNotify,
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
            errorMessage,
        } = item;

        const propertyList = [];

        if (properties) {
            properties.forEach((propertyValue, property) => {
                if (propertyValue) {
                    propertyList.push(<div key={property} className='device-flag'>{property}</div>);
                }
            });
        }

        const childrenList = [];

        if (discoveringChildren) {
            childrenList.push(<EnumeratingAttributes key={'enumerating-descriptor'} bars={3} />);
        } else if (children) {
            children.forEach(descriptor => {
                childrenList.push(<DescriptorItem key={descriptor.instanceId}
                                                  item={descriptor}
                                                  selected={selected}
                                                  onSelectAttribute={onSelectAttribute}
                                                  onChange={() => this._childChanged()}
                                                  onRead={onReadDescriptor}
                                                  onWrite={onWriteDescriptor} />
                );
            });
        }

        const isLocal = this._isLocalAttribute();
        const _onRead = isLocal ? undefined : () => {
            this.props.onRead(this.props.item);
        };

        this.cccdDescriptor = this._findCccdDescriptor(children);
        const hasCccd = this.cccdDescriptor !== undefined;
        const isNotifying = this._isNotifying(this.cccdDescriptor);
        const hasNotifyProperty = properties.notify;
        const hasIndicateProperty = properties.indicate;

        const hasPossibleChildren = addNew || !(children && children.size === 0);
        const expandIconStyle = children && children.size === 0 && !addNew  ? {display: 'none'} : {};
        const expandIcon = expanded ? 'icon-down-dir' : 'icon-right-dir';
        const notifyIcon = (isNotifying && (hasNotifyProperty || hasIndicateProperty)) ? 'icon-stop' : 'icon-play';
        const notifyIconStyle = !isLocal && hasCccd ? {} : {display: 'none'};
        const itemIsSelected = item.instanceId === selected;
        const errorText = errorMessage ? errorMessage : '';
        const hideErrorClass = (errorText === '') ? 'hide' : '';
        const handleText = item.declarationHandle ? ('[Handle: ' + item.declarationHandle + '] ') : '';
        const backgroundColor = itemIsSelected
            ? 'rgb(179,225,245)' //@bar1-color
            : `rgb(${Math.floor(this.backgroundColor.r)}, ${Math.floor(this.backgroundColor.g)}, ${Math.floor(this.backgroundColor.b)})`;

        return (
        <div>
            <div className='characteristic-item' style={{backgroundColor: backgroundColor}} onClick={e => this._onContentClick(e)} ref='item'>
                <div className='expand-area' onClick={hasPossibleChildren ? e => this._onExpandAreaClick(e) : null}>
                    <div className='bar1' />
                    <div className='bar2' />
                    <div className='icon-wrap'><i className={'icon-slim ' + expandIcon} style={expandIconStyle}></i></div>
                </div>
                <div className='content-wrap'>
                    <div className='content'>
                        <div className='btn btn-primary btn-xs btn-nordic btn-notify' title='Toggle notifications' style={notifyIconStyle} onClick={e => this._onToggleNotify(e)}><i className={notifyIcon}></i></div>
                        <div>
                            <div className='truncate-text' title={handleText + name}>{name}</div>
                            <div className='flag-line'>
                                {propertyList}
                            </div>
                        </div>
                        <HexOnlyEditableField value={value.toArray()}
                                              onWrite={value => this._onWrite(value)}
                                              showReadButton={itemIsSelected}
                                              onRead={_onRead}
                                              selectParent={() => this._selectComponent()} />
                        <div className={'error-label ' + hideErrorClass}>{errorText}</div>
                    </div>
                </div>
            </div>
            <div style={{display: expanded ? 'block' : 'none'}}>
                {childrenList}
                {addNew ? <AddNewItem key={'add-new-descriptor'}text='New descriptor' id={'add-btn-' + instanceId} parentInstanceId={instanceId} selected={selected} onClick={() => onAddDescriptor(item)} bars={3} /> : null}
            </div>
        </div>
        );
    }
}
