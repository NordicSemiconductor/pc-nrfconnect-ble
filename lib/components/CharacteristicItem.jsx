/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint no-bitwise: ["error", { "allow": ["&", "|"] }] */

'use strict';

import React from 'react';

import { getUuidFormat, TEXT } from '../utils/uuid_definitions';
import AttributeItem, { CCCD_UUID } from './AttributeItem';
import DescriptorItem from './DescriptorItem';
import HexOnlyEditableField from './HexOnlyEditableField';

const NOTIFY = 1;
const INDICATE = 2;

function findCccdDescriptor(children) {
    if (!children) {
        return undefined;
    }

    return children.find(child => child.uuid === CCCD_UUID);
}

function isNotifying(cccdDescriptor) {
    if (!cccdDescriptor) {
        return false;
    }

    const valueArray = cccdDescriptor.value.toArray();

    if (valueArray.length < 2) {
        return false;
    }

    return (valueArray[0] & (NOTIFY | INDICATE)) > 0;
}

class CharacteristicItem extends AttributeItem {
    constructor(props) {
        super(props);
        this.bars = 2;
        this.attributeType = 'characteristic';
        this.childAttributeType = 'descriptor';

        this.onToggleNotify = this.onToggleNotify.bind(this);
    }

    onToggleNotify(e) {
        e.stopPropagation();

        const isDescriptorNotifying = isNotifying(this.cccdDescriptor);
        const hasNotifyProperty = this.props.item.properties.notify;
        const hasIndicateProperty = this.props.item.properties.indicate;

        if (this.cccdDescriptor === undefined) {
            return;
        }

        if (!hasNotifyProperty && !hasIndicateProperty) {
            return;
        }

        let cccdValue;
        if (!isDescriptorNotifying) {
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

    renderContent() {
        const { item, selected } = this.props;

        const { uuid, properties, value, children } = item;

        this.cccdDescriptor = findCccdDescriptor(children);

        const isLocal = this.isLocalAttribute();
        const isDescriptorNotifying = isNotifying(this.cccdDescriptor);
        const itemIsSelected = item.instanceId === selected;

        const hasCccd = this.cccdDescriptor !== undefined;
        const hasReadProperty = properties.read;
        const hasWriteProperty =
            properties.write || properties.writeWoResp || properties.reliableWr;
        const hasNotifyProperty = properties.notify;
        const hasIndicateProperty = properties.indicate;
        const hasNotifyOrIndicateProperty =
            hasNotifyProperty || hasIndicateProperty;

        const toggleNotificationsText = hasCccd
            ? 'Toggle notifications'
            : 'Toggle notifications (CCCD not discovered)';
        const notifyIconStyle =
            !isLocal && hasNotifyOrIndicateProperty ? {} : { display: 'none' };
        const notifyIcon =
            isDescriptorNotifying && hasNotifyOrIndicateProperty
                ? 'mdi mdi-stop'
                : 'mdi mdi-play';

        const showText = getUuidFormat(uuid) === TEXT;

        const propertyList = [];

        if (properties) {
            properties.toSeq().forEach((propertyValue, property) => {
                if (propertyValue) {
                    const key = property;
                    propertyList.push(
                        <div key={key} className="device-flag">
                            {property}
                        </div>
                    );
                }
            });
        }

        const onRead =
            hasReadProperty && !isLocal ? () => this.onRead() : undefined;

        const onWrite =
            hasWriteProperty || isLocal ? val => this.onWrite(val) : null;

        return (
            <div className="content">
                <div
                    className="btn btn-primary btn-xs btn-nordic btn-notify"
                    title={toggleNotificationsText}
                    disabled={!hasCccd}
                    style={notifyIconStyle}
                    onClick={this.onToggleNotify}
                    onKeyDown={() => {}}
                    role="button"
                    tabIndex={0}
                >
                    <i className={notifyIcon} />
                </div>
                <div>
                    {this.renderName()}
                    <div className="flag-line">{propertyList}</div>
                </div>
                <HexOnlyEditableField
                    value={value.toArray()}
                    onWrite={onWrite}
                    showReadButton={hasReadProperty && itemIsSelected}
                    onRead={onRead}
                    selectParent={this.selectComponent}
                    showText={showText}
                />
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

        const { children } = item;

        return children
            .valueSeq()
            .map(descriptor => (
                <DescriptorItem
                    key={descriptor.instanceId}
                    item={descriptor}
                    selected={selected}
                    onSelectAttribute={onSelectAttribute}
                    onChange={this.childChanged}
                    onRead={onReadDescriptor}
                    onWrite={onWriteDescriptor}
                />
            ));
    }
}

export default CharacteristicItem;
