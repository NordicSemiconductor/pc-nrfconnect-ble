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

import React, { PropTypes } from 'react';

import AttributeItem from './AttributeItem';
import CharacteristicItem from './CharacteristicItem';

class ServiceItem extends AttributeItem {
    constructor(props) {
        super(props);
        this.bars = 1;
        this.attributeType = 'service';
        this.childAttributeType = 'characteristic';
    }

    renderContent(children) {
        const { button } = this.props;

        return (
            <div className="content">
                {this.renderName()}
                {button &&
                    <button className="btn btn-primary btn-nordic" onClick={() => button.onClick()}>
                        <img src={button.icon} alt="" />
                    </button>
                }
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
                onChange={() => this.LchildChanged()}
                addNew={addNew}
                onAddDescriptor={onAddDescriptor}
            />,
        );
    }
}

ServiceItem.propTypes = {
    item: PropTypes.object.isRequired,
    selected: PropTypes.string,
    button: PropTypes.shape({
        icon: PropTypes.string,
        onClick: PropTypes.func,
    }),
    onAddDescriptor: PropTypes.func,
    onSelectAttribute: PropTypes.func,
    onSetAttributeExpanded: PropTypes.func,
    onReadCharacteristic: PropTypes.func,
    onWriteCharacteristic: PropTypes.func,
    onReadDescriptor: PropTypes.func,
    onWriteDescriptor: PropTypes.func,
};

export default ServiceItem;
