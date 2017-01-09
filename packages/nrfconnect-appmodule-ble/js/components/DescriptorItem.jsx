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
