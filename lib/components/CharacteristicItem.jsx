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
        const hasWriteProperty = properties.write || properties.writeWoResp || properties.reliableWr;
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
