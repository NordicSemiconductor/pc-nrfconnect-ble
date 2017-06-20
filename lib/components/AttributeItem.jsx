/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import EnumeratingAttributes from './EnumeratingAttributes';

import AddNewItem from './AddNewItem';
import * as Colors from '../utils/colorDefinitions';

import { getInstanceIds, ImmutableService, ImmutableDescriptor, ImmutableCharacteristic } from '../utils/api';
import { toHexString } from '../utils/stringUtil';

export const CCCD_UUID = '2902';

class AttributeItem extends React.PureComponent {

    constructor(props) {
        super(props);
        this.backgroundColor = Colors.getColor('brand-base');
        this.bars = 0;
        this.expandable = true;
        this.attributeType = 'attribute';
        this.childAttributeType = 'service';

        this.childChanged = this.childChanged.bind(this);
        this.selectComponent = this.selectComponent.bind(this);
        this.onExpandAreaClick = this.onExpandAreaClick.bind(this);
        this.onAddAttribute = this.onAddAttribute.bind(this);
        this.onContentClick = this.onContentClick.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.item.value !== nextProps.item.value) {
            if (this.props.onChange) {
                this.props.onChange();
            }

            this.blink();
        }
    }

    onAddAttribute() {
        const {
            item,
            onAddCharacteristic,
            onAddDescriptor,
        } = this.props;

        if (this.attributeType === 'service') {
            onAddCharacteristic(item);
        } else if (this.attributeType === 'characteristic') {
            onAddDescriptor(item);
        }
    }

    onExpandAreaClick(e) {
        e.stopPropagation();
        if (this.props.onSetAttributeExpanded) {
            this.props.onSetAttributeExpanded(this.props.item, !this.props.item.expanded);
        }
    }

    onContentClick(e) {
        e.stopPropagation();
        this.selectComponent();
    }

    onWrite(value) {
        this.props.onWrite(this.props.item, value);
    }

    onRead() {
        this.props.onRead(this.props.item);
    }

    getChildren() {
        const {
            item,
        } = this.props;

        const {
            expanded,
            discoveringChildren,
            children,
        } = item;

        const childrenList = [];

        if (discoveringChildren) {
            childrenList.push(<EnumeratingAttributes key={`enumerating-${this.childAttributeType}`} bars={this.bars + 1} />);
        } else if (children && expanded) {
            childrenList.push(this.renderChildren());
        }

        return childrenList;
    }

    childChanged() {
        if (this.props.onChange) {
            this.props.onChange();
        }

        if (!this.props.item.expanded) {
            this.blink();
        }
    }

    blink() {
        const fromColor = Colors.getColor('brand-primary');
        const toColor = Colors.getColor('brand-base');

        const fc = `rgb(${fromColor.r}, ${fromColor.g}, ${fromColor.b})`;
        const tc = `rgb(${toColor.r}, ${toColor.g}, ${toColor.b})`;

        this.bgDiv.style.transition = 'initial';
        this.bgDiv.style.backgroundColor = fc;

        setTimeout(() => {
            this.bgDiv.style.transition = 'background-color 2s';
            this.bgDiv.style.backgroundColor = tc;
        }, 25);
    }

    selectComponent() {
        if (this.props.onSelectAttribute) {
            this.props.onSelectAttribute(this.props.item.instanceId);
        }
    }

    isLocalAttribute() {
        const instanceIds = getInstanceIds(this.props.item.instanceId);
        return instanceIds.device === 'local.server';
    }

    renderContent() { // eslint-disable-line class-methods-use-this
        return null;
    }

    renderChildren() { // eslint-disable-line class-methods-use-this
        return null;
    }

    renderError() {
        const {
            item,
        } = this.props;

        const {
            errorMessage,
        } = item;

        const errorText = errorMessage || '';
        const hideErrorClass = (errorText === '') ? 'hide' : '';

        return <div className={`error-label ${hideErrorClass}`}>{errorText}</div>;
    }

    renderName() {
        const {
            item,
        } = this.props;

        const {
            handle,
            valueHandle,
            uuid,
            name,
        } = item;

        let handleText = '';
        if (handle) {
            handleText = `Handle: 0x${toHexString(handle)}, `;
        } else if (valueHandle) {
            handleText = `Value handle: 0x${toHexString(valueHandle)}, `;
        }

        return <div className={`${this.attributeType}-name truncate-text selectable`} title={`${handleText}UUID: ${uuid}`}>{name}</div>;
    }

    render() {
        const {
            item,
            selected,
            addNew,
        } = this.props;

        const {
            instanceId,
            expanded,
            children,
        } = item;

        const barList = [];

        for (let i = 0; i < this.bars; i += 1) {
            barList.push(<div key={`bar${i + 1}`} className={`bar${i + 1}`} />);
        }

        const content = this.renderContent(null);
        const childrenList = this.getChildren();

        const expandIcon = expanded ? 'icon-down-dir' : 'icon-right-dir';
        const iconStyle = (!this.expandable || (children && children.size === 0 && !addNew)) ? { display: 'none' } : {};
        const itemIsSelected = item.instanceId === selected;

        const backgroundClass = itemIsSelected ?
            'brand-background' :
            'neutral-background'; // @bar1-color

        const backgroundColor = itemIsSelected ?
            '' :
            `rgb(${Math.floor(this.backgroundColor.r)}, ${Math.floor(this.backgroundColor.g)}, ${Math.floor(this.backgroundColor.b)})`;

        return (
            <div>
                <div
                    ref={node => { this.bgDiv = node; }}
                    className={`${this.attributeType}-item ${backgroundClass}`}
                    style={{ backgroundColor }}
                    onClick={this.onContentClick}
                    role="button"
                    tabIndex={0}
                >
                    <div
                        className="expand-area"
                        onClick={this.onExpandAreaClick}
                        role="button"
                        tabIndex={0}
                    >
                        {barList}
                        <div className="icon-wrap">
                            <i className={`icon-slim ${expandIcon}`} style={iconStyle} />
                        </div>
                    </div>
                    <div className="content-wrap">
                        {content}
                    </div>
                </div>
                <div style={{ display: expanded ? 'block' : 'none' }}>
                    {childrenList}
                    { addNew &&
                        <AddNewItem
                            key={`add-new-${this.childAttributeType}`}
                            text={`New ${this.childAttributeType}`}
                            id={`add-btn-${instanceId}`}
                            parentInstanceId={instanceId}
                            selected={selected}
                            onClick={this.onAddAttribute}
                            bars={this.bars + 1}
                        />
                    }
                </div>
            </div>
        );
    }
}

AttributeItem.propTypes = {
    item: PropTypes.oneOfType([
        PropTypes.instanceOf(ImmutableService),
        PropTypes.instanceOf(ImmutableDescriptor),
        PropTypes.instanceOf(ImmutableCharacteristic),
    ]).isRequired,
    selected: PropTypes.string,
    addNew: PropTypes.bool,
    onChange: PropTypes.func,
    onRead: PropTypes.func,
    onWrite: PropTypes.func,
    onSelectAttribute: PropTypes.func,
    onAddCharacteristic: PropTypes.func,
    onAddDescriptor: PropTypes.func,
    onSetAttributeExpanded: PropTypes.func,
};

AttributeItem.defaultProps = {
    selected: null,
    addNew: false,
    onChange: null,
    onRead: null,
    onWrite: null,
    onSelectAttribute: null,
    onAddCharacteristic: null,
    onAddDescriptor: null,
    onSetAttributeExpanded: null,
};

export default AttributeItem;
