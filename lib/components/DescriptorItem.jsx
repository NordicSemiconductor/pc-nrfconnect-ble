/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import React from 'react';
import { is as ImmutableIs, Map } from 'immutable';

import { getInstanceIds } from '../utils/api';
import { getUuidFormat, TEXT } from '../utils/uuid_definitions';
import AttributeItem, { CCCD_UUID } from './AttributeItem';
import HexOnlyEditableField from './HexOnlyEditableField';

function isCCCDAttribute(uuid) {
    return uuid === CCCD_UUID;
}

class DescriptorItem extends AttributeItem {
    constructor(props) {
        super(props);
        this.bars = 3;
        this.expandable = false;
        this.attributeType = 'descriptor';
        this.childAttributeType = '';
    }

    shouldComponentUpdate(nextProps) {
        const update =
            !ImmutableIs(this.props.item.value, nextProps.item.value) ||
            !ImmutableIs(
                this.props.item.errorMessage,
                nextProps.item.errorMessage
            ) ||
            !ImmutableIs(this.props.selected, nextProps.selected) ||
            !ImmutableIs(this.props.item.name, nextProps.item.name);
        return update;
    }

    renderContent() {
        const { item, selected } = this.props;

        const { uuid, instanceId, value } = item;

        const isLocal = this.isLocalAttribute();
        const isCCCD = isCCCDAttribute(uuid);
        const isLocalCCCD = isLocal && isCCCD;

        const onRead = !isLocal ? () => this.onRead() : undefined;

        const onWrite = !isLocalCCCD ? val => this.onWrite(val) : null;

        const itemIsSelected = instanceId === selected;

        const valueList = [];

        const showText = getUuidFormat(uuid) === TEXT;

        if (isLocalCCCD && Map.isMap(value)) {
            value.forEach((cccdValue, deviceInstanceId) => {
                const { address } = getInstanceIds(deviceInstanceId);
                const key = `${instanceId}-${deviceInstanceId}`;
                valueList.push(
                    <HexOnlyEditableField
                        key={key}
                        title={`CCCD value for device: ${address}`}
                        value={cccdValue.toArray()}
                        onWrite={onWrite}
                        onRead={onRead}
                        showReadButton={itemIsSelected}
                        selectParent={this.selectComponent}
                    />
                );
            });
        } else {
            valueList.push(
                <HexOnlyEditableField
                    key={instanceId}
                    value={value.toArray()}
                    onWrite={onWrite}
                    onRead={onRead}
                    showReadButton={itemIsSelected}
                    selectParent={this.selectComponent}
                    showText={showText}
                />
            );
        }

        return (
            <div className="content">
                {this.renderName()}
                {valueList}
                {this.renderError()}
            </div>
        );
    }
}

export default DescriptorItem;
