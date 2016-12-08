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
import AttributeItem, { CCCD_UUID } from './AttributeItem';

import DescriptorItem from './DescriptorItem';
import HexOnlyEditableField from './HexOnlyEditableField';
import { TEXT, getUuidFormat } from '../utils/uuid_definitions';

const NOTIFY = 1;
const INDICATE = 2;

export default class CharacteristicItem extends AttributeItem {
    constructor(props) {
        super(props);
        this.bars = 2;
        this.attributeType = 'characteristic';
        this.childAttributeType = 'descriptor';
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

        const value = [cccdValue, 0];

        this.props.onWriteDescriptor(this.cccdDescriptor, value);
    }

    _findCccdDescriptor(children) {
        if (!children) {
            return;
        }

        return children.find(child => child.uuid === CCCD_UUID);
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

    renderContent() {
        const {
            item,
            selected,
        } = this.props;

        const {
            uuid,
            properties,
            value,
            children,
        } = item;

        this.cccdDescriptor = this._findCccdDescriptor(children);

        const isLocal = this._isLocalAttribute();
        const isNotifying = this._isNotifying(this.cccdDescriptor);
        const itemIsSelected = item.instanceId === selected;

        const hasCccd = this.cccdDescriptor !== undefined;
        const hasReadProperty = properties.read;
        const hasWriteProperty = properties.write || properties.write_wo_resp || properties.reliable_wr;
        const hasNotifyProperty = properties.notify;
        const hasIndicateProperty = properties.indicate;
        const hasNotifyOrIndicateProperty = hasNotifyProperty || hasIndicateProperty;

        const toggleNotificationsText = hasCccd ? 'Toggle notifications' : 'Toggle notifications (CCCD not discovered)';
        const notifyIconStyle = !isLocal && hasNotifyOrIndicateProperty ? {} : { display: 'none' };
        const notifyIcon = (isNotifying && hasNotifyOrIndicateProperty) ? 'icon-stop' : 'icon-play';

        const showText = getUuidFormat(uuid) === TEXT;

        const propertyList = [];

        if (properties) {
            properties.forEach((propertyValue, property) => {
                if (propertyValue) {
                    propertyList.push(<div key={property} className='device-flag'>{property}</div>);
                }
            });
        }

        const _onRead = (hasReadProperty && !isLocal) ?
            () => this._onRead() :
            undefined;

        const _onWrite = (hasWriteProperty || isLocal) ?
            value => this._onWrite(value) :
            null;

        return (
            <div className='content'>
                <div className='btn btn-primary btn-xs btn-nordic btn-notify'
                    title={toggleNotificationsText}
                    disabled={!hasCccd}
                    style={notifyIconStyle}
                    onClick={e => this._onToggleNotify(e)}>
                    <i className={notifyIcon} />
                </div>
                <div>
                    {this.renderName()}
                    <div className='flag-line'>
                        {propertyList}
                    </div>
                </div>
                <HexOnlyEditableField value={value.toArray()}
                                      onWrite={_onWrite}
                                      showReadButton={hasReadProperty && itemIsSelected}
                                      onRead={_onRead}
                                      selectParent={() => this._selectComponent()}
                                      showText={showText} />
                {this.renderError()}
            </div>
        );
    }

    renderChildren() {
        const {
            item,
            selected,
            onSelectAttribute,
            onReadDescriptor,
            onWriteDescriptor,
        } = this.props;

        const {
            children,
        } = item;

        return children.map(descriptor =>
                    <DescriptorItem key={descriptor.instanceId}
                            item={descriptor}
                            selected={selected}
                            onSelectAttribute={onSelectAttribute}
                            onChange={() => this._childChanged()}
                            onRead={onReadDescriptor}
                            onWrite={onWriteDescriptor} />
                    );
    }
}
