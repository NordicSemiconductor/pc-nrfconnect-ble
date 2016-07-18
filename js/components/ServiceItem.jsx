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
import CharacteristicItem from './CharacteristicItem';

export default class ServiceItem extends AttributeItem {
    constructor(props) {
        super(props);
        this.bars = 1;
        this.attributeType = 'service';
        this.childAttributeType = 'characteristic';
    }

    renderContent(children) {
        return (
            <div className='content'>
                {this.renderName()}
                {children}
            </div>
        );
    }

    renderChildren() {
        const {
            item,
            selected,
            addNew,
            selectOnClick,
            onAddDescriptor,
            onSelectAttribute,
            onSetAttributeExpanded,
            onReadCharacteristic,
            onWriteCharacteristic,
            onReadDescriptor,
            onWriteDescriptor,
        } = this.props;

        const {
            children,
        } = item;

        return children.map(characteristic =>
                        <CharacteristicItem
                                key={characteristic.instanceId}
                                item={characteristic}
                                selectOnClick={selectOnClick}
                                selected={selected}
                                onSelectAttribute={onSelectAttribute}
                                onSetAttributeExpanded={onSetAttributeExpanded}
                                onRead={onReadCharacteristic}
                                onWrite={onWriteCharacteristic}
                                onReadDescriptor={onReadDescriptor}
                                onWriteDescriptor={onWriteDescriptor}
                                onChange={() => this._childChanged()}
                                addNew={addNew}
                                onAddDescriptor={onAddDescriptor} />
            );
    }
}
