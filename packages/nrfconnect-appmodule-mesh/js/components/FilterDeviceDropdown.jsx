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

import React, { Component } from 'react';

import { DropdownButton, MenuItem, } from 'react-bootstrap';

const DropdownItem = props => {
    const {
        afterClick,
        label,
        id,
        onClick,
        onDeclick,
        active,
        ...rest
    } = props;
    return (
        <MenuItem eventKey={id}
        className={active && active() ? 'active' : ''}
            {...rest}
            onClick={evt => {
                const active = toggleParentActive(evt.target)
                if (active && onClick) {
                    onClick(id);
                } else if (onDeclick) {
                    onDeclick(id);
                }
                if (afterClick) {
                    afterClick();
                }
            }}
        >
        {label}
        </MenuItem>
    )
}

/// If the node is active, remove that class.
/// If it is not acitve, make it active.
/// Return wether the node is active or not after
/// the toggle.
const toggleParentActive = node => {
    const parent = node.parentNode;
    for (let cls of parent.classList) {
        if (cls === 'active') {
            parent.classList.remove('active')
            return false;
        }
    }
    parent.classList.add('active');
    return true;
}


export default class DeviceDropdown extends Component {
    constructor(props) {
        super(props)
        this.children = {};
        // Default selection is all
        for (let label of props.labels) {
            this.children[label] = true;
        }
    }

    getSelected() {
        let ret = []
        for (let key of Object.keys(this.children)) {
            if (this.children[key])
                ret.push(key);
        }
        return ret;
    }

    render() {
        const { labels, onClick } = this.props;

        if (labels.length === 0) {
            // There are no labels available.
            // Show a message, and gray the button out.
            return (
                <DropdownButton
                dropup
                pullRight
                id={'checkbox-dropdown-filterdev'}
                className='btn-nordic btn-xs'
                bsStyle='primary'
                title={'Filter devices'} >
                    <DropdownItem label='No connected devices'
                        id='no-devices'
                        active={false}
                        disabled={true}
                        />
                </DropdownButton>
            );
        }


        // New labels are set to true
        for (let label of labels)
            if (this.children[label] === undefined)
                this.children[label] = true;

        return (
            <DropdownButton
                dropup
                pullRight
                id={'checkbox-dropdown-filterdev'}
                className='btn-nordic btn-xs'
                bsStyle='primary'
                title={'Filter devices'} >
                {
                    labels.map(label => (
                        <DropdownItem label={label}
                        key={label}
                        id={label}
                        active={() => this.children[label]}
                        afterClick={() => onClick(this.getSelected()) }
                        onClick={label => {
                            this.children[label] = true;
                        }}
                        onDeclick={label => {
                            this.children[label] = false;
                        }}
                        />
                    ))
                }
          </DropdownButton>
        )
    }
}
