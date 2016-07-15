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

import AttributeItem from './AttributeItem';
import { Map, is as ImmutableIs } from 'immutable';

import HexOnlyEditableField from './HexOnlyEditableField';
import { getInstanceIds } from '../utils/api';

export default class DescriptorItem extends AttributeItem {
    constructor(props) {
        super(props);
        this.bars = 3;
        this.expandable = false;
        this.attributeType = 'descriptor';
        this.childAttributeType = '';
    }

    shouldComponentUpdate(nextProps, nextState) {
        const update = !ImmutableIs(this.props.item.value, nextProps.item.value) ||
            !ImmutableIs(this.props.item.errorMessage, nextProps.item.errorMessage) ||
            !ImmutableIs(this.props.selected, nextProps.selected) ||
            !ImmutableIs(this.props.item.name, nextProps.item.name);
        return update;
    }

    renderContent() {
        const {
            item,
            selected,
        } = this.props;

        const {
            uuid,
            instanceId,
            value,
        } = item;

        const isLocal = this._isLocalAttribute();
        const isCCCD = this._isCCCDAttribute(uuid);
        const isLocalCCCD = isLocal && isCCCD;

        const _onRead = !isLocal ?
            () => this._onRead() :
            undefined;

        const _onWrite = !isLocalCCCD ?
            value => this._onWrite(value) :
            null;

        const itemIsSelected = instanceId === selected;

        const valueList = [];

        if (isLocalCCCD && Map.isMap(value)) {
            value.forEach((cccdValue, deviceInstanceId) => {
                const address = getInstanceIds(deviceInstanceId).address;
                valueList.push((
                    <HexOnlyEditableField key={instanceId + '-' + deviceInstanceId}
                                          title={'CCCD value for device: ' + address}
                                          value={cccdValue.toArray()}
                                          onWrite={_onWrite}
                                          onRead={_onRead}
                                          showReadButton={itemIsSelected}
                                          selectParent={() => this._selectComponent()} />
                ));
            });
        } else {
            valueList.push((
                <HexOnlyEditableField key={instanceId}
                                      value={value.toArray()}
                                      onWrite={_onWrite}
                                      onRead={_onRead}
                                      showReadButton={itemIsSelected}
                                      selectParent={() => this._selectComponent()} />
            ));
        }

        return (
            <div className='content'>
                {this.renderName()}
                {valueList}
                {this.renderError()}
            </div>
        );
    }
}
