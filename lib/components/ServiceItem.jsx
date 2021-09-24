/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { ImmutableService } from '../utils/api';
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
                {button && (
                    <button
                        className="btn btn-primary btn-nordic"
                        type="button"
                        onClick={button.onClick}
                    >
                        <img src={button.icon} alt="" />
                    </button>
                )}
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

        const { children } = item;

        return children
            .valueSeq()
            .map(characteristic => (
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
                    onChange={this.childChanged}
                    addNew={addNew}
                    onAddDescriptor={onAddDescriptor}
                />
            ));
    }
}

ServiceItem.propTypes = {
    item: PropTypes.instanceOf(ImmutableService).isRequired,
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
